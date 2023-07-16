const express = require('express')
const mongoose = require('mongoose')
const route = express.Router()
const { GroupName } = require('../models/groupName')
const validator = require('validator')
const crypto = require('crypto')
const { toFormat } = require('../module/module')
const { sendInviteMail } = require('../middleware/email')

// add user in group 
route.post('/add/user', async (req, res) => {
    const msg = 'user added'
    try {
        const { group, user_name, username: name } = req.body
        if (!group || !user_name || !name) throw new Error('invalid data..!')
        const groupName = group.toLowerCase()
        var username = toFormat(name)
        const password = crypto.randomBytes(5).toString('hex')

        //check user_name name is valid or not
        if (!validator.isEmail(user_name)) {
            throw new Error('Invalid user name')
        }
        //check group name is existing or not
        const group_Data = await mongoose.model('group').findOne({ group_name: groupName })
        if (!group_Data) throw new Error(`'${groupName}' not existing`)

        // check user existing in group
        GroupName(groupName)
        const groupData = await mongoose.model(groupName).findOne({ user: { $exits: 1 }, user: user_name })
        if (groupData) throw new Error(`'${user_name}' existing in group`)
        await mongoose.model(groupName).updateOne({}, { $push: { user: user_name } })

        // insert data in whole user tables
        const userCheck = await mongoose.model('user').findOneAndUpdate({ user_name }, { $push: { group: group_Data } })
        if (!userCheck) {
            const userData = await mongoose.model('user')({ name: username, user_name: user_name, group: group_Data, password: password })
            sendInviteMail(user_name, username, groupName, password)
            await userData.save()
        }
        res.send({ code: 201, success: true, message: msg })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})


// delete (remove) user from group
route.post('/delete/user', async (req, res) => {
    const msg = 'user deleted'
    try {
        const { group, user_name } = req.body
        if (!group || !user_name) throw new Error('invalid data..!')
        const group_name = group.toLowerCase()
        GroupName(group_name)
        //check user_name name is valid or not
        if (!validator.isEmail(user_name)) {
            throw new Error('Invalid user name')
        }
        // delete from Particuler group data
        const userdata = await mongoose.model('user').findOneAndUpdate({ user_name }, { $pull: { group: { group_name: group_name } } })
        if (  userdata) await mongoose.model(group_name).updateOne({}, { $pull: { user: user_name } })

        // delete from User data 
        res.send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})

// clear history
route.post('/clear/history', async (req, res) => {
    const msg = 'history clear'
    try {
        const { group: group_name } = req.body
        if (!group_name) throw new Error('invalid data..!')

        GroupName(group_name)
        const data = await mongoose.model(group_name).findOne({})
        data.message = data.message[0]
        await data.save()
        const message = data.message
        res.send({ code: 200, success: true, message: message })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})

//delete group
route.post('/delete/group', async (req, res) => {
    const msg = 'group deleted'
    try {
        const { group } = req.body
        if (!group) throw new Error('invalid data..!')

        // delete from all Groups list    
        await mongoose.model('group').findOneAndDelete({ group_name: group })

        // delete from User data 
        await mongoose.model('user').updateMany({ 'group.group_name': group }, { $pull: { group: { group_name: group } } })

        // delete from Admin table
        await mongoose.model('admin').updateMany({}, { $pull: { group: { group_name: group } } })

        GroupName(group)
        mongoose.deleteModel(group)
        res.send({ code: 200, success: true, message: msg })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})


//users list in particuler group
route.post('/group/user', async (req, res) => {
    var msg = 'user list'
    try {
        const { group } = req.body
        if (!group) throw new Error('invalid data..!')

        GroupName(group)
        const user = await mongoose.model(group).aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: 'user_name',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0,
                    name: '$user.name',
                    user_name: '$user.user_name',
                    user_profile: '$user.user_profile'
                }
            }
        ])
        res.send({ code: 200, success: true, message: msg, data: user })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})


module.exports = route