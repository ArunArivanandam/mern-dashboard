const app = require("./app");
const http = require("http");
const connectToMongoDB = require("./db/connectToMongoDB");

const server = http.createServer(app);

server.listen(3000, () => {
  connectToMongoDB();
  console.log("Connected to server on port 3000");
});
