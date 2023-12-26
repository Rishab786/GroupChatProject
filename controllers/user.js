const User = require("../models/user");
const ChatHistory = require("../models/chat-history");
const GroupMember = require("../models/groupMembers");
const sequelize = require("../utils/database");
const awsService = require('../services/awsService');
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Group = require("../models/groups");
const secretKey = process.env.SECRET_KEY;
dotenv.config();

//REGISTERING NEW USER
exports.signupAuthentication = async (request, response, next) => {
  const { userName, userEmail, userPassword, userContact } = request.body;
  try {
    const user = await User.findAll({
      where: {
        email: userEmail,
      },
    });
    if (user == "") {
      const hashedPassword = await bcrypt.hash(userPassword, 10);
      await User.create({
        name: userName,
        email: userEmail,
        password: hashedPassword,
        phonenumber: userContact,
      });
      response.status(200).send("Successfully registered");
    } else {
      response.status(401).send(user);
    }
  } catch (error) {
    console.log(error);
  }
};

// USER LOGIN AND STORING JWT TOKEN INSIDE CLIENT LOCAL STORAGE
exports.loginAuthentication = async (request, response, next) => {
  try {
    const { userEmail, userPassword } = request.body;
    const user = await User.findAll({
      where: {
        email: userEmail,
      },
    });
    if (user.length == 0) {
      response.status(404).send("not a valid user");
    } else {
      const isPasswordValid = await bcrypt.compare(
        userPassword,
        user[0].password
      );
      if (isPasswordValid) {
        const token = jwt.sign({ userId: user[0].email }, secretKey, {
          expiresIn: "1h",
        });
        response.status(200).json({ token: token, user: user[0] });
      } else {
        response.status(401).send("incorrect password");
      }
    }
  } catch (error) {
    console.log(error);
    response.status(500).send("Authentication failed");
  }
};

exports.getRegisteredSuccessfully = (request, response, next) => {
  response.sendFile("registeredSuccessfully.html", { root: "views" });
};

//SAVING USER MESSAGE INTO DATABASE
exports.postUserMessage = async (request, response, next) => {
  try {
    const user = request.user;
    const { groupName } = request.query;
    const { Message } = request.body;
    await ChatHistory.create({
      message: Message,
      userid: user.email,
      GroupName: groupName,
      UserEmail: user.email,
    });
    response.status(200).json({ message: "messages succesfully added" });
  } catch (error) {
    console.log(error);
  }
};

//SHOWING CHAT APP DASHBOARD TO THE USER
exports.getUserDashboard = (request, response, next) => {
  response.sendFile("dashboard.html", { root: "views" });
};

//FETCHING ALL USERS
exports.getAllUser = async (request, response, next) => {
  const Op = Sequelize.Op;
  const user = request.user;
  try {
    const data = await User.findAll({
      where: {
        email: { [Op.notIn]: [user.email] },
      },
    });

    response.status(200).json({ users: data });
  } catch (error) {
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

//CREATING NEW GROUP
exports.createGroup = async (request, response, next) => {
  try {
    const user = request.user;
    const { name, membersName } = request.body;
    const group = await Group.create({
      name,
      admin: user.email,
      UserEmail: user.email,
    });
    membersName.push(user.email);
    for (let i = 0; i < membersName.length; i++) {
      await GroupMember.create({
        GroupName: name,
        userid: membersName[i],
        UserEmail: membersName[i],
      });
    }

    return response
      .status(200)
      .json({ group, message: "Group is succesfylly created" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

//GETTING ALL GROUPS WHICH A USER BELONGS TO..
exports.getAllGroup = async (request, response, next) => {
  try {
    const user = request.user;
    const groups = await GroupMember.findAll({
      attributes: ["GroupName"],
      where: {
        userid: user.email,
      },
    });
    return response.status(200).json({ groupname: groups });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

//GETTING GROUP CHAT HISTORY
exports.getGroupChatHistory = async (request, response, next) => {
  try {
    const { groupName } = request.query;
    const chatHistory = await ChatHistory.findAll({
      where: {
        GroupName: groupName,
      },
    });
    return response.status(200).json({ chats: chatHistory });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

//CHECKING WHETHER USER IS A ADMIN OR NOT
exports.getUserStatus = async (request, response, next) => {
  try {
    const user = request.user;
    const groups = await Group.findAll({
      attributes: ["name"],
      where: {
        admin: user.email,
      },
    });
    return response.status(200).json({ groupname: groups });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

//FETCHING ALL THE GROUP MEMBERS
exports.getGroupMembers = async (request, response, next) => {
  const Op = Sequelize.Op;
  const user = request.user;
  const { groupName } = request.query;

  try {
    const groupMembers = await GroupMember.findAll({
      where: {
        GroupName: groupName,
        userid: { [Op.notIn]: [user.email] },
      },
    });

    return response.status(200).json({ members: groupMembers });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

//UPDATING GROUP
exports.updateGroup = async (request, response, next) => {
  const user = request.user;
  const Op = Sequelize.Op;
  const transaction = await sequelize.transaction();
  const { groupName } = request.query;
  const { newGroupName, membersName } = request.body;

  try {
    await Group.update(
      { name: newGroupName },
      {
        where: {
          name: groupName,
        },
      },
      { transaction }
    );
    await GroupMember.destroy(
      {
        where: {
          GroupName: newGroupName,
          userid: { [Op.notIn]: [user.email] },
        },
      },
      { transaction }
    );

    for (let i = 0; i < membersName.length; i++) {
      await GroupMember.create(
        {
          GroupName: newGroupName,
          userid: membersName[i],
          UserEmail: membersName[i],
        },
        { transaction }
      );
    }
    await transaction.commit();
    return response.status(200).json({ success: true });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

//SAVING MULTIMEDIA
exports.saveImages = async (request, response, next) => {
    try {
        const user = request.user;
        const image = request.file;
        const { GroupName } = request.body;
        const filename = `chat-images/group${GroupName}/user${user.email}/${Date.now()}_${image.originalname}`;
        const imageUrl = await awsService.uploadToS3(image.buffer, filename)
        await user.createChatHistory({
            message: imageUrl,
            GroupName,
            userid:user.email,
            UserName:user.email,
            isImage:true,

        })
    return response.status(200).json({ message: "image saved succesfully" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: 'Internal Server error!' })
    }
}
