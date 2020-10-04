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

let jobids = {}
let clients = {}

ws.on('connection', function connection(wss) {

    wss.on('message', async function incoming(message) {

        if (message === 'Keep Alive!') return wss.send('Keep Alive!');
        else if (JSON.parse(message)['Action'] === 'Connected') {
            clients[JSON.parse(message)['Username']] = wss; 

            return newUser(JSON.parse(message)['Username']);
        }
        else if (JSON.parse(message)['Request'] === 'JobId') {

            let user = JSON.parse(message)['Username'];
            let localuser = JSON.parse(message)['MyUsername']
            
            if (!clients[user]) return;

            clients[user].send(JSON.stringify({
                'Action': 'RequestedJobId',
                'User': user
            }));

            let jobid = await jobids[user];

            let obj = JSON.stringify({
                'Game': jobid,
                'User': localuser
            })
            
            wss.send(obj)

            return;
            
        } else if (JSON.parse(message)['Action'] === 'SendJobId') {
            let jobid = JSON.parse(message)['JobId'];
            let placeid = JSON.parse(message)['PlaceId'];
            
            let username = JSON.parse(message)['User'];
            
            let json = JSON.stringify({
                'JobId': jobid,
                'PlaceId': placeid
            })
            jobids[username] = json
            return
        }
        
        let lessThanFour = message.length < 1 ? true : false;

        ws.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && !lessThanFour) client.send(message);
        });
    });
});
