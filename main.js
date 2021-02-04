//discord startup stuff
const Discord = require('discord.js');

const client = new Discord.Client();

//getting commands from command folder
const fs = require('fs');
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command)
}

//loading muted users
const muted_user_filepath = './txt_data/muted_users.txt'

var mutedUsers = fs.readFileSync(muted_user_filepath).toString().split(',');



//ready
client.once('ready', () => {
    console.log("Monke time");
});


//message event handler
const prefix = "hey monke,";
const shortPrefix = "hm,";

const bjprefix = "blackjack";
const bjshortPrefix = "bj";

client.on('message', message => {
    const shortP = message.content.toLowerCase().startsWith(shortPrefix);
    const longP = message.content.toLowerCase().startsWith(prefix);
    const bjshortP = message.content.toLowerCase().startsWith(bjshortPrefix);
    const bjlongP = message.content.toLowerCase().startsWith(bjprefix);

    if((shortP || longP) && !message.author.bot){ 
        
        const userID  = message.author.id;

        const fullCommand = shortP ? message.content.slice(shortPrefix.length).trim().toLowerCase() : message.content.slice(prefix.length).trim().toLowerCase();
        const args = fullCommand.split(/ +/);
        const command = args.shift();

        //checking if user is muted, but does not ignore rest of these commands
        var stop = false;
        mutedUsers.every(mutedUser => {
            if(userID == mutedUser){
                if(fullCommand == "i'm sorry"){
                    message.channel.send(':D');
                    unMuteUser(mutedUser);
                    stop = true;
                }
                return false;
            }
            return true;
        });
        if(stop) return;


        switch(command){
            case 'help':
                client.commands.get('help').execute(message, args);
                return;
        }

        switch(fullCommand){
            case 'please shut the fuck up':
                message.channel.send(':(');
                muteUser(userID);
                break;
            default:
                message.channel.send('Sup');
        }

    }else if((bjshortP || bjlongP) && !message.author.bot){
        const userID  = message.author.id;

        const fullCommand = bjshortP ? message.content.slice(bjshortPrefix.length).trim().toLowerCase() : message.content.slice(bjprefix.length).trim().toLowerCase();
        const args = fullCommand.split(/ +/);

        client.commands.get('blackjack').execute(message, args);
        
    }
    
    else if(!message.author.bot){

        const userID  = message.author.id;
    
        const msg = message.content.toLowerCase().trim();

        switch(msg){
            case 'reject humanity':
                message.channel.send('Return to Monke');
                break;
            case 'monke':
                message.channel.send('Hoo hoo Haa haa');
                break;
            case 'big chungus':
                message.channel.send('Fuck you');
                break;
        }

        if(msg.includes('reddit') || msg.includes('r/')){
            message.channel.send("Oh, you like reddit? I'm gonna r/ape you");
        }

        //checking if user is muted and ignores following commands
        var stop = false;
        mutedUsers.every(mutedUser => {
            if(userID == mutedUser){
                stop = true;
                return false;
            } 
            return true;
        });
        if(stop) return;        

        client.commands.get('profanity hater').execute(message);
    }
})


function appendToFile(filepath, text){
    fs.appendFile(filepath, text, function (err) {
        if (err) throw err;
      });
}

function muteUser(userID){
    console.log('Muted User: ' + userID);
    if(mutedUsers[0] != '' && mutedUsers[0] != null){
        mutedUsers.push(userID);
        userID = ','+ userID;
    }else{
        mutedUsers[0] = userID;
    }
    appendToFile(muted_user_filepath, userID);
    
}

function unMuteUser(mutedUser){
    console.log('Unmuted User: ' + mutedUser);
    mutedUsers.splice(mutedUsers.indexOf(mutedUser), 1);
    if(mutedUsers[0] != null && mutedUsers[0] != ''){
        mutedUser = ',' + mutedUser;
    }
    updatedMutes = fs.readFileSync(muted_user_filepath).toString().replace(mutedUser, '');
    fs.writeFileSync(muted_user_filepath, updatedMutes);
}


//key
client.login("ODA2MTY4MDE4Njg1MDAxNzkw.YBlgeQ.E_7E96aQjembSryTsLW1CVmiQzQ");