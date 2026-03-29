const express = require("express");

const app = express();
const cors = require("cors");

const userRouter = require("./routes/userRouter");

app.use(cors());
app.use(express.json());
app.use("/users", userRouter);

module.exports = app;
