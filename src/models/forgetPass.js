const mongoose = require("mongoose");
const moment = require('moment')


const ForgetPassSchema = new mongoose.Schema({

    user_name: {
        type: String
    },
    otp: {
        type: Number
    },
    createAt: {
        type: String,
        default: Date.now()
    },
    expirAt: {
        type: String,
        default: Date.now() + 120000
    }
}, {
    collation: {
        locale: 'en',
        strength: 2
    }
})

const ForgetPass = mongoose.model('forgetPass', ForgetPassSchema)

module.exports = ForgetPass