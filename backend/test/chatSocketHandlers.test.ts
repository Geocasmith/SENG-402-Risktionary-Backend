import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";
import { setupChatSocket } from "./../src/sockets/chatSocket";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("Chat socket tests", () => {
  let io: Server;
  let clientSocket: ClientSocket;

  interface ChatMessage {
    username: string;
    message: string;
    studentId: string;
  }

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    setupChatSocket(io);  
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}/chat`);  
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  test("User should be able to join a room", (done) => {
    const roomName = "testRoom";
    clientSocket.emit("joinRoom", roomName, (response:any) => {
      expect(response).toBe("Joined");
      done();
    });
});
test("User should be able to send and receive a chat message", (done) => {
    const roomName = "testRoom";
    const chatMessage: ChatMessage = {
      username: "testUser",
      message: "Hello, World!",
      studentId: "12345",
    };
    
    clientSocket.emit("joinRoom", roomName, () => {
      clientSocket.on("receiveMessage", (receivedMessage: ChatMessage) => {
        expect(receivedMessage).toEqual(chatMessage);
        done();
      });

      clientSocket.emit("sendMessage", chatMessage, roomName);
    });
  });
  test("User should be able to send and receive a chat message", (done) => {
    clientSocket.off("receiveMessage");  // Clear previous listeners

    const roomName = "chatTestRoom";
    const chatMessage: ChatMessage = {
      username: "testUser",
      message: "Hello, World!",
      studentId: "12345",
    };
    
    clientSocket.emit("joinRoom", roomName, () => {
      clientSocket.on("receiveMessage", (receivedMessage: ChatMessage) => {
        expect(receivedMessage).toEqual(chatMessage);
        done();
      });

      clientSocket.emit("sendMessage", chatMessage, roomName);
    });
  });

  test("User should be able to send a correct guess and receive it", (done) => {
    clientSocket.off("receiveMessage");  

    const roomName = "guessTestRoom";
    const correctGuess: ChatMessage = {
      username: "testUser",
      message: "I guessed it right!",
      studentId: "12345",
    };

    clientSocket.emit("joinRoom", roomName, () => {
      clientSocket.on("receiveMessage", (receivedMessage: ChatMessage) => {
        expect(receivedMessage).toEqual(correctGuess);
        done();
      });

      clientSocket.emit("correctGuess", correctGuess, roomName);
    });
  });

  
});
