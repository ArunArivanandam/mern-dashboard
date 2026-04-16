const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
const connectToMongoDB = require("./db/connectToMongoDB");

app.listen(3000, () => {
  connectToMongoDB();
  console.log("Connected to server on port 3000");
});
