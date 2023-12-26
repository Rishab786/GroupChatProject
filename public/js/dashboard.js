const socket = io();
const tokenData = JSON.parse(localStorage.getItem("token"));
const body = document.getElementById("body");
let oldGroupName;
let nameOfGroup = undefined;
const authenticatedAxios = axios.create({
  headers: {
    Authorization: `${tokenData.token}`,
    userId: `${tokenData.name}`,
  },
});

socket.on("message-recieved", () => {
  showGroupChats(nameOfGroup);
});

socket.on("group-created", () => {
  showingAllGroup();
});

socket.on("updated", () => {
  showingAllGroup();
});

//GETTING ALL USERS
async function showingAllUser() {
  try {
    const usersResponse = await authenticatedAxios.get("/user/getAllUser");
    userList.innerHTML = `
          <input id="groupName" type="text" placeholder="Group Name">
          <button onclick="createGroup()"> create</button>
          <h3>Add Members</h3>
          <input type="text" id="myInput" onkeyup="search()" placeholder="Search for names.." title="Type in a name">
          
          `;

    let text = "";
    const { users } = usersResponse.data;
    users.forEach((user) => {
      text += `                                    
          <li >
              <strong>${user.email}</strong>
              <input type="checkbox" name="users" value="${user.email}">
          </li>`;
    });
    userList.innerHTML += text;
  } catch (error) {
    console.log(error);
  }
}

//CREATING NEW GROUP
async function createGroup() {
  const userList = document.getElementById("userList");
  const groupName = document.getElementById("groupName").value;
  if (groupName == "") {
    alert("Please Enter Group Name");
  } else {
    const selectedUsers = Array.from(
      userList.querySelectorAll('input[name="users"]:checked')
    ).map((checkbox) => checkbox.value);
    const data = {
      name: groupName,
      membersName: selectedUsers,
    };
    await authenticatedAxios.post("/user/createGroup", data);

    alert("Group created successfully");
    socket.emit("creating-group");
    showingAllGroup();
  }
}

//DISPLAYING ALL GROUPS
async function showingAllGroup() {
  try {
    const groupsResponse = await authenticatedAxios(`/user/getAllGroup`);

    const { groupname } = groupsResponse.data;
    body.innerHTML = ` <button class="button-19" id="newGrp" onclick="showingAllUser()">Create new Group</button>
          <h1><strong>GROUPS:</strong></h1>
          `;
    let text = "";
    const userStatus = await authenticatedAxios(`/user/getUserStatus`);
    groupname.forEach((group) => {
      text += `
                  <button class="button-20" id="${group.GroupName}"  onclick=showGroupChats(this)>${group.GroupName}</button>
           `;
    });

    body.innerHTML += text;
    const footer = `<ul id="userList"></ul>`;
    body.innerHTML += footer;
    for (let i = 0; i < userStatus.data.groupname.length; i++) {
      const group = userStatus.data.groupname[i].name;

      const element = document.getElementById(group);
      const button = document.createElement("button");
      button.innerText = "Edit";
      button.className = "allign";
      button.id = group;
      button.setAttribute("onclick", "editGroup(this)");
      element.insertAdjacentElement("afterend", button);
    }
  } catch (error) {
    console.log(error);
  }
}

//SHOWING GROUP CHATS
async function showGroupChats(element) {
  try {
    let group;
    if (nameOfGroup == undefined) {
      nameOfGroup = element.id;
      group = element.id;
    } else {
      group = nameOfGroup;
    }

    const chatResponse = await axios.get(
      `/user/getGroupMessages?groupName=${group}`
    );
    const chats = chatResponse.data.chats;
    createElement(chats);
  } catch (error) {
    console.log(error);
    alert(error.response.data.message);
  }
}

//SAVING USER MESSAGES
async function saveMessage() {
  const group = nameOfGroup;

  const message = document.getElementById("mssg").value;
  const file = document.getElementById("file").value;
  if (message.trim() == "" && file == "") {
    alert("Not a Valid Input");
  } else if (message.length > 0) {
    const myObj = {
      Message: message,
    };

    await authenticatedAxios.post(
      `/user/postGroupMessage?groupName=${group}`,
      myObj
    );
    socket.emit("message-sent");
    showGroupChats(nameOfGroup);
  } else {
    var inputFile = document.getElementById("file");

    const formData = new FormData();
    const file = inputFile.files[0];
    formData.append("image", file);
    formData.append("GroupName", group);
    await authenticatedAxios.post("/user/postImage", formData);
  }
  socket.emit("message-sent");
  showGroupChats(nameOfGroup);
}

//DISPLAYING MESSAGES
async function createElement(data) {
  body.innerHTML = `
    <section class="msger" id="section">
        <header class="msger-header">
            <div class="msger-header-title">
                <i class="fas fa-comment-alt"></i> ChatApp
            </div>
            <div class="msger-header-options">
                <span><i class="fas fa-cog"></i></span>
            </div>
        </header>

        <main class="msger-chat" id="root">
        </main>

        <form class="msger-inputarea" id="form">

        </form>
    </section>
    
    `;
  let rootElement = document.getElementById("root");
  const formElement = document.getElementById("form");
  rootElement.innerHTML = "";
  formElement.innerHTML = "";
  let html;
  for (let i = 0; i < data.length; i++) {
    if (data[i].isImage) {
      html = `
        <div class="msg-info-name" id="name">${data[i].userid}
        
        </div>
        <a href="${data[i].message}" target="_blank">
                      <img src="${data[i].message}" class="chat-image" width="200" height="200">
                    </a>
        
        `;
    } else {
      html = ` 
    
    <div class="msg left-msg">
    <div class="msg-bubble" >
      <div class="msg-info">
    <div class="msg-info-name" id="name">${data[i].userid}</div>
    
  </div>

  <div class="msg-text" id="message">
    ${data[i].message}
  </div>
</div>
</div>

`;
    }
    rootElement.innerHTML += html;
  }
  const footer = `
    <input id="mssg" name="message" type="text" class="msger-input" placeholder="Enter your message...">
    
    <input type="file" accept="image/*" name="image" id="file"">
    
   
    <button id="${nameOfGroup}" class="msger-send-btn">Send</button>
  
    `;

  formElement.innerHTML = footer;
  document.getElementById(nameOfGroup).addEventListener("click", (e) => {
    e.preventDefault();
    saveMessage(e);
  });
}

//EDIT GROUP
async function editGroup(group) {
  try {
    const groupName = group.id;
    oldGroupName = groupName;
    const memberResponse = await authenticatedAxios(
      `/user/getGroupMembers?groupName=${groupName}`
    );
    const usersResponse = await authenticatedAxios.get("/user/getAllUser");
    const members = memberResponse.data.members;
    const memberId = [];
    for (let i = 0; i < members.length; i++) {
      memberId.push(members[i].userid);
    }

    const users = usersResponse.data.users;

    userList.innerHTML = `
            <input id="groupName" type="text" placeholder="New Group Name" value=${groupName}>
            <button onclick="updateGroup()">Update</button>
            <h3>Add Members</h3>
            <input type="text" id="myInput" onkeyup="search()" placeholder="Search for names.." title="Type in a name">
            
            `;

    let text = "";

    users.forEach((user) => {
      if (memberId.includes(user.email)) {
        text += `                                    
            <li >
                <strong>${user.email}</strong>
                <input checked="checked" type="checkbox" name="users" value="${user.email}">
            </li>`;
      } else {
        text += `                                    
            <li >
                <strong>${user.email}</strong>
                <input  type="checkbox" name="users" value="${user.email}">
            </li>`;
      }
    });
    userList.innerHTML += text;
  } catch (error) {
    console.log(error);
  }
}

//SEARCHING A USER
async function search() {
  var input, filter, ul, li, a, i, txtValue;
  ul = document.getElementById("userList");
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  li = ul.getElementsByTagName("li");
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("input")[0];
    console.log(a);
    txtValue = a.value || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

//UPDATING GROUP
async function updateGroup() {
  const userList = document.getElementById("userList");
  const groupName = document.getElementById("groupName").value;
  const element = document.getElementById(oldGroupName);
  element.id = groupName;

  const selectedUsers = Array.from(
    userList.querySelectorAll('input[name="users"]:checked')
  ).map((checkbox) => checkbox.value);
  const data = {
    newGroupName: groupName,
    membersName: selectedUsers,
  };

  await authenticatedAxios.post(
    `/user/updateGroup?groupName=${oldGroupName}`,
    data
  );
  alert("Group updated successfully");
  socket.emit("updating");
  showingAllGroup();
}

showingAllGroup();
