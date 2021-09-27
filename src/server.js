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