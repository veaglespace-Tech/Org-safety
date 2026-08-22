const { Server } = require('socket.io');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://195.35.21.96',
        'http://195.35.21.96:3000',
        'http://195.35.21.96:3001',
        'https://195.35.21.96'
      ],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    // Join a specific tracking room
    socket.on('join-track', ({ token }) => {
      if (token) {
        const roomName = `track:${token}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room: ${roomName}`);
      }
    });

    // Leave tracking room
    socket.on('leave-track', ({ token }) => {
      if (token) {
        const roomName = `track:${token}`;
        socket.leave(roomName);
        console.log(`Socket ${socket.id} left room: ${roomName}`);
      }
    });

    // Handle real-time location updates
    socket.on('location-updated', (data) => {
      const { token, latitude, longitude, accuracy, timestamp } = data;
      if (token) {
        // Broadcast location to the specific room, but exclude the sender
        socket.to(`track:${token}`).emit('location-updated', {
          latitude,
          longitude,
          accuracy,
          timestamp
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from socket:', socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;
