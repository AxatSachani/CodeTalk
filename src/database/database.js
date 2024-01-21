const mongoose = require('mongoose')
const chalk = require('chalk')
const database = 'chat-cloud'
const { DBURL } = process.env
const url = DBURL

var connect = false
mongoose.connect(url, {
    useNewUrlParser: true
}, (err) => {
    if (err) {
        throw new Error(err)
    }
    connect = true
    console.log(`'${database}' connected`);
})
setTimeout(() => {
    if (!connect) {
        console.log(chalk.red('Error:'), (chalk.yellow('database not connected')));
    }
}, 5000);

