import { Server, Socket } from "socket.io";
import { logToFile } from "@src/util/logger";



interface ChatMessage {
  username: string;
  message: string;
  studentId: string;
}

export function setupChatSocket(io: Server): void {
  const chatNamespace = io.of("/chat");

  chatNamespace.on("connection", (socket: Socket) => {
    console.log("User connected to chat:", socket.id);

    // Join chat room
    socket.on("joinRoom", (room: string, callback: (response: string) => void) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
      callback("Joined"); // acknowledge the join
    });
    // Receive chat message
    socket.on("sendMessage", (message: ChatMessage, room: string) => {
      chatNamespace.to(room).emit("receiveMessage", message);
      
      const logData: any = {
        tag: 'ChatMessage',
        timestamp: new Date(),
        username: message.username,
        studentId: message.studentId,
        description: `${message.message}`
      };
      logToFile(logData);
    });

    // Correct Guess
    socket.on("correctGuess", (message: ChatMessage, room: string) => {
      chatNamespace.to(room).emit("receiveMessage", message);
      
      const logData: any = {
        tag: 'CorrectGuess',
        timestamp: new Date(),
        username: message.username,
        studentId: message.studentId,
        description: `${message.message}`
      };
      logToFile(logData);
    });
    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected from chat:", socket.id);
    });
  });
}