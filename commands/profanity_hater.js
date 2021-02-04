const fs = require('fs');

const badWords_file_path = './txt_files/bad_words.txt';
const insults_file_path = './txt_files/insults.txt/';

const badWords = fs.readFileSync(badWords_file_path).toString().split(',');
const insults = fs.readFileSync(insults_file_path).toString().split(',');

module.exports = {
    name: 'profanity hater',
    description: 'all my homies hate nigas that swear',
    execute(message){
        badWords.every(badword => {
            if(message.content.toLowerCase().includes(badword)){
                const random = Math.floor(Math.random() * Math.floor(insults.length));
                message.channel.send(`You can't say '${badword}', this is a christian minecraft server, you ${insults[random]}`);
                return false;
            }
            return true;
        });
    }
}