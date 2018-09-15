var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
let sockets = {};

io.on('connection', function(socket){
  console.log('connecting', socket.id);
  sockets[socket.id] = socket;

  // Join Board Session
  socket.on('join', (room) => {
    socket.join(room, ()=>{
      sockets[socket.id].room = room;
    });
  });

  // Disconnect from Board Session
  socket.on('disconnect', function(){
    console.log('disconnecting', socket.id);
    delete sockets[socket.id];
  });

  // Board Control
  socket.on("ERASE", function(data){
    socket.to(sockets[socket.id].room).emit("ERASE");
  });

  socket.on("LINE", function(data, hash=""){
    socket.to(sockets[socket.id].room).emit("LINE", data, hash);
  });

  socket.on("UNDO", function(data, hash=""){
    socket.to(sockets[socket.id].room).emit("UNDO", data, hash);
  });

});
const port = process.env.PORT || 8080;
http.listen(port, function(){
  console.log('listening on *:'+port);
});