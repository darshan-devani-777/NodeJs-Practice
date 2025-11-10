const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");

// CREATE SERVER
const server = http.createServer((req, res) => {
  fs.readFile("./index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading index.html");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

// SERVER
const wss = new WebSocket.Server({ server });
const rooms = {};

// BROADCAST ALL MESSAGES TO USERS
function broadcast(room, data) {
  rooms[room].forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

// SEND MESSAGE TO SPECIFIC USEER
function sendToUser(room, targetUsername, data) {
  const user = rooms[room].find((u) => u.username === targetUsername);
  if (user && user.ws.readyState === WebSocket.OPEN) {
    user.ws.send(JSON.stringify(data));
  }
}

// GET USERNAME ROOM
function getUsernames(users) {
  return users.map((u) => u.username);
}

// ON NEW WEBSOCKETS CONNECTION
wss.on("connection", (ws, req) => {
  const params = new URLSearchParams(req.url.split("?")[1]);
  const room = params.get("room");
  const username = params.get("username");

  if (!room || !username) {
    ws.close();
    return;
  }

  if (!rooms[room]) rooms[room] = [];
  rooms[room].push({ ws, username });

  const time = new Date().toLocaleTimeString();
  broadcast(room, {
    type: "notice",
    message: `🟢 ${username} joined the room.`,
    users: getUsernames(rooms[room]),
    time,
  });

  // MESSAGES
  ws.on("message", (msg) => {
    const time = new Date().toLocaleTimeString();
    let parsed;
    try {
      parsed = JSON.parse(msg);
    } catch {
      parsed = { type: "chat", message: msg };
    }

    if (parsed.type === "typing") {
      rooms[room].forEach((client) => {
        if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
          if (client.username === parsed.to || parsed.to === "") {
            client.ws.send(
              JSON.stringify({
                type: "typing",
                username: parsed.username || username,
              })
            );
          }
        }
      });
    } else if (parsed.type === "image") {
      if (parsed.to) {
        sendToUser(room, parsed.to, {
          type: "image",
          username,
          image: parsed.image,
          time,
        });
      } else {
        broadcast(room, {
          type: "image",
          username,
          image: parsed.image,
          time,
        });
      }
    } else if (parsed.type === "private") {
      sendToUser(room, parsed.to, {
        type: "private",
        username,
        message: parsed.message,
        time,
      });
    } else {
      broadcast(room, {
        type: "chat",
        username,
        message: parsed.message,
        time,
      });
    }
  });

  // DISCONNECT USER
  ws.on("close", () => {
    rooms[room] = rooms[room].filter((u) => u.ws !== ws);
    const time = new Date().toLocaleTimeString();
    broadcast(room, {
      type: "notice",
      message: `🔴 ${username} left the room.`,
      users: getUsernames(rooms[room]),
      time,
    });
  });
});

server.listen(3333, () => {
  console.log("🚀 Server running at http://localhost:3333");
});
