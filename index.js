var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
require('./db/initMongooseLocal')();
var User = mongoose.model('User');
var Message = mongoose.model('Message');
var bodyParser = require('body-parser')

var port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/*var testUser = new User({
    username: 'testUser',
    password: '123'
});

testUser.save(function(err) {
    if (err) throw err;
});

var testUser = new User({
    username: 'max',
    password: '123'
});

testUser.save(function(err) {
    if (err) throw err;
});*/

var currentUsers = [];
var lastMsgs = [];

app.get('/', function(req, res) {
    res.send('<h1>Hello world</h1>');
});

app.post('/login', function(req, res) {
    //console.log(req.body);
    //console.log("-------------------");

    User.findOne({
        username: req.body.user_login
    }, function(err, user) {
        if (err || !user) {
            res.send({
                    success: false
                })
                //console.log(err);
            return;
        }

        user.comparePassword(req.body.user_password, function(err, isMatch) {
            if (err) throw err;
            //console.log(req.body.user_password, isMatch); // -&gt; Password123: true
            if (isMatch) {
                res.send({
                    success: true,
                    user: user
                });
            } else {
                res.send({
                    success: false
                })
            }
        });
    });
})

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('disconnect', function() {
        console.log('user disconnected');
        socket.broadcast.emit('user disconnected', socket.username);
        currentUsers.splice(currentUsers.indexOf(socket.username), 1);
    });

    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        socket.broadcast.emit('chat message', {
            username: socket.username,
            message: msg
        });
        var message = new Message({
            username: socket.username,
            content: msg
        });
        message.save(function(err) {
            if (err) throw err;
        });
    });

    socket.on('logged', function(name) {
        console.log('logged: ' + name);
        socket.username = name;
        currentUsers.push(name);
        socket.emit('current users', currentUsers);
        socket.broadcast.emit('new user online', name);
    });

    socket.on('typing', function() {
    	io.emit('typing', socket.username);
    })

    socket.on('stop typing', function() {
    	io.emit('stop typing', socket.username);
    })

});

http.listen(port, function() {
    console.log('listening on *:' + port);
});