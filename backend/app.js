const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const sessionRouter = require("./routes/sessionRouter");
const app = express();

app.set("query parser", "extended");
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // long, random, env-only
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URI,
      ttl: 60 * 60 * 24 * 7, // 7 days in seconds
      autoRemove: "native", // let MongoDB purge expired docs
    }),
    cookie: {
      httpOnly: true, // no JS access — blocks XSS cookie theft
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF mitigation
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in ms
    },
  }),
);

app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/session", sessionRouter);

module.exports = app;
