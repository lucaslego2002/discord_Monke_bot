const fs = require('fs');
const blackjack_file_path = './txt_data/blackjack_data.txt';

let crypto = require('crypto');
let token;

function generateToken(){
    crypto.randomBytes(16, function(err, buffer) {
        token = buffer.toString('hex');
        console.log("New token: " + token);
      });
}

generateToken();


const numbers = [
    ":one:",
    ":two:",
    ":three:",
    ":four:",
    ":five:",
    ":six:",
    ":seven:",
    ":eight:",
    ":nine:",
    ":one: :zero:",
    ":regional_indicator_j:",
    ":regional_indicator_q:",
    ":regional_indicator_k:",
];

const suits = [
    ":diamonds:",
    ":shamrock:",
    ":hearts:",
    ":evergreen_tree:",
];

class Blackjack{
    constructor(user, name, money){
        this.player = user; 
        this.playerName = name;
        this.money = money;
        this.resetGame();
    }

    updateName(name){
        if(this.playerName != name) this.playerName = name;
    }

    resetGame(){
        this.availableCards = new Array(52);
        for(let i = 0; i < 52; i++){
            this.availableCards[i] = i;
        }
        this.dealerHand = new Array(2);
        this.userHand = new Array(2);
        this.ongoing = false;
        this.bet = 0;
    }

    start(bet){
        this.ongoing = true;
        this.bet = bet;
        this.money -= this.bet;
        this.deal();
    }

    deal(){
        this.dealerHand[0] = this.drawCard();
        this.dealerHand[1] = this.drawCard();
        this.userHand[0] = this.drawCard();
        this.userHand[1] = this.drawCard();   
    }

    hit(){
        this.userHand.push(this.drawCard());
    }

    doubleDown(channel){
        this.money -= this.bet;
        this.bet += this.bet;
        this.hit();
        let returnText;
        returnText += this.printHand();
        returnText += this.check('midgame');
        channel.send(returnText);

        if(this.ongoing){
            this.stand(channel);
        }

    }

    stand(channel){
        while(this.calculateHand(this.dealerHand) < 17){
            this.dealerHand.push(this.drawCard());
            let returnText = '';
            returnText += this.printHand();
            returnText += this.check('midgame');
            channel.send(returnText);
            if(!this.ongoing) return;
        }
        channel.send(this.check('final'));
        
    }

    drawCard(){
        const random = Math.floor(Math.random() * Math.floor(this.availableCards.length));
        const selected_card = cards[random];
        this.availableCards.splice(this.availableCards.indexOf(random), 1);
        return selected_card;
    }

    calculateHand(hand){
        let total = 0;
        let hasAce = false;

        hand.forEach(card => {
            total += card.value;
            if(card.value == 1) hasAce = true;
        });
        if(hasAce && total <= 11){
            total += 10;
        }
        return total;
    }

    check(checkType){
        let returnText = '';
        const userHandVal = this.calculateHand(this.userHand);
        const dealerHandVal = this.calculateHand(this.dealerHand);

        if(checkType == 'midgame'){
            if(dealerHandVal == 21 && this.dealerHand.length == 2){
                returnText += `\nMonke got a Dealer Blackjack\n`;
                returnText += this.win('dealer');
            }else if(dealerHandVal > 21){
                returnText += `\nMonke bursted \n`;
                returnText += this.win('user');
            }else if(userHandVal > 21){
                returnText += `\n${this.playerName} bursted \n`;
                returnText += this.win('dealer');
            }
        }else if(checkType == 'final'){
            if(dealerHandVal > userHandVal){
                returnText += `\nMonke's ${dealerHandVal} beats ${this.playerName}'s ${userHandVal}\n`;
                returnText += this.win('dealer');
            }else if(dealerHandVal < userHandVal){
                returnText += `\n${this.playerName}'s ${dealerHandVal} beats Monke's ${userHandVal}\n`;
                returnText += this.win('user');
            }else{
                returnText += `\n${this.playerName}'s ${dealerHandVal} is on par with Monke's ${userHandVal}\n`;
                returnText += this.win('draw');
            }
        }
        return returnText;
    }

    win(winner){
        let returnText = '\n';
        if(winner == 'dealer'){
            returnText += `Monke wins! You lost ${this.bet}$ and now have ${this.money}$.\n`;
        }else if(winner == 'user'){
            this.money += this.bet*2;
            returnText += `${this.playerName} wins! You won ${this.bet}$ and now have ${this.money}$.\n`;
        }else{
            this.money += this.bet;
            returnText += `It's a draw! Your money remains at ${this.money}$\n`;
        }
        this.resetGame();
        this.saveData();
        return returnText;
    }

    printHand(){
        var outputString = "\nMonke's Hand: \n";
        this.dealerHand.forEach(card => {
            outputString += card.cardText() + " ";
        });
        outputString += `\n\n${this.playerName}'s Hand:\n`;
        this.userHand.forEach(card => {
            outputString += card.cardText();
        });
        outputString += '\n'
        return outputString;
    }

    tooBroke(){
        return `You're too broke homie, you've only got ${this.money}$ in your account`;
    }

    inject(money){
        this.money += money;
        this.saveData();
    }

    saveData(){
        let unCutData = fs.readFileSync(blackjack_file_path).toString();
        const data = unCutData.split(',');
        if(data[0] != null && data[0] != ''){
            for(let i = 0; i <data.length; i++){
                const dt = data[i];
                if(dt.split('-')[0] == this.player){
                    unCutData = unCutData.replace(dt, `${this.player}-${this.playerName}-${this.money}`);
                    break;
                }
            }
        }
        fs.writeFileSync(blackjack_file_path, unCutData);
    }

    newSave(){
        let save = `${this.player}-${this.playerName}-${this.money}`
        if(blackjackGames[0].player != this.player){
            save = ','+ save;
        }
        fs.appendFile(blackjack_file_path, save, function (err) {
            if (err) throw err;
        });
    }

}

class Card{
    constructor(number, suit, value){
        this.number = number;
        this.suit =  suit;
        this.value = value;
    }

    cardText(){
        const output =  " " + this.number + " " + this.suit + " ";
        return output;
    }
}

var cards = new Array(52);

for(let i = 0; i < 13; i++){
    for(let z = 0; z < 4; z++){
        const value = (i+1) > 10 ? 10 : (i+1);
        cards[i*4+z] = new Card(numbers[i], suits[z], value);
    }
}






let blackjackData = fs.readFileSync(blackjack_file_path).toString().split(',');
let blackjackGames = new Array();

if(blackjackData[0] != null && blackjackData[0] != ''){
    for(let i = 0; i <blackjackData.length; i++){
        let data = blackjackData[i].split("-");
        blackjackGames[i] = new Blackjack(data[0], data[1], parseFloat(data[2]));
    }
}

const startingMoney = 100;

module.exports = {
    name: 'blackjack',
    description: 'all my homies hate nigas that swear',
    execute(message, args){
        let accountExits = false;
        let currentGame;
        blackjackGames.every(game => {
            if(game.player == message.author.id){
                accountExits = true;
                currentGame = game;
                return false;
            }
            return true;
        });
        if(!accountExits){
            currentGame = new Blackjack(message.author.id, message.author.username.toLowerCase(),startingMoney);
            blackjackGames.push(currentGame);
            currentGame.newSave();
        }
        currentGame.updateName(message.author.username.toLowerCase());

        let returnText = '';

        if(args[0] == 'start'){
            if(currentGame.ongoing){
                message.channel.send("Nah, you already started a game");
                return;
            }

            const bet = parseFloat(args[1])?.toFixed(2);
            if(isNaN(bet)){
                message.channel.send("Um, please bets a valid ammount bruv");
                return
            }

            if(bet <= currentGame.money){
                currentGame.start(bet);
                returnText += currentGame.printHand();
                returnText += currentGame.check('midgame');
                if(currentGame.calculateHand(currentGame.userHand) == 21){
                    currentGame.stand(message.channel);
                }
            }else{
                returnText += currentGame.tooBroke();
            }

        }else if(args[0] == 'hit'){
            if(!currentGame.ongoing){
                message.channel.send("Nah, you have to start a game first");
                return;
            }

            currentGame.hit();
            returnText += currentGame.printHand();
            returnText += currentGame.check('midgame');
            if(currentGame.calculateHand(currentGame.userHand) == 21){
                currentGame.stand(message.channel);
            }

        }else if(args[0] == 'double' && args[1] == 'down'){
            if(!currentGame.ongoing){
                message.channel.send("Nah, you have to start a game first");
                return;
            }

            if(currentGame.bet <= currentGame.money){
                currentGame.doubleDown(message.channel);
            }else{
                returnText += currentGame.tooBroke();
            }

        }else if(args[0] == 'stand'){
            if(!currentGame.ongoing){
                message.channel.send("Nah, you have to start a game first");
                return;
            }
            currentGame.stand(message.channel);

        }else if(args[0] == 'view' && args[1] == 'game'){
            if(currentGame.ongoing){
                returnText += currentGame.printHand();
            }else{
                message.channel.send("Nah, you haven't started a game");
            }

        }else if(args[0] == 'bal'){
            returnText += `You have ${currentGame.money}$, you broke boi` ;

        }else if(args[0] == 'inject'){
            if(args[3] == token){
                let account;
                blackjackGames.every(game => {
                    console.log(game.player + " " + game.playerName + " " + args[1])
                    if(game.player == args[1] || game.playerName == args[1]){
                        account = game;
                        return false;
                    }
                    return true;
                });

                if(account != null) {
                    const cash = parseFloat(args[2])
                    if(!isNaN(cash)){
                        account.inject(cash);
                        message.channel.send(`${cash}$ was added to ${account.name}'s account, they now have ${account.money}$ in their account`);
                    }else{
                        message.channel.send("That's not a valid amount of cash bud");
                    }
                }else{
                    message.channel.send("That hooman doesn't exist in our records pal");
                }
                generateToken();
            }else{
                message.channel.send("That code is incorrect or you might be missing a parameter mate");
            }    
            return;
        }else{
            message.channel.send("That ain't a proper request");
        }
        
        if(returnText != ''){
            message.channel.send(returnText);
        }

    }
}

