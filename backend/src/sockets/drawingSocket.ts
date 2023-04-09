import { Server, Socket } from 'socket.io';

export const setupDrawingSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for "start game" event
  socket.on("start", () => {
    console.log("Game started");
    io.emit("started");
  });


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
