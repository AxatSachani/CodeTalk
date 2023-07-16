const courier = require("@trycourier/courier")
const { MAILTOKEN: token } = process.env
const mail = courier.CourierClient({ authorizationToken: token });

const sendOTPMail = function (user_name, username, otp) {
    mail.log(user_name, username, otp);
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


const sendInviteMail = function (user_name, username, groupName, password) {
    console.log(user_name, username, groupName, password);
    mail.send({
        message: {
            to: {
                email: `${user_name}`,
            },
            template: "KJ6D2YD8T1MY68NFG5G0SM57PBEC",
            data: {
                name: `${username}`,
                group: `${groupName}`,
                username: `${user_name}`,
                password: `${password}`,
            },
        },
    });
    console.log('sent');
}

module.exports = {
    sendOTPMail,
    sendInviteMail
}