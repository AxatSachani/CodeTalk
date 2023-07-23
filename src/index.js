const express = require('express')
const socketio = require('socket.io')
const http = require('http')
require('dotenv').config()
require('./database/database')
const bodyParser = require('body-parser')
const { GroupName } = require('./models/groupName')
const { generateMessage } = require('./module/module')
const route = require('./route')

const mongoose = require('mongoose')




const app = express()
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const { SERVERPORT, SOCKETPORT } = process.env


const server = http.createServer(app)
const io = socketio(server)

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,POST,PATCH')
    res.setHeader('Access-Control-Allow-Headers', '*')
    res.setHeader('Access-Control-Allow-Credentials', '*')
    res.set('Cache-Control', 'no-store')
    next()
})


app.use(route)
app.get('/', async (req, res) => { res.send('connected') })


io.on('connection', (socket) => {
    socket.on('join', (data) => {   //data => id(userId), username, room
        socket.join(data.room)
        socket.emit('join', 'user added')
    })

    socket.on('messages', async (data) => {   //data => id(userId), username, room
        GroupName(data.group)  // group name (Card,Rummy...)
        const groupData = await mongoose.model(data.group).findOne({})
        socket.emit('messages', groupData)
    })

    socket.on('message', async (data) => {  //message => id(userId), username, room, text(message)
        let client
        let createAt = new Date().getTime()
        let message
        GroupName(data.group)  // group name (Card,Rummy...)
        let groupData = await mongoose.model(data.group).findOne({})
        if (!groupData) throw new Error('deleted')

        if (data.isAdmin) {
            client = await mongoose.model('admin').findById(data.id)
            io.to(data.room).emit('message', generateMessage(client.id, client.name, data.room, data.message, data.isAdmin, createAt))
            message = { userId: client.id, username: client.name, message: data.message, profile: "", time: createAt }
            groupData.message.push(message)
            await groupData.save()
        } else {
            client = await mongoose.model('user').findById(data.id)
            io.to(data.room).emit('message', generateMessage(client.id, client.name, data.room, data.message, data.isAdmin, createAt, profile = client.user_profile))
            message = { userId: client.id, username: client.name, message: data.message, profile: client.user_profile, time: createAt }
            groupData.message.push(message)
            await groupData.save()
        }
    })
    socket.on('diconnect', () => {
        console.log('close');
    })

})



app.listen(SERVERPORT, () => {
    console.log(`Server running on ${SERVERPORT}`);
})

server.listen(SOCKETPORT, () => {
    console.log(`Socket on ${SOCKETPORT}`);
})




// http://192.168.1.7:3030/admin/login
