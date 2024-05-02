const { script, stopScript } = require('./Script.jsx');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server:server });

// Broadcast to all clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}


wss.on('connection', function connection(ws) {
    console.log('A client connected');
    ws.send('Welcome new client!')
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
    ws.on('close', function close() {
        console.log('Client disconnected');
    });
});



// Enable all CORS requests
app.use(cors());

// This line is essential for parsing JSON bodies
app.use(express.json());

app.post('/start', (req, res) => {
    const { twitterGroupList, secondsBetweenGroups, secondsBetweenGroupLists, clientName, proxyAddress, proxyUsername, proxyPassword } = req.body;
    script(twitterGroupList, secondsBetweenGroups, secondsBetweenGroupLists, clientName, proxyAddress, proxyUsername, proxyPassword, broadcast);
    res.status(200).json(`Successfully ran script!`);
});

app.post('/stop', (req, res) => {
    stopScript(broadcast);
    res.status(200).json({ message: "Script stopped successfully!" });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
