const express = require('express')
const { GroupName } = require('../models/groupName')
const mongoose = require('mongoose')
const route = express.Router()



// login admin
route.post('/admin/login', async (req, res) => {
    const msg = 'admin login'
    try {
        const { user_name, password } = req.body
        if (!user_name || !password) throw new Error('invalid data..!')
        const admin = await mongoose.model('admin').findByCredentials(user_name, password)
        res.send({ code: 200, success: true, message: msg, data: admin })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})


// get all group name
route.get('/admin/group', async (req, res) => {
    const msg = 'all groups'
    try {
        let group = await mongoose.model('group').aggregate([
            {
                $group: {
                    _id: null,
                    group: {
                        $addToSet: {
                            _id: { $convert: { input: '$_id', to: 'string' } },
                            group_icon: '$group_icon',
                            group_name: '$group_name',
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    group: 1
                }
            }
        ])
        group = group.length > 0 ? group[0] : { group }
        res.status(200).send({ code: 200, success: true, message: msg, data: group })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})



// create group
route.post('/create/group', async (req, res) => {
    const msg = 'group created'
    try {
        const { id, group, groupIcon: group_icon } = req.body
        if (!id || !group || !group_icon) throw new Error('invalid data..!')

        const admin = await mongoose.model('admin').findById(id)
        const groupData = { group_icon, group_name: group }
        admin.group.push(groupData)

        const data = { user: admin.user_name, message: { userId: id, username: admin.name, message: `welcome to ${group}`, profile: '', time: Date.now() } }

        var groupCheck = await mongoose.model('group').findOne({ group_name: group.trim() })
        if (groupCheck) throw new Error("Group alredy existing")
        GroupName(group)
        await mongoose.model(group.trim())(data).save()
        await mongoose.model('group')(groupData).save()
        await admin.save()
        res.send({ code: 201, success: true, message: msg })
    } catch (error) {
        res.send({ code: 400, success: false, message: error.message })
    }
})





module.exports = route 