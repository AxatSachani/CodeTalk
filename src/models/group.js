const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
    group_icon: {
        type: String,
        default: Math.floor(Math.random() * (7)) + 1
    },
    group_name: {
        type: String,
        required: true
    }
}, {
    collation: {
        locale: 'en',
        strength: 2
    }
})



// filter response data
GroupSchema.methods.toJSON = function () {
    const group = this
    const groupData = group.toObject()
    delete groupData.__v
    delete groupData._id
    return groupData
}


const Group = mongoose.model('group', GroupSchema)
module.exports = Group