import express from 'express';
import { createServer } from 'node:http';
//for index.html
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

//setting up a server using Express
const app = express();
const server = createServer(app);

//index.html connection
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

//running request to server
app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});