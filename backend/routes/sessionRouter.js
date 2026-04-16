const express = require("express");
const sessionRouter = express.Router();
const sessionController = require("../controller/sessionController");

sessionRouter
  .route("/")
  .get(sessionController.getAllUsers)
  .post(sessionController.createUser);

sessionRouter
  .route("/:id")
  .get(sessionController.getUser)
  .put(sessionController.updateUser)
  .delete(sessionController.deleteUser);

module.exports = sessionRouter;
