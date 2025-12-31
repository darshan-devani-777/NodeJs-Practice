import { io } from "socket.io-client";

const socket = io("http://192.168.29.89:7000", {
  transports: ["websocket"],
});

export default socket;
