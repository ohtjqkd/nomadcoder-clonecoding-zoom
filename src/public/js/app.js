const socket = io();

const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("#welcome>form");
const room = document.querySelector("#room");
const nickname = document.querySelector("#nickname");
room.hidden = true;
nickname.hidden = true;

let roomName = "";

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `${roomName}`;
    const msgForm = room.querySelector("#message");
    msgForm.addEventListener("submit", handleMessageSubmit);
    console.log("show room");
}

function showNicknameForm() {
    const nicknameForm = nickname.querySelector("form");
    nicknameForm.addEventListener("submit", handleNicknameSubmit);
    nickname.hidden = false;
}


function handleMessageSubmit(event) {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input");
    let message = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${message}`);
    });
    input.value = "";
}

// function handleRoomSubmit(event){
//     event.preventDefault();
//     socket.emit("enter_room", roomName, showRoom);
// };

function handleNicknameSubmit(event) {
    event.preventDefault();
    const nickForm = document.querySelector("#nickname");
    const input = nickForm.querySelector("input");
    socket.emit("enter_room", input.value, roomName, (res) => {
        console.log(res);

        nickForm.hidden = true;
    });
}

function setRoom(event) {
    event.preventDefault();
    console.log("hi");
    const input = welcomeForm.querySelector("input");
    roomName = input.value;
    input.value = "";
    showRoom();
    showNicknameForm();
}

welcomeForm.addEventListener("submit", setRoom);

socket.on("welcome", (socket_id) => {
    addMessage(`${socket_id} joined!`);
})

socket.on("bye", (socket_id) => {
    addMessage(`${socket_id} left room TT`);
})

socket.on("new_message", addMessage);
// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");

// const socket = new WebSocket(`ws://${window.location.host}`);
// socket.addEventListener("open", () => {
//     console.log("Connected to Server");
// });

// socket.addEventListener("message", (message) => {
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// });

// socket.addEventListener("close", () => {
//     console.log("Disconnected to Server")
// })

// // setTimeout(() => {
// //     console.log("send to server");
// //     socket.send("hello from the browser!");
// // }, 10000);

// function makeMessage(type, payload) {
//     const msg = {type, payload};
//     return JSON.stringify(msg)
// }

// function handleSubmit(event) {
//     event.preventDefault();
//     const input = messageForm.querySelector("input");
//     const li = document.createElement("li");
//     li.innerText = `You: ${input.value}`;
//     messageList.append(li);
//     socket.send(makeMessage("newMessage", input.value));
//     input.value = "";
// }

// function handleNickSubmit(event) {
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname", input.value));
// }

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);