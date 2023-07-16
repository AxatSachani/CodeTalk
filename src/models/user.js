const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true,
        trim: true
    },
    user_name: {
        type: String,
    },
    group: [{
        group_icon: {
            type: String,
            // default: Math.floor(Math.random() * (7)) + 1
        },
        group_name: {
            type: String
        }
    }],
    password: {
        type: String,
        required: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error('password must be contain atleast 6 characters')
            } else if (value.toLowerCase().includes('password')) {
                throw new Error(`Password can not contain ${value}`)
            } else if (value.endsWith(' ')) {
                throw new Error(`Password can not end with space (' ') `)
            }
        }
    },
    user_profile: {
        type: String,
        default: Math.floor(Math.random() * (7)) + 1

    }
}, {
    collation: {
        locale: 'en',
        strength: 2
    }
})


// filter response data
UserSchema.methods.toJSON = function () {
    const user = this
    const userData = user.toObject()
    delete userData.password
    delete userData.__v
    return userData
}


// change password into bcrypt
UserSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password =await bcrypt.hash(user.password, 12)
    }
    next()
})

// login data check
UserSchema.statics.findByCredentials = async function (user_name, password) {

    const user = await User.findOne({ user_name })
    if (!user) {
        throw new Error('user not found')
    } else {
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new Error('Wrong Password')
        }
        return user
    }
}



const User = mongoose.model('user', UserSchema)
module.exports = User