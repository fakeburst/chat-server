var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
require('./db/initMongooseLocal')();
require('mongoose-pagination');
var User = mongoose.model('User');
var Message = mongoose.model('Message');
var bodyParser = require('body-parser');
var mongoosePaginate = require('mongoose-paginate');

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
//TODO if empty add messages from db
var numOfMsgs;
var lastMsgs = [];

Message.count({}, function(err, count) {
    console.log("Number of messages: ", count);
    numOfMsgs = count;
    Message.paginate({}, {
        offset: count - 10,
        limit: 10
    }, function(err, result) {
        lastMsgs = result.docs;
        console.log("Messages retrieved")
    });
});

app.get('/', function(req, res) {
    res.send('<h1>Hello world</h1>');
});

app.post('/login', function(req, res) {
    //console.log(req.body);
    //console.log("-------------------");

    if (currentUsers.indexOf(req.body.user_login) != -1) {
        res.send({
            success: false,
            msg: "Already logged in"
        });
        return;
    }

    User.findOne({
        username: req.body.user_login
    }, function(err, user) {
        if (err || !user) {
            res.send({
                success: false,
                msg: "No such user"
            })
            return;
        }

        user.comparePassword(req.body.user_password, function(err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                res.send({
                    success: true,
                    user: user
                });
            } else {
                res.send({
                    success: false,
                    msg: "Password Incorrect"
                })
            }
        });
    });
})

app.post('/register', function(req, res) {
    var newUser = new User({
        username: req.body.user_login,
        password: req.body.user_password
    });
    newUser.save(function(err, data) {
        if (err) {
            if (err.name == "ValidationError") {
                res.send({
                    success: false,
                    msg: "Such username already exists"
                });
                return;
            }
            res.send({
                success: false,
                msg: "Save error"
            });
            return;
        }
        res.send({
            success: true,
            user: data
        })
    })
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
        lastMsgs.push(message);
        if (lastMsgs.length > 10)
            lastMsgs.shift();
    });

    socket.on('logged', function(name) {
        console.log('logged: ' + name);
        socket.username = name;
        socket.lastMsg = numOfMsgs - 10;
        currentUsers.push(name);
        socket.emit('current users', currentUsers);
        socket.emit('last messages', lastMsgs);
        socket.broadcast.emit('new user online', name);
    });

    socket.on('typing', function() {
        socket.broadcast.emit('typing', socket.username);
    })

    socket.on('stop typing', function() {
        socket.broadcast.emit('stop typing', socket.username);
    })

    socket.on('load more', function() {
    	if(socket.lastMsg == 0){
    		socket.emit('load more', "Already all messages");
    		return;
    	}
    	let tmp = socket.lastMsg;
    	let tmp_limit = 10;
    	if(tmp < 10){
    		tmp_limit = tmp; 
    		tmp = 10;
    	}
    	console.log(socket.lastMsg);
    	console.log(tmp);
        Message.paginate({}, {
            offset: tmp - 10,
            limit: tmp_limit
        }, function(err, result) {
            if (err) console.log(err);
            console.log(result.docs.length);
            if (result) {
            	if(socket.lastMsg < 10)
            		socket.lastMsg = 0;
            	else
                	socket.lastMsg -= 10;
                socket.emit('load more', result.docs);
            }
        });
    })

});

http.listen(port, function() {
    console.log('listening on *:' + port);
});