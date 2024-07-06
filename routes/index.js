const express = require("express");
const userRoutes = require("../controllers/user/user.route");
const chatRoutes = require("../controllers/chat/chat.route");

const app = express();

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);

module.exports = app;
