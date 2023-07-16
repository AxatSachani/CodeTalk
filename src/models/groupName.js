const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    user: [{
        type: String,
        required: true,
        trim: true
    }],
    message: [{
        type: Object,
        userId: {
            type: String,
        },
        username: {
            type: String,
        },
        message: {
            type: String,
        },
        profile: {
            type: String,
        },
        time: {
            type: String,
        }
    }]
}, {
    collation: {
        locale: 'en',
        strength: 2
    }
})

// filter response data
Schema.methods.toJSON = function () {
    const data = this
    const groupData = data.toObject()
    delete groupData.__v
    delete groupData._id
    return groupData
}



const GroupName = function (name) {
    const groupName = mongoose.model(`${name}`, Schema)
    return groupName
}

module.exports = {
    GroupName
}