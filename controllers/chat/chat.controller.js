const Message = require("../../modals/message.schema"); // Corrected path
const Chat = require("../../modals/chat.schema"); // Corrected path
const apiResponse = require("../../helper/apiResponse");

// Send a message
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  try {
    // Find the chat between the two participants or create a new one
    let chat = await Chat.findOneAndUpdate(
      {
        isGroupChat: false,
        users: { $all: [senderId, receiverId] },
      },
      {
        $setOnInsert: {
          users: [senderId, receiverId],
          isGroupChat: false,
        },
      },
      { new: true, upsert: true } // 'new' returns the modified document, 'upsert' creates if not found
    );

    // Create the message with chat_id
    let message = await Message.create({
      chat_id: chat._id, // Assign the chat ID to the message
      sender: senderId,
      receiver: receiverId,
      text,
    });

    // Update the latest message in the chat
    chat.latestMessage = {
      id: message._id,
      text: message.text,
    };
    await chat.save();

    // Populate the message with sender and chat details for the response
    message = await Message.populate(message, [
      { path: 'sender', select: 'name email' },
      { path: 'chat_id', select: 'users' }
    ]);

    return apiResponse.successResponseWithData(
      res,
      "Message sent successfully",
      message
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return apiResponse.ErrorResponse(res, "Error sending message: " + error);
  }
};


// Get messages for a specific chat
exports.getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).populate("users", "name email");

    if (!chat) {
      return apiResponse.ErrorResponse(res, "Chat not found");
    }

    // Fetch all messages for the chat
    const messages = await Message.find({ chat_id: chatId }).sort("timestamp");
    return apiResponse.successResponseWithData(
      res,
      "Messages retrieved successfully",
      messages
    );
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return apiResponse.ErrorResponse(
      res,
      "Error retrieving messages: " + error
    );
  }
};

// Get all chats for the logged-in user
exports.getAllChats = async (req, res) => {
  try {
    const userId = req.userId.userId;

    // Fetch all chats the user is part of, populate participants and latest message details
    const chats = await Chat.find({ users: userId })
      .populate("users", "name email")
      .populate("latestMessage.id", "text createdAt")
      .sort({ updatedAt: -1 });

    return apiResponse.successResponseWithData(
      res,
      "Chats fetched successfully",
      chats
    );
  } catch (error) {
    console.error("Error fetching chats:", error);
    return apiResponse.ErrorResponse(
      res,
      "Error fetching chats: " + error.message
    );
  }
};
