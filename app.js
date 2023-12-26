const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const http = require("http");

const PORT = process.env.PORT;
dotenv.config();

const sequelize = require("./utils/database");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const homePageRouter = require("./routes/homePage");
const userRouter = require("./routes/user");
const User = require("./models/user");
const ChatHistory = require("./models/chat-history");
const Groups = require("./models/groups");
const GroupMember = require("./models/groupMembers");

const cronService = require('./services/cron');
cronService.job.start();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("creating-group", () => {
    socket.broadcast.emit("group-created");
  });
  socket.on("message-sent", () => {
    socket.broadcast.emit("message-recieved");
  });
  socket.on("updating", () => {
    socket.broadcast.emit("updated");
  });
});

app.use("", homePageRouter);
app.use("/user", userRouter);

User.hasMany(ChatHistory);
ChatHistory.belongsTo(User, { constraints: true });
User.belongsToMany(Groups, { through: GroupMember });
Groups.belongsToMany(User, { through: GroupMember });
Groups.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
Groups.hasMany(ChatHistory);
ChatHistory.belongsTo(Groups);

async function runServer() {
  try {
    await sequelize.sync();
    server.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (error) {
    console.log(error);
  }
}
runServer();
