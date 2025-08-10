import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({

    senderId:{
        type:String,
        
      },
    ReceverId:{
         type:String,
        
    },
    messageData: [
        {
        sender: {  // Who sent this individual message
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createDate: {
            type: Date,
            default: Date.now
        }
        }
    ]
    
},
{timestamp:true})

const messageModal = mongoose.model('messageModal', messageSchema);
export default messageModal;  