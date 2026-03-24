const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  age: Number,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
