import express from 'express';
import http from "http";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './routes/userRoute.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from "socket.io";
import Message from './modal/messageModel.js';
import path from 'path';

dotenv.config(); // ✅ sabse upar

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || "https://chatappfrontend-dusky.vercel.app";

// ✅ CORS (single, clean)
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));


// ✅ middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// ✅ static fix
app.use(express.static(path.join(process.cwd(), "public")));


// ✅ routes
app.use('/user', router);


// 🔥 SOCKET.IO FIX
const io = new Server(server, {
  cors: {
    origin: "https://chatappfrontend-dusky.vercel.app",
    methods: ["GET", "POST"]
    // ❌ credentials hatao (very important)
  },
  transports: ["polling", "websocket"]
});

io.on('connection', (socket) => {
  console.log("✅ Socket Connected:", socket.id);

  socket.on("Yaman", async (msg) => {
    let existingChat = await Message.findOne({
      $or: [
        { ReceverId: msg.ReceverId, senderId: msg.senderId },
        { ReceverId: msg.senderId, senderId: msg.ReceverId }
      ]
    });

    if (!existingChat) {
      const newChat = new Message({
        senderId: msg.senderId,
        ReceverId: msg.ReceverId,
        messageData: [{
          sender: msg.senderId,
          message: msg.messages,
          createDate: new Date(msg.date)
        }]
      });

      await newChat.save();
    } else {
      existingChat.messageData.push({
        sender: msg.senderId,
        message: msg.messages,
        createDate: new Date(msg.date)
      });
      await existingChat.save();
    }

    io.emit("message", msg);
  });

  socket.on('disconnect', () => {
    console.log("❌ Socket Disconnected:", socket.id);
  });
});


// ✅ DB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB error:", err));


// ✅ server start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
