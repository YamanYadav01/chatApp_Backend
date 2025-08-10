import express from 'express';
import http from "http";
import mongoose, { mongo } from 'mongoose';
import dotenv from 'dotenv'
import router from './routes/userRoute.js';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { Server } from "socket.io";
import { connect } from 'http2';
import Message from './modal/messageModel.js';
import path from 'path'


const app = express();
const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: process.env.CLIENT_URL, // React frontend URL
    methods: ['GET', 'POST']
  }
});  //handle the socket.io

io.on('connection', (socket)=>{
  socket.on("Yaman", async(msg)=>{
    let existingChat = await Message.findOne({
      $or:[
            {ReceverId:msg.ReceverId, senderId:msg.senderId},
            {ReceverId:msg.senderId, senderId:msg.ReceverId}
        ]});

    if(!existingChat){
      // Create a new conversation if it doesn't exist
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

    }else{
      existingChat.messageData.push({
        sender: msg.senderId,
        message: msg.messages,
        createDate: new Date(msg.date)
      });
      await existingChat.save();
    }
      io.emit("message", msg)
    })

  socket.on('disconnect', () => {
    
  });
})

app.use(cors({
  origin: process.env.CLIENT_URL, // ✅ frontend ka exact origin
  credentials: true               // ✅ allow cookies
}));

// app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // enable cookie support
app.use(express.static("/public"));

app.use('/user',router);

dotenv.config();
//Database connection
mongoose.connect(process.env.MONGODB_URI)
        .then(()=>{
            console.log("✅ MongoDB connected successfully");
        })
        .catch((err)=>console.error("❌ Error connecting to MongoDB:", err))

// configure dotenv
const PORT = process.env.PORT||'3000';
server.listen(PORT,()=>{
    console.log(`port is started, ${PORT}`)
})