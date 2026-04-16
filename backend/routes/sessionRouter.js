const express = require("express");
const sessionRouter = express.Router();
const sessionController = require("../controller/sessionController");

sessionRouter
  .route("/")
  .get(sessionController.getAllUsers)
  .post(sessionController.registerUser);

sessionRouter.route("/login").post(sessionController.loginUser);
sessionRouter.route("/logout").post(sessionController.logoutUser);

sessionRouter
  .route("/:id")
  .get(sessionController.getUser)
  .put(sessionController.updateUser)
  .delete(sessionController.deleteUser);

module.exports = sessionRouter;
