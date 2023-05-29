import { Server, Socket } from "socket.io";

interface ChatMessage {
  username: string;
  message: string;
}

export function setupChatSocket(io: Server): void {
  const chatNamespace = io.of("/chat");

  chatNamespace.on("connection", (socket: Socket) => {
    console.log("User connected to chat:", socket.id);

    // Join chat room
    socket.on("joinRoom", (room: string) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });

    // Receive chat message
    socket.on("sendMessage", (message: ChatMessage, room: string) => {
      chatNamespace.to(room).emit("receiveMessage", message);
      console.log(`Message sent in room ${room}:`, message);
    });

    // Correct Guess
    socket.on("correctGuess", (message: ChatMessage, room: string) => {
      chatNamespace.to(room).emit("receiveMessage", message);
      console.log(`Correct guess message in room ${room}:`, message);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected from chat:", socket.id);
    });
  });
}
