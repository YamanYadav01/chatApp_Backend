import User from '../modal/User.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Message from '../modal/messageModel.js';
import { Server } from "socket.io";

// import cookieParser from 'cookie-parser';

export const SignUp = async(req,res)=>{
    try{
     const{email,username,password} = req.body;

    if(!email||!username||!password){
       return res.status(502).json({msg:"All fields are required"});
    }
    
    const userexist = await User.findOne({email});
    if(userexist){
        return res.status(502).json({msg:"This user are allready registered"});
    }
    else{
        const salt = await bcrypt.genSalt(10); // Use async version
        const hash = await bcrypt.hash(password, salt);

        await User.create({
              email,
              username,
              password:hash,
        })

        return res.status(200).json({ message: "User created successfully" });
    }
    }catch (error) {
        console.error("Error in signup:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }

}

export const SignIn = async(req,res)=>{ 
    try{
        const{email,password} = req.body;
        
        if(!email||!password){
            return res.status(502).json({msg:"All fields are required"});
        }
     
        const existUser = await User.findOne({email})
        
    if(existUser){
        const isMatch = bcrypt.compareSync(password, existUser.password);
    if(isMatch){
        // Generate token
        const token = jwt.sign({ id: existUser._id.toString() }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        
        // Save token in cookie
        res.cookie('tokenData', token, {
            httpOnly: true,
            secure: false,               // okay for localhost
            sameSite: 'lax',             // allows cross-origin POST with navigation
            expires: new Date(Date.now() + 3600000)  // 1 hour
            });
            res.json({ id: existUser._id.toString(), email: existUser.email, msg:"User are login successfully..."});
    }
    }else{
         return res.status(500).json({message:"user not found"})
    }
    }catch(err){
    return res.status(500).json({message:"server error", error:err.message})
    }
    }

export const Logout = (req,res)=>{
        res.clearCookie("tokenData")
        res.status(200).json({msg:"user logout successfully..."})
}

export const ContactList = async(req,res)=>{
    const ContactData = await User.find();
        res.status(200).json({ContactData})
}

export const Conversation = async(req,res)=>{
    let {ReceverId, senderId} = req.params;
    const conversations = await Message.findOne({
        $or:[
            {ReceverId:ReceverId, senderId:senderId},
            {ReceverId:senderId, senderId:ReceverId}
        ]
    });
    return res.status(200).json({conversations});
}