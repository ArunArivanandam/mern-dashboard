const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const sessionRouter = require("./routes/sessionRouter");
const app = express();

app.set("query parser", "extended");
app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/session", sessionRouter);

module.exports = app;
