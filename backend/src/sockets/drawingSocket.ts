import { Server, Socket } from "socket.io";
import fs from "fs";

const votes: any[] = [];
const playerList: { [socketId: string]: string } = {};
const lobbyPlayerList: { [socketId: string]: string } = {};

export const setupDrawingSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for "start game" event
    socket.on("start", () => {
      console.log("Game started");
      io.emit("started");

      setTimeout(() => {
        console.log("Game ended");
        io.emit("vote");

        setTimeout(() => {
          console.log("Display votes emitted");
          io.emit("heatmap", votes);
        }, 3 * 1000);
      }, 15 * 1000);
    });

    socket.on("slidebutton", () => {
      io.emit("slides");
    });
    socket.on("restartbutton", () => {
      io.emit("restart");
      votes.length = 0;
    });

    // voting sockets
    socket.on("submit", (voteData: any) => {
      console.log("Vote submitted", voteData);
      votes.push(voteData);
    });

    // drawing sockets
    socket.on("draw", (data: any) => {
      socket.broadcast.emit("draw", data);
    });

    socket.on("clear", () => {
      socket.broadcast.emit("clear");
    });

    socket.on("signup", (signUpData: { studentId: string; displayName: string }) => {
      console.log("User signed up:", signUpData);
      // Append the signup data to players.txt
      fs.appendFile(
        "players.txt",
        `${signUpData.studentId}:${signUpData.displayName}\n`,
        (err: any) => {
          if (err) {
            console.error("Error writing to players.txt:", err);
          }
        }
      );

      // Add the player to the playerList object
      playerList[socket.id] = signUpData.displayName;
      // Add the player to the lobbyPlayerList object
      lobbyPlayerList[socket.id] = signUpData.displayName;
      // Emit the "updatePlayerList" event to update the lobby
      io.emit("updatePlayerList", Object.values(lobbyPlayerList));
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      // Remove the player from the playerList object
      delete playerList[socket.id];
      // Check if the player was in the lobby and remove them from the lobbyPlayerList object
      if (lobbyPlayerList[socket.id]) {
        delete lobbyPlayerList[socket.id];
        // Emit the "updatePlayerList" event to update the lobby
        io.emit("updatePlayerList", Object.values(lobbyPlayerList));
      }
    });

    socket.on("start", () => {
      // Remove all players from the lobbyPlayerList object
      Object.keys(lobbyPlayerList).forEach((socketId) => {
        delete lobbyPlayerList[socketId];
      });
      // Emit the "updatePlayerList" event to update the lobby
      io.emit("updatePlayerList", Object.values(lobbyPlayerList));
    });

    socket.on("returnToLobby", () => {
      // Add the player back to the lobbyPlayerList object
      lobbyPlayerList[socket.id] = playerList[socket.id];
      // Emit the "updatePlayerList" event to update the lobby
      io.emit("updatePlayerList", Object.values(lobbyPlayerList));
    });
  });
};