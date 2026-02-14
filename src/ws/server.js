import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not open');
        return;
    }
    socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
    const clients = wss.clients;
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
        }
    });
}

export default function setupWebSocketServer(server) {
    const wss = new WebSocketServer({ 
        server,
        path: '/ws',
        maxPayload: 1024 * 1024, // 1 MB
     });

    wss.on('connection', (socket) => {
        console.log('New WebSocket connection established');

        sendJson(socket, { type: 'welcome', data: 'Welcome to the WebSocket server!' });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        socket.on('close', () => {
            console.log('WebSocket connection closed');
        });
    });

    function broadcastMatchCreated(matchData) {
        const payload = { type: 'match_created', data: matchData };
        broadcast(wss, payload);
    }

    return { broadcastMatchCreated, wss };
}
