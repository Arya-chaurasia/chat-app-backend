const http = require('http');
const app = require('./app');
const socket = require("socket.io");
const User = require('./modals/user.schema');
const Chat = require('./modals/chat.schema');
const messageSchema = require('./modals/message.schema');
const port = process.env.PORT || 5001;
const server = http.createServer(app);
console.log(`Server is listening at PORT:-${port}`);
server.listen(port);

const io = socket(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    credentials: true,
  },
});

const userSockets = {};

io.on('connection', (socket) => {
  socket.on('register', async (userId) => {
    userSockets[userId] = socket.id;
    console.log('User registered with socket id:', userId, socket.id);
    await updateUserStatus(userId, true);
    io.emit('userStatusChanged', { userId, isOnline: true });
  });

 // Handle sending messages
 socket.on('sendMessage', async (data) => {
  // console.log('Received sendMessage event with data:', data);
  try {
    const { text, sender, receiver, chatId } = data;

    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [sender, receiver] },
    });

    if (!chat) {
      chat = new Chat({ isGroupChat: false, users: [sender, receiver] });
      await chat.save();
    }

    //save the new message
    const newMessage = new messageSchema({
      chat_id: chatId,
      sender: sender,
      receiver: receiver,
      text: text,
    });
    await newMessage.save();

    //console.log(chat, "chatchat")

    //console.log(newMessage, "newMessage")

    // Update the latest message
    chat.latestMessage = {
      id: newMessage._id,
      text: newMessage.text,
    };
    await chat.save();
    console.log("userSockets:", userSockets);

    console.log(chat.latestMessage, "latestMessage")

    // Emit the message to the receiver if they are online
    const receiverSocketId = userSockets[receiver];
    console.log(receiverSocketId, "receiverSocketIdreceiverSocketId");
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', newMessage);
    }
  } catch (error) {
    console.error('Error in sendMessage:', error);
  }
});

  socket.on("disconnect", async () => {
    let disconnectedUserId = null;
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        disconnectedUserId = userId;
        delete userSockets[userId];
        break;
      }
    }

    if (disconnectedUserId) {
      await updateUserStatus(disconnectedUserId, false);
      io.emit("userStatusChanged", {
        userId: disconnectedUserId,
        isOnline: false,
      });
    }
  });
});

async function updateUserStatus(userId, isOnline) {
  try {
    await User.findByIdAndUpdate(userId, { isOnline });
  } catch (error) {
    console.error("Error updating user status:", error);
  }
}

module.exports = { server, io };