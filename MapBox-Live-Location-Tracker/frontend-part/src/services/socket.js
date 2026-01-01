import { io } from "socket.io-client";

const socket = io("192.168.29.29:1717", {
  transports: ["polling", "websocket"], 
  withCredentials: false,
});

export default socket;
