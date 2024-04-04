import express from 'express';
import { createServer } from 'node:http';
//for index.html
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
//socket.io
import { Server } from 'socket.io';

//setting up a server using Express
const app = express();
const server = createServer(app);
//setting upp socket.io with the server
const io = new Server(server);

//index.html connection
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

//listening for incoming events using socket.io
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
  // console.log('a user connected');
  // //add disconnect event to each socket
  // socket.on('disconnect', () => {
  //   console.log('user disconnected');
  // });
});

//server request running on port 3000
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});