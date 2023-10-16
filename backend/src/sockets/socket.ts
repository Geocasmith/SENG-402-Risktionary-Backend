import { Server, Socket } from "socket.io";
import { logToFile, logEvent } from "@src/util/logger";
import fs from "fs";

// Constants
const VOTING_TIMEOUT = 7 * 1000;
const DRAWING_TIMEOUT = 90 * 1000;

// Variables
const votes: any[] = [];
const playerList: { [socketId: string]: string } = {};
const lobbyPlayerList: { [socketId: string]: string } = {};
const volunteeredPlayers: string[] = [];

let gameEndTimeout: NodeJS.Timeout | null = null;
let currentVoteKey = 0;


export const setupDrawingSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);
      socket.emit("updateVoteKey", currentVoteKey);

      // Game State Event Handlers
      socket.on("start", (voteKey: number) => handleGameStart(io, voteKey));
      socket.on("skip", () => handleSkip(io));
      socket.on("slidebutton", () => handleSlideButton(io));
      socket.on("restartbutton", () => handleRestartButton(io));
      // socket.on("start", () => handleStart(io));
      socket.on("returnToLobby", () => handleReturnToLobby(io, socket));

      // Drawing Event Handlers
      socket.on("draw", (data: any) => handleDraw(socket, data));
      socket.on("clear", () => handleClear(socket));

      // Lobby/Volunteering Event Handlers
      socket.on("volunteer", (playerName: string, playerID: string) => handleVolunteer(io, playerName, playerID));
      socket.on("devolunteer", (playerName: string, playerID: string) => handleDevolunteer(io, playerName, playerID));
      socket.on("selectPlayer", (selectedPlayerName: string) => handlePlayerSelection(io, selectedPlayerName));
      socket.on("signup", (signUpData: { studentId: string; displayName: string }) => handleSignup(io, socket, signUpData));
      socket.on("disconnect", () => handleDisconnect(io, socket));

      // Voting Event Handlers
      socket.on("submit", (voteData: any) => handleSubmit(io, voteData));
  });
};

// Game State Events
const handleGameStart = (io: Server, voteKey: number) => {
  console.log("Game started with vote key:", voteKey);
  currentVoteKey = voteKey;  
  io.emit("started", voteKey);
  logEvent("Gamestate", "", "", "Changed to Drawing with vote key: " + voteKey);

  if (gameEndTimeout) {
      clearTimeout(gameEndTimeout);
  }
  // Start voting stage after 90 seconds
  gameEndTimeout = setTimeout(() => startVoting(io), DRAWING_TIMEOUT);

  // Empties the lobby player list after the game starts
  Object.keys(lobbyPlayerList).forEach((socketId) => {
    delete lobbyPlayerList[socketId];
  });
  io.emit("updatePlayerList", Object.values(lobbyPlayerList));
};

const startVoting = (io: Server) => {
  console.log("Game ended");
  io.emit("vote");
  logEvent("Gamestate", "", "", "Changed to Voting");

  setTimeout(() => {
      console.log("Display votes emitted");
      io.emit("heatmap", votes);
      logEvent("Gamestate", "", "", "Changed to Heatmap");
  }, VOTING_TIMEOUT);
};


// Handle skip button on the drawing page
const handleSkip = (io: Server) => {
  console.log("Skip received");

  if (gameEndTimeout) {
      console.log("Trying to clear timeout");
      clearTimeout(gameEndTimeout);
      startVoting(io);
  }
};

// Handle the next button on the heatmap page
const handleSlideButton = (io: Server) => {
  io.emit("slides");
  logEvent("Gamestate", "", "", "Changed to Slides");
};

// Handle the next button on the slides page
const handleRestartButton = (io: Server) => {
  io.emit("restart");
  logEvent("Gamestate", "", "", "Changed to Restart");
  votes.length = 0;
};

// const handleStart = (io: Server) => {
//   Object.keys(lobbyPlayerList).forEach((socketId) => {
//       delete lobbyPlayerList[socketId];
//   });
//   io.emit("updatePlayerList", Object.values(lobbyPlayerList));
// };

const handleReturnToLobby = (io: Server, socket: Socket) => {
  lobbyPlayerList[socket.id] = playerList[socket.id];
  io.emit("updatePlayerList", Object.values(lobbyPlayerList));
};

// Drawing Events

const handleDraw = (socket: Socket, data: any) => {
  socket.broadcast.emit("draw", data);
};

const handleClear = (socket: Socket) => {
  socket.broadcast.emit("clear");
};

// Lobby/Volunteering Events

const handleVolunteer = (io: Server, playerName: string, playerID: string) => {
  volunteeredPlayers.push(playerName);
  io.emit("playerVolunteered", volunteeredPlayers);
  logEvent("Volunteer", playerName, playerID);
};

const handleDevolunteer = (io: Server, playerName: string, playerID: string) => {
  const index = volunteeredPlayers.indexOf(playerName);
  if (index > -1) {
      volunteeredPlayers.splice(index, 1);
  }
  io.emit("playerVolunteered", volunteeredPlayers);
  logEvent("Devolunteer", playerName, playerID);
};

const handlePlayerSelection = (io: Server, selectedPlayerName: string) => {
  const studentId = Object.keys(playerList).find(key => playerList[key] === selectedPlayerName) || "Unknown"; 
  io.emit("playerSelected", selectedPlayerName);
  logEvent("Selected", selectedPlayerName, studentId, "Student selected to draw");
};

const handleSignup = (io: Server, socket: Socket, signUpData: { studentId: string; displayName: string }) => {
  console.log("User signed up:", signUpData);
  logEvent("Join", signUpData.displayName, signUpData.studentId, "User joined the game");

  fs.appendFile("players.txt", `${signUpData.studentId}:${signUpData.displayName}\n`, (err: any) => {
      if (err) {
          console.error("Error writing to players.txt:", err);
      }
  });

  playerList[socket.id] = signUpData.displayName;
  lobbyPlayerList[socket.id] = signUpData.displayName;
  io.emit("updatePlayerList", Object.values(lobbyPlayerList));
};

const handleDisconnect = (io: Server, socket: Socket) => {
  console.log(`User disconnected: ${socket.id}`);
  if (gameEndTimeout) {
      clearTimeout(gameEndTimeout);
  }
  delete playerList[socket.id];
  if (lobbyPlayerList[socket.id]) {
      delete lobbyPlayerList[socket.id];
      io.emit("updatePlayerList", Object.values(lobbyPlayerList));
  }
};

// Voting Events
const handleSubmit = (io: Server, voteData: any) => {
  console.log("Vote submitted", voteData);
  votes.push(voteData);
  logEvent("Vote", voteData.displayName, voteData.studentId, `Voted with Risk: ${voteData.risk}, Probability: ${voteData.probability}, Drawing: ${voteData.drawing}`);
};

// Helper for test class
const setGameEndTimeout = (timeout: NodeJS.Timeout) => {
  gameEndTimeout = timeout;
};

export { logEvent, handleGameStart, startVoting, handleSlideButton, handleSkip, handleRestartButton, handleReturnToLobby, handleDraw, handleClear, handleVolunteer, handleDevolunteer, handlePlayerSelection, handleSignup, handleDisconnect, handleSubmit,setGameEndTimeout, votes, playerList, lobbyPlayerList, volunteeredPlayers, gameEndTimeout, currentVoteKey,VOTING_TIMEOUT };