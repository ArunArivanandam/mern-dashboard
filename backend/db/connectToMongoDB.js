const mongoose = require("mongoose");
require("dotenv").config();

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connected to mongodb");
  } catch (error) {
    console.log("Error connecting to mongodb", error.message);
  }
};

module.exports = connectToMongoDB;
