import { Server, Socket } from 'socket.io';
const votes: any[] = [];

export const setupDrawingSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
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
    socket.on('draw', (data: any) => {
      socket.broadcast.emit('draw', data);
    });

    socket.on('clear', () => {
      socket.broadcast.emit('clear');
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
