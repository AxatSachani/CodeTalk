const mongoose = require("mongoose");
const validator = require('validator')
const bcrypt = require('bcrypt')


const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    user_name: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        // validate(value) {
        //     if (!validator.isEmail(value)) {
        //         throw new Error(`Invalid emailId`)
        //     }
        // },
        require: true
    },
    group: [{
        group_icon: {
            type: String
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
}, {
    collation: {
        locale: 'en',
        strength: 2
    }
})

// filter response data
AdminSchema.methods.toJSON = function () {
    const admin = this
    const adminData = admin.toObject()
    delete adminData.password
    delete adminData.__v
    return adminData
}


// change password into bcrypt
AdminSchema.pre('save', async function (next) {
    const admin = this
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 12)
    }
    next()
})

// login data check
AdminSchema.statics.findByCredentials = async function (user_name, password) {
    const admin = await Admin.findOne({ user_name })
    if (!admin) {
        throw new Error('Admin not found')
    } else {
        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) {
            throw new Error('Wrong Password')
        }
        return admin
    }
}


const Admin = mongoose.model('admin', AdminSchema)
module.exports = Admin