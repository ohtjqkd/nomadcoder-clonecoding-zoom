import express from "express";
import http from "http"
import { PassThrough } from 'stream';
import WebSocket from "ws";
import SocketIO, { Socket } from "socket.io";
const app = express();

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);
app.use("/public", express.static(`${__dirname}/public`));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));


const handleListener = () => console.log(`Listening on ws://localhost:3000`);
console.log("hello");

const httpServer = http.createServer(app);

const wsServer = SocketIO(httpServer);

function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

wsServer.on("connection", socket => {
    socket["nickname"] = socket.id
    socket.onAny((event) => {
        console.log(wsServer.sockets.adapter);
        console.log(`Socket Event:${event}`);
    })
    socket.on("enter_room", (nickname, roomName, done) => {
        socket.join(roomName);
        socket["nickname"] = nickname;
        done(`Success join in ${roomName}`); // this is run on front
        socket.to(roomName).emit("welcome", socket.nickname);
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (message, roomName, done) => {
        socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
        done()
    });
})

/*const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "unk";
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected from the Browser"));
    socket.on("message", (message) => {
        const jsonMsg = JSON.parse(message);
        console.log(jsonMsg.type === "nickname");
        switch ( jsonMsg.type ) {
            case "newMessage":
                sockets.forEach((aSocket) => {
                    if (aSocket !== socket) {
                        aSocket.send(`${socket.nickname}: ${jsonMsg.payload}`)
                    }
                })
                break;
            case "nickname":
                socket["nickname"] = jsonMsg.payload;
                break;
            default:
                console.log("default");
                break;
        };
    });
}); */

httpServer.listen(3000, handleListener);