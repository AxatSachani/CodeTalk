const express = require('express')
const route = express.Router()
const { GroupName } = require('../models/groupName')
const moment = require('moment')
const mongoose = require('mongoose')
const { sendOTPMail } = require('../middleware/email')


const courier = require("@trycourier/courier").CourierClient({ authorizationToken: "pk_prod_F4TFS1C8TX47Q5NWXQP7J73RQWZ4" });

var email = function (user_name, username, otp) {
    console.log(user_name, username, otp);
    courier.send({
        message: {
            to: {
                email: `${user_name}`,
            },
            template: "Q77MRX6Y764GYNM3NQMGFA088VET",
            data: {
                name: `${username}`,
                user: `${user_name}`,
                otp: `${otp}`,
            },
        },
    });
}


// login user
route.post('/user/login', async (req, res) => {
    const msg = 'user login'
    try {
        const { user_name, password } = req.body
        if (!user_name || !password) throw new Error('invalid data..!')
        const user = await mongoose.model('user').findByCredentials(user_name, password)
        res.send({ code: 200, success: true, message: msg, data: user })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})

route.post('/message', async (req, res) => {
    const msg = 'message sent'
    try {
        const { group, id, message } = req.body
        if (!group || !id || !message) throw new Error('invalid data..!')
        const time = moment(Date.now()).format('DD/MM/YYYY hh:mm')
        const data = { id, message, time }
        GroupName(group)
        const groupData = await mongoose.model(group).updateOne({}, { $push: { message: data } })
        res.send({ code: 200, success: true, message: msg, data: groupData.message })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})


// user all group
route.post('/user/group', async (req, res) => {
    const msg = 'user all group'
    try {
        const { user_name } = req.body
        if (!user_name) throw new Error('invalid data..!')
        const user = await mongoose.model('user').findOne({ user_name }).select({ _id: 0, group: 1 })
        if (!user) throw new Error('invalid user name..!')
        res.send({ code: 200, success: true, message: msg, data: { group: user.group } })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})

// cron.schedule(' * * * * *', async (req, res) => {
//     try {
//         const groups = await Group.findOne({})
//         console.log(groups.group.length);
//         for (var i = 0; i < groups.group.length; i++) {
//             console.log('here');
//             const name = GroupName(groups.group[i])
//             const ia = await name.findOne({})
//             console.log(ia.message);
//             ia.message.splice(0, ia.message.length);
//             await ia.save()
//         }
//         console.log('done')
//     } catch (error) {
//         console.log(error);
//     }
// });



// forget password
route.post('/generate-otp', async (req, res) => {
    const msg = "OTP send"
    try {
        const { user_name, isAdmin } = req.body
        if (!user_name || typeof isAdmin == 'undefined') throw new Error('invalid data..!')

        const otp = Math.floor(Math.random() * (9572 - 1082)) + 1082
        if (isAdmin == 'true') {
            const admin = await mongoose.model('admin').findOne({ user_name })
            if (!admin) throw new Error('invalid username')
            const createAt = Date.now()
            const expirAt = Date.now() + 120000
            const query = { user_name }
            const update = { user_name, otp, createAt, expirAt }
            const options = { upsert: true, new: true, setDefaultsOnInsert: true }
            await mongoose.model('forgetPass').updateOne(query, update, options)
            sendOTPMail(user_name, admin.name, otp)
        }
        if (isAdmin == 'false') {
            const user = await mongoose.model('user').findOne({ user_name })
            if (!user) throw new Error('invalid username')

            const createAt = Date.now()
            const expirAt = Date.now() + 120000
            const query = { user_name }
            const update = { user_name, otp, createAt, expirAt }
            const options = { upsert: true, new: true, setDefaultsOnInsert: true }
            await mongoose.model('forgetPass').updateOne(query, update, options)
            sendOTPMail(user_name, user.name, otp)
        }
        res.send({ code: 200, success: true, message: msg, data: otp })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})


// forget password
route.post('/forget-password', async (req, res) => {
    const msg = 'password change'
    try {
        const { password, user_name, isAdmin } = req.body
        if (!password || !user_name || typeof isAdmin == 'undefined') throw new Error('invalid data..!')

        const dataCheck = await mongoose.model('forgetPass').findOne({ user_name })
        if (!dataCheck) throw new Error('create otp first..!')

        if (isAdmin == 'true') {
            const admin = await mongoose.model('admin').findOne({ user_name })
            if (!admin) throw new Error('invalid username')
            admin.password = password
            await admin.save()
            await mongoose.model('forgetPass').findOneAndDelete({ user_name })
        }
        if (isAdmin == 'false') {
            const user = await mongoose.model('user').findOne({ user_name })
            if (!user) throw new Error('invalid username')
            user.password = password
            await user.save()
            await mongoose.model('forgetPass').findOneAndDelete({ user_name })
        }
        res.send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})




module.exports = route
