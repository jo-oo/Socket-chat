import express from 'express';
import { createServer } from 'node:http';
//for index.html
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
//socket.io
import { Server } from 'socket.io';
//SQLite for disconnections
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

//SQLite
// open the database file
async function fetchData() {
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  // create our 'messages' table (you can ignore the 'client_offset' column for now)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT
    );
  `);

  //setting up a server using Express
  const app = express();
  const server = createServer(app);
  //setting upp socket.io with the server
  const io = new Server(server, {
    connectionStateRecovery: {}
  });

  //index.html connection
  const __dirname = dirname(fileURLToPath(import.meta.url));

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  //listening for incoming events using socket.io
  io.on('connection', async (socket) => {
    socket.on('chat message', async (msg) => {
      //handel discennections
        let result;
        try {
          // store the message in the database
          result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
        } catch (e) {
          // TODO handle the failure
          return;
        }
        /**emit the event from the server to the rest of the users
        send the message to everyone, including the sender: **/
            //io.emit('chat message', msg);
        // include the offset with the message
        io.emit('chat message', msg, result.lastID);
        console.log('message: ' + msg);
    });
            // console.log('a user connected');
            // //add disconnect event to each socket
            /*socket.on('disconnect', () => {
              console.log('user disconnected');
            });*/
      

    //And finally the server will send the missing messages upon (re)connection:
    if (!socket.recovered) {
      // if the connection state recovery was not successful
      try {
        await db.each('SELECT id, content FROM messages WHERE id > ?',
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            socket.emit('chat message', row.content, row.id);
          }
        )
      } catch (e) {
        // something went wrong
      }
    }
  });

  //server request running on port 3000
  server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });
}

fetchData();