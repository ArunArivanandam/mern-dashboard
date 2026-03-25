const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/userController");

userRouter
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

module.exports = userRouter;
