const WebSocket = require('ws');
require('dotenv').config();
const PORT = process.env.PORT; 

const ws = new WebSocket.Server({ port: PORT || 3000 });

let messages = {}

function newUser(username) {
    ws.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            let json = {
                'Action': 'New User',
                'Username': username
            }


            console.log(json)
            client.send(JSON.stringify(json));
        }
    });
}

ws.on('connection', function connection(wss) {

    wss.on('message', function incoming(message) {

        if (message === 'Keep Alive!') {
            wss.send('Keep Alive!')
            return;
        } else if (JSON.parse(message)['Action'] == 'Connected') {
            newUser(JSON.parse(message)['Username'])
            return;
        }

        let lessThanFour = false;
        
        if (message.length < 1) {
            lessThanFour = true;
            return;
        }

        ws.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                if(!lessThanFour) {
                    client.send(message);
                }
            }
        });

    });
});