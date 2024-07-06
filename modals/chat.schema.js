

const mongoose = require("mongoose");
const chatModel = mongoose.Schema(
    {
        chatName: {
            type: String,
            default: null
        },
        isGroupChat: {
            type: Boolean,
            default: false
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        latestMessage: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message"
            },
            text: {
                type: String,
                default: null
            },
            attachments: {
                type: String,
                default: null
            },
            attachements_name: {
                type: String,
                default: null
            }
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;