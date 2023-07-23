const mongoose = require('mongoose')
const chalk = require('chalk')
const database = 'chat-cloud'
const url = `mongodb://12.0.0.1:27017/${database}?retryWrites=true&w=majority`

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

