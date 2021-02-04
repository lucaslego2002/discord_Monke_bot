const fs = require('fs');

const help_file_path = './txt_files/help.txt'
const helpText = fs.readFileSync(help_file_path).toString();


module.exports = {
    name: 'help',
    description: 'all my homies need help',
    execute(message){
        message.channel.send(helpText);
    }
}