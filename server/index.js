import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// const totalgames = {}

// demototaldata = {
//     "code": {
//         player1: {
//             "name": "akash"
//         },
//         player2: {
//             "name": "akash"
//         },
//         player2: {
//             "name": "akash"
//         },
//     },
//     "code2": {
//         player1: {
//             "name": "akash"
//         },
//         player2: {
//             "name": "akash"
//         },
//         player2: {
//             "name": "akash"
//         },
//     }
// }

// Track users in rooms
const rooms = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("createRoom", (stringCode) => {
    console.log(`Creating room with code: ${stringCode}`);
    rooms[stringCode] = rooms[stringCode] || [];
    rooms[stringCode].push(socket.id);
    socket.join(stringCode);
    console.log(`Room created and joined: ${stringCode}`);
    io.to(stringCode).emit("roomUpdate", {
      roomCode: stringCode,
      users: rooms[stringCode],
      message: `User ${socket.id} created and joined room ${stringCode}`,
    });
  });

  socket.on("joinRoom", (data) => {
    // console.log(stringCode)
    const { stringCode, name } = data;
    if (rooms[stringCode]) {
      rooms[stringCode].push(socket.id);
      socket.join(stringCode);
      const message = `${name} joined room with code ${stringCode} `
      const number = 1
      io.to(stringCode).emit(
        "message", {message, number} )
      //   socket.emit('joinSuccess', `Joined room: ${stringCode}`);
      console.log(`User ${socket.id} joined room: ${stringCode}`);
    } else {
      socket.emit("error", `Room ${stringCode} does not exist`);
    }
  });

  socket.on("checkRoom", (roomCode, callback) => {
    if (rooms[roomCode]) {
      callback({ roomCode, users: rooms[roomCode] });
    } else {
      callback({ roomCode, users: [] });
    }
  });

  //   socket.on('message', (value) => {
  //     socket.broadcast.emit('recived-message', value);
  //   });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove user from all rooms
    for (const [roomCode, users] of Object.entries(rooms)) {
      const index = users.indexOf(socket.id);
      if (index !== -1) {
        users.splice(index, 1);
        if (users.length === 0) {
          delete rooms[roomCode];
        } else {
          io.to(roomCode).emit("roomUpdate", {
            roomCode,
            users,
            message: `User ${socket.id} has left the room ${roomCode}`,
          });
        }
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("Home server path");
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
