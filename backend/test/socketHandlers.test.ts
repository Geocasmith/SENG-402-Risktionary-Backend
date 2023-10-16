
import { createServer } from "http";
import { AddressInfo } from "net";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { Server, Socket as ServerSocket } from "socket.io";
import { handleGameStart, startVoting, handleSlideButton, handleSkip, handleRestartButton, handleReturnToLobby, handleDraw, handleClear, handleVolunteer, handleDevolunteer, handlePlayerSelection, handleSignup, handleDisconnect, handleSubmit, votes, playerList, lobbyPlayerList, volunteeredPlayers, gameEndTimeout,setGameEndTimeout, currentVoteKey, VOTING_TIMEOUT } from './../src/sockets/socket';
import { logEvent } from "./../src/util/logger";

// Mock the logEvent function
jest.mock("@src/util/logger", () => ({
  logToFile: jest.fn(),
  logEvent: jest.fn(),
}));

describe("Socket event handlers", () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;
  let mockIO: any;
  let mockEmit: jest.Mock;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  beforeEach(() => {
    mockEmit = jest.fn();
    mockIO = {
      emit: mockEmit
    };
  });

  test("handleGameStart should emit started with the provided voteKey", (done) => {
    clientSocket.on("started", (voteKey) => {
      expect(voteKey).toBe(0);
      done();
    });
    handleGameStart(io, 0);
  });

  test("handleSlideButton should emit slides and log an event", (done) => {
    clientSocket.on("slides", () => {
      expect(logEvent).toHaveBeenCalledWith("Gamestate", "", "", "Changed to Slides");
      done();
    });

    // Trigger the handleSlideButton function
    handleSlideButton(io);
  });
  test("handleRestartButton should emit restart, log event, and clear votes", (done) => {
    // Prepare
    votes.push({ test: "dummyVote" }); 

    clientSocket.on("restart", () => {
      expect(logEvent).toHaveBeenCalledWith("Gamestate", "", "", "Changed to Restart");
      expect(votes.length).toBe(0); // Expect votes to be cleared
      done();
    });

    // Execute
    handleRestartButton(io);
  });

  test("handleReturnToLobby should update lobbyPlayerList and emit updated player list", (done) => {
    // Prepare
    const dummySocket: any = { id: "dummySocketId" };
    playerList[dummySocket.id] = "testPlayer";

    clientSocket.on("updatePlayerList", (updatedList) => {
      expect(updatedList).toContain("testPlayer");
      done();
    });

    // Execute
    handleReturnToLobby(io, dummySocket);
});

// test("startVoting should emit vote, log event, and after a delay emit heatmap with votes", () => {
//   startVoting(mockIO);

//   // Check immediate emissions
//   expect(mockEmit).toHaveBeenCalledWith("vote");
//   expect(logEvent).toHaveBeenCalledWith("Gamestate", "", "", "Changed to Voting");

//   // Move the timer forward by VOTING_TIMEOUT to allow the "heatmap" event to be emitted
//   jest.advanceTimersByTime(VOTING_TIMEOUT);

//   // Check emissions after advancing the timer
//   expect(mockEmit).toHaveBeenCalledWith("heatmap", votes);
//   expect(logEvent).toHaveBeenCalledWith("Gamestate", "", "", "Changed to Heatmap");
// });


// test("handleSkip should clear gameEndTimeout and call startVoting", () => {
//   setGameEndTimeout(setTimeout(() => {}, 1000));  // Using our new function to set gameEndTimeout

//   handleSkip(mockIO);
//   jest.advanceTimersByTime(VOTING_TIMEOUT);

//   expect(mockEmit).toHaveBeenCalledWith("vote");
//   expect(logEvent).toHaveBeenCalledWith("Gamestate", "", "", "Changed to Voting");
// });
describe("Drawing related handlers", () => {
  // Mocking the broadcast.emit function
  const mockEmit = jest.fn();

  let mockSocket: any;

  beforeEach(() => {
    // Create a mock socket object with broadcast.emit function
    mockSocket = {
      broadcast: {
        emit: mockEmit,
      },
    };

    // Reset the mockEmit function before each test
    mockEmit.mockReset();
  });

  test("handleDraw should broadcast draw event with provided data", () => {
    const testData = { x: 10, y: 20, color: "red" };

    handleDraw(mockSocket, testData);

    expect(mockEmit).toHaveBeenCalledWith("draw", testData);
  });

  test("handleClear should broadcast clear event", () => {
    handleClear(mockSocket);

    expect(mockEmit).toHaveBeenCalledWith("clear");
  });
});
describe("Lobby/Volunteering Event handlers", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  const mockEmit = jest.fn();

  beforeEach(() => {
    // Reset the mockEmit function and volunteeredPlayers array before each test
    mockEmit.mockReset();
    volunteeredPlayers.length = 0;
  });

  test("handleVolunteer should add player to volunteeredPlayers, emit event, and log event", () => {
    const mockIO: any = {
      emit: mockEmit,
    };
    const playerName = "John";
    const playerID = "12345";

    handleVolunteer(mockIO, playerName, playerID);

    expect(volunteeredPlayers).toContain(playerName);
    expect(mockEmit).toHaveBeenCalledWith("playerVolunteered", [playerName]);
    expect(logEvent).toHaveBeenCalledWith("Volunteer", playerName, playerID);
  });

  test("handleDevolunteer should remove player from volunteeredPlayers, emit event, and log event", () => {
    const mockIO: any = {
      emit: mockEmit,
    };
    const playerName = "Jane";
    const playerID = "67890";

    // Add Jane to volunteeredPlayers for this test
    volunteeredPlayers.push(playerName);

    handleDevolunteer(mockIO, playerName, playerID);

    expect(volunteeredPlayers).not.toContain(playerName);
    expect(mockEmit).toHaveBeenCalledWith("playerVolunteered", []);
    expect(logEvent).toHaveBeenCalledWith("Devolunteer", playerName, playerID);
  });
  test("handlePlayerSelection should emit selected player and log event", () => {
    const mockIO: any = {
        emit: mockEmit,
    };
    const selectedPlayerName = "John";
    const mockSocketId = "socket123";
    playerList[mockSocketId] = selectedPlayerName;

    handlePlayerSelection(mockIO, selectedPlayerName);

    expect(mockEmit).toHaveBeenCalledWith("playerSelected", selectedPlayerName);
    expect(logEvent).toHaveBeenCalledWith("Selected", selectedPlayerName, mockSocketId, "Student selected to draw");
});

test("handleSignup should add player to playerList and lobbyPlayerList, emit updated player list, and log event", () => {
  // Reset lobbyPlayerList before the test
  for (let prop in lobbyPlayerList) {
      if (lobbyPlayerList.hasOwnProperty(prop)) {
          delete lobbyPlayerList[prop];
      }
  }

  const mockIO: any = {
      emit: mockEmit,
  };
  const mockSocket: any = {
      id: "socket123",
  };
  const signUpData = {
      studentId: "12345",
      displayName: "Jane",
  };

  handleSignup(mockIO, mockSocket, signUpData);

  expect(playerList[mockSocket.id]).toBe(signUpData.displayName);
  expect(lobbyPlayerList[mockSocket.id]).toBe(signUpData.displayName);
  expect(mockEmit).toHaveBeenCalledWith("updatePlayerList", [signUpData.displayName]);
  expect(logEvent).toHaveBeenCalledWith("Join", signUpData.displayName, signUpData.studentId, "User joined the game");
});
test("handleDisconnect should clear gameEndTimeout if set, remove player from playerList and lobbyPlayerList, and emit updated player list", () => {
      const mockEmit = jest.fn();
      const mockIO: any = {
        emit: mockEmit
      };
      const mockSocket: any = {
        id: "socket123"
      };
      
      // Setup
      playerList[mockSocket.id] = "Jane";
      lobbyPlayerList[mockSocket.id] = "Jane";

      // Simulate a running timer
      jest.runOnlyPendingTimers();

      handleDisconnect(mockIO, mockSocket);
      
      // Assert
      expect(playerList[mockSocket.id]).toBeUndefined();
      expect(lobbyPlayerList[mockSocket.id]).toBeUndefined();
      expect(mockEmit).toHaveBeenCalledWith("updatePlayerList", []);
    });

    test("handleDisconnect should not emit updatePlayerList if player does not exist in lobbyPlayerList", () => {
      const mockEmit = jest.fn();
      const mockIO: any = {
        emit: mockEmit
      };
      const mockSocket: any = {
        id: "socket123"
      };
      
      // Setup
      playerList[mockSocket.id] = "Jane";
      
      // Mockk clearTimeout to infer gameEndTimeout cleared
      const clearTimeoutMock = jest.spyOn(global, 'clearTimeout');
      clearTimeoutMock.mockImplementation(jest.fn());
    
      handleDisconnect(mockIO, mockSocket);
      
      // Assert
      expect(clearTimeoutMock).toHaveBeenCalled();  // Asserting gameEndTimeout cleared
      expect(playerList[mockSocket.id]).toBeUndefined();
      expect(lobbyPlayerList[mockSocket.id]).toBeUndefined();
      expect(mockEmit).not.toHaveBeenCalledWith("updatePlayerList");
    });

describe("Voting Event handlers", () => {

  // Resetting votes before each test
  beforeEach(() => {
    votes.length = 0;
  });

  test("handleSubmit should add voteData to votes array", () => {
    const mockIO: any = {};  
    const mockVoteData = {
      displayName: "Jane",
      studentId: "s12345",
      risk: 5,
      probability: 60,
      drawing: "someData"
    };

    handleSubmit(mockIO, mockVoteData);

    // Assert
    expect(votes).toContain(mockVoteData);
  });

  test("handleSubmit should log an event with correct parameters", () => {
    const mockIO: any = {};
    const mockVoteData = {
      displayName: "Jane",
      studentId: "s12345",
      risk: 5,
      probability: 60,
      drawing: "someData"
    };

    handleSubmit(mockIO, mockVoteData);

    // Assert
    expect(logEvent).toHaveBeenCalledWith(
      "Vote", 
      mockVoteData.displayName, 
      mockVoteData.studentId, 
      `Voted with Risk: ${mockVoteData.risk}, Probability: ${mockVoteData.probability}, Drawing: ${mockVoteData.drawing}`
    );
  });

});

});


    


  afterEach(() => {
    if (gameEndTimeout) {
      clearTimeout(gameEndTimeout);
    }
    // Clear playerList and lobbyPlayerList after each test
    for (let prop in playerList) {
      if (playerList.hasOwnProperty(prop)) {
        delete playerList[prop];
      }
    }
    for (let prop in lobbyPlayerList) {
      if (lobbyPlayerList.hasOwnProperty(prop)) {
        delete lobbyPlayerList[prop];
      }
    }
    mockEmit.mockClear();
    jest.runAllTimers(); 
  });
});
