import express from 'express';
import { matchRouter } from './routes/matches.js';
import setupWebSocketServer from './ws/server.js';
import http from 'http';

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

// parse JSON bodies
app.use(express.json());

const server = http.createServer(app);

// root route returns a short message
app.get('/', (req, res) => {
    res.send('Hello from Sportz server');
});

app.use('/matches', matchRouter);

const { broadcastMatchCreated } = setupWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// start server and log URL
server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}/` : `http://${HOST}:${PORT}/`;
    console.log(`Server listening at ${baseUrl}`);
    console.log(`WebSocket server ready ${baseUrl.replace('http', 'ws')}ws`);
});

