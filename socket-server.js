// socket-server.js
import http from "http";
import { Server } from "socket.io";

const PORT = 6000;

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // add your Vite origin(s)
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("chat:join", ({ conversationId }) => {
    socket.join(`conv_${conversationId}`);
    console.log(`Joined room conv_${conversationId}`);
  });

  socket.on("chat:leave", ({ conversationId }) => {
    socket.leave(`conv_${conversationId}`);
  });

  socket.on("chat:send", ({ conversationId, text }) => {
    const msg = {
      id: `msg_${Date.now()}`,
      conversationId,
      sender: "them",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // broadcast to others
    socket.to(`conv_${conversationId}`).emit("chat:message", msg);

    // send back to sender
    socket.emit("chat:message", { ...msg, sender: "me" });
  });

  socket.on("chat:typing", ({ conversationId, typing }) => {
    socket.to(`conv_${conversationId}`).emit("chat:typing", { conversationId, typing });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log("Socket.IO server running on port", PORT);
});
