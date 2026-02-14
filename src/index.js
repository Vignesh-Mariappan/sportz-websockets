import express from 'express';
import { matchRouter } from './routes/matches.js';

const app = express();
const PORT = 8000;

// parse JSON bodies
app.use(express.json());

// root route returns a short message
app.get('/', (req, res) => {
    res.send('Hello from Sportz server');
});

app.use('/matches', matchRouter);

// start server and log URL
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}/`);
});

