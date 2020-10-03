const WebSocket = require('ws');
require('dotenv').config();
const PORT = process.env.PORT; 

const ws = new WebSocket.Server({ port: PORT || 3000 });

let messages = {}

let newUser = username => {
    ws.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            let json = {
                'Action': 'New User',
                'Username': username
            }

            client.send(JSON.stringify(json));
        }
    });
}

ws.on('connection', function connection(wss) {

    wss.on('message', function incoming(message) {
        if (message === 'Keep Alive!') return wss.send('Keep Alive!');
        else if (JSON.parse(message)['Action'] == 'Connected') return newUser(JSON.parse(message)['Username']);
        
        let lessThanFour = message.length < 1 ? true : false;

        ws.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && !lessThanFour) client.send(message);
        });
    });
});
