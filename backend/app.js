const express = require("express");
const app = express();
const userRoutes = require("./routes/userRouter");

app.use(express.json());
app.use("/users", userRoutes);

module.exports = app;
