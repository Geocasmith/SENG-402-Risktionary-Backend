import { Server, Socket } from "socket.io";
import fs from "fs";
import { logToFile } from "@src/util/logger";

const votes: any[] = [];
const playerList: { [socketId: string]: string } = {};
const lobbyPlayerList: { [socketId: string]: string } = {};
const volunteeredPlayers: string[] = [];

let gameEndTimeout: NodeJS.Timeout | null = null; 
let currentVoteKey = 0; // Store the voteKey on the server

export const setupDrawingSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a user connects, emit the current voteKey to them. This is to ensure all users are on the same word on a late join
    socket.emit("updateVoteKey", currentVoteKey);

    const startVoting = () => {
      console.log("Game ended");
      io.emit("vote");
      logToFile({tag: "Gamestate",timestamp: new Date(),username: "",studentId: "",description: "Changed to Voting"});

      setTimeout(() => {
        console.log("Display votes emitted");
        io.emit("heatmap", votes);
        logToFile({tag: "Gamestate",timestamp: new Date(),username: "",studentId: "",description: "Changed to Heatmap"});
      }, 7 * 1000);
    };
    // When a student volunteers to draw
    io.emit("playerVolunteered", volunteeredPlayers);

    socket.on("volunteer", (playerName: string,playerID:string) => {
    
      // Add the player to the volunteered list
        volunteeredPlayers.push(playerName);
      // Emit the updated list of volunteers
      io.emit("playerVolunteered", volunteeredPlayers);
      // Log
      logToFile({tag: "Volunteer",timestamp: new Date(),username: playerName,studentId: playerID || "Unknown",description: ""});});
    socket.on("devolunteer", (playerName: string,playerID:string) => {
      // Remove the player from the volunteered list
      const index = volunteeredPlayers.indexOf(playerName);
      if (index > -1) {
        volunteeredPlayers.splice(index, 1);
      }
        
      // Emit the updated list of volunteers
      io.emit("playerVolunteered", volunteeredPlayers);
      // Log
      logToFile({tag: "Devolunteer",timestamp: new Date(),username: playerName,studentId: playerID || "Unknown",description: ""});
  });

    // When a student is selected
    socket.on("selectPlayer", (selectedPlayerName: string) => {
      const studentId = Object.keys(playerList).find(key => playerList[key] === selectedPlayerName); 
      io.emit("playerSelected", selectedPlayerName);
      logToFile({tag: "Selected",timestamp: new Date(),username: selectedPlayerName,studentId: studentId || "Unknown",description: "Student selected to draw"
    });    });

    // Listen for "start game" event
    socket.on("start", (voteKey: number) => {
      console.log("Game started with vote key:", voteKey);
      currentVoteKey = voteKey;  
      io.emit("started", voteKey);
      logToFile({tag: "Gamestate",timestamp: new Date(),username: "",studentId: "",description: "Changed to Drawing with vote key: " + voteKey});
      
      // Clear any existing gameEndTimeout
      if (gameEndTimeout) {
        clearTimeout(gameEndTimeout);
      }

      // Start the timer for the end of the game
      gameEndTimeout = setTimeout(startVoting, 90 * 1000);
    });

    // Listen for "skip" event
    socket.on("skip", () => {
      console.log("Skip received");

      // If the game is running, end it early
      if (gameEndTimeout) {
        console.log("Trying to clear timeout");
        clearTimeout(gameEndTimeout);
        startVoting();
      }
    });
    

    socket.on("slidebutton", () => {
      io.emit("slides");
      logToFile({tag: "Gamestate",timestamp: new Date(),username: "",studentId: "",description: "Changed to Slides"});
    });
    socket.on("restartbutton", () => {
      io.emit("restart");
      logToFile({tag: "Gamestate",timestamp: new Date(),username: "",studentId: "",description: "Changed to Restart"});
      votes.length = 0;
    });

    // voting sockets
    socket.on("submit", (voteData: any) => {
      console.log("Vote submitted", voteData);
      votes.push(voteData);
      logToFile({tag: "Vote",timestamp: new Date(),username: voteData.displayName,studentId: voteData.studentId,description: `Voted with Risk: ${voteData.risk}, Probability: ${voteData.probability}, Drawing: ${voteData.drawing}`});
    });

    // drawing sockets
    socket.on("draw", (data: any) => {
      socket.broadcast.emit("draw", data);
    });

    socket.on("clear", () => {
      socket.broadcast.emit("clear");
    });

    socket.on("clear", () => {
      socket.broadcast.emit("clear");
    });

    socket.on("signup", (signUpData: { studentId: string; displayName: string }) => {
      console.log("User signed up:", signUpData);
      logToFile({tag: "Join",timestamp: new Date(),username: signUpData.displayName,studentId: signUpData.studentId,description: "User joined the game"});
      //Add to player list file
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
      if (gameEndTimeout) {
        clearTimeout(gameEndTimeout);
      }
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
