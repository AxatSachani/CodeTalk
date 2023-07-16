const toFormat = function (name) {
    for (let i = 0; i < name.length; i++) {
        if (name.length == 0) {
            return
        }
        var type
        if (i == 0) {
            type = name[i].toUpperCase()
        } else if (name[i] == " ") {
            type += name[i]
            type += name[i + 1].toUpperCase()
            i = i + 1
        } else {
            type += name[i].toLowerCase()
        }
    }
    return type
}

const generateMessage = (id, username, room, message, isAdmin, createAt, profile = "") => { // data => id(userId), username, room, text
    return {
        id,
        username,
        room,
        message,
        isAdmin,
        createAt,
        profile
    }
}

module.exports = {
    toFormat,
    generateMessage
}