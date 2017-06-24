var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var currentUsers = ["testName"];
var lastMsgs = [];
var port = process.env.PORT || 8080;

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
  socket.on('login', function(name){
  	console.log('login: ' + name);
  	currentUsers.push(name);
  	socket.emit('current users', currentUsers);
  	io.emit('new user online', name)
  });
});

require('./db/initMongoose')();

http.listen(port, function(){
  console.log('listening on *:'+port);
});
    