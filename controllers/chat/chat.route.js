// routes/chat.routes.js

const express = require("express");
const router = express.Router();
const chatController = require("./chat.controller");
const checkAuth = require("../../middleware/checkAuth");

router.post("/sendMessage", chatController.sendMessage);
router.get("/messages/:chatId", chatController.getMessages);

router.get("/all-chats", checkAuth, chatController.getAllChats);

module.exports = router;
