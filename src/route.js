const normalizedPath = require('path').join(__dirname, 'models');
require('fs').readdirSync(normalizedPath).forEach(file => require('./models/' + file))


const AdminRouter = require('./routes/adminRouter')
const UserRouter = require('./routes/userRouter')
const FeaturesRouter = require('./routes/featuresRouter')

module.exports = [
    AdminRouter, UserRouter, FeaturesRouter
]