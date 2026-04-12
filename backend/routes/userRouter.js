const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/userController");

userRouter
  .route("/senior")
  .get(userController.filterSenior, userController.getAllUsers);

userRouter.route("/login").post(userController.userLogin);
userRouter.route("/logout/:id").post(userController.signOut);

userRouter
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter.route("/aggregation").get(userController.getUsersAggregation);

userRouter
  .route("/:id")
  .get(userController.isAuth, userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
