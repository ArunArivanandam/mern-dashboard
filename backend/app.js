const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const app = express();

app.set("query parser", "extended");
app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/products", productRouter);

module.exports = app;
