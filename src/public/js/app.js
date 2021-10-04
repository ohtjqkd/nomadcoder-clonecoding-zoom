const socket = io();

const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("#welcome>form");
const msgForm = document.querySelector("#message");
const room = document.querySelector("#room");
const nickname = document.querySelector("#nickname");

const myFace = document.querySelector("#myFace");
const cameraBtn = document.querySelector("#camera");
const muteBtn = document.querySelector("#mute");
const cameraSelect = document.querySelector("#cameras");
const audioInputSelect = document.querySelector("#mics");
const call = document.querySelector("#call");

room.hidden = true;
nickname.hidden = true;
call.hidden = true;

let myStream;
let myPeerConnection;
let myDataChannel;
let muted = false;
let cameraOff = false;
let roomName = "";

const userConf = {
    muted: false,
    cameraOff: false,
    mediaConstrains: {
        audio: {
            sampleSize: 1,
            echoCancellation: true
        },
        video: {
            facingMode: "user",
        }
    }
}

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

async function getVideoInputs() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === "videoinput");
        videoInputs.forEach((video) => {
            const option = document.createElement("option");
            option.value = video.deviceId;
            option.innerText = video.label;
            cameraSelect.appendChild(option);
        });
        console.log(videoInputs);
    } catch (e) {
        console.log(e);
    }
}

async function getAudioInputs() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((device) => device.kind === "audioinput");
        audioInputs.forEach((device) => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.innerText = device.label;
            audioInputSelect.appendChild(option);
        });
        console.log(audioInputs);
    } catch (e) {
        console.log(e);
    }
}

async function getMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({video: userConf.mediaConstrains});
        myFace.srcObject = myStream;
        console.log(myStream);
    } catch (e) {
        console.log(e);
    }
}
async function getVideoMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({video: userConf.mediaConstrains});
        myFace.srcObject = myStream;
        console.log(myStream);
    } catch (e) {
        console.log(e);
    }
}
async function getAudioMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia(userConf.mediaConstrains.audio);
        myFace.srcObject = myStream;
        console.log(myStream);
    } catch (e) {
        console.log(e);
    }
}

function showRoom() {
    welcome.hidden = true;
    const h3 = room.querySelector("h3");
    h3.innerText = `${roomName}`;
    const msgForm = room.querySelector("#message");
    msgForm.addEventListener("submit", handleMessageSubmit);
    console.log("show room");
}

function showNicknameForm() {
    const nicknameForm = nickname.querySelector("form");
    const input = nicknameForm.querySelector("input");
    nicknameForm.addEventListener("submit", handleNicknameSubmit);
    nickname.hidden = false;
    console.log(input);
    input.focus();
}

async function makeConnection() {
    myPeerConnection = await new RTCPeerConnection({
        iceservers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ]
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
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
    
async function initCall(serverMsg) {
    console.log(serverMsg);
    room.hidden = false;
    call.hidden = false;
    await getVideoMedia();
    makeConnection();
}

function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input");
    roomName = input.value;
    input.value = "";
    showNicknameForm();
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

async function handleNicknameSubmit(event) {
    event.preventDefault();
    const nickForm = document.querySelector("#nickname");
    const input = nickForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value, roomName, initCall);
    nickForm.hidden = true;
}

function handleIce(data) {
    console.log(data);
    socket.emit("ice", data.candidate, roomName);
    console.log("sent candidate");
}

function handleAddStream(data) {
    const peerFace = document.querySelector("#peerFace");
    peerFace.srcObject = data.stream;

}

function handleMuteClick() {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!cameraOff) {
        cameraBtn.innerText = "Turn Off Camera";
        cameraOff = true;
    } else {
        cameraBtn.innerText = "Turn On Camera";
        cameraOff = false;
    }
}

function changeAudioInput(event) {
    console.log(event.target.value);
    userConf.mediaConstrains.audio = { deviceId: event.target.value };
    console.log(userConf.mediaConstrains)
    getMedia();
}

function changeCamera(event) {
    console.log(event.target.value);
    userConf.mediaConstrains.audio = { deviceId: event.target.value };
    console.log(userConf.mediaConstrains)
    getVideoMedia();
    console.log(myStream);
}

socket.on("join_room", async (socket_id) => {
    addMessage(`${socket_id} joined!`);
    myDataChannel = await myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", console.log);
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("create", offer);
    socket.emit("offer", offer, roomName);
})

socket.on("offer", async (offer) => {
    console.log("received the offer");
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", console.log);
    })
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
});

socket.on("answer", (answer) => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", async (ice) => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
})

socket.on("bye", (socket_id) => {
    addMessage(`${socket_id} left room TT`);
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
});

welcomeForm.addEventListener("submit", handleWelcomeSubmit);
msgForm.addEventListener("submit", handleMessageSubmit);
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
audioInputSelect.addEventListener("change", changeAudioInput);
cameraSelect.addEventListener("change", changeCamera);

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