const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/userController");

userRouter.route("/senior");
// .get(userController.filterSenior, userController.getAllUsers);

userRouter
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter
  .route("/:id")
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
