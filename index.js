var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
require('./db/initMongooseLocal')();
require ('mongoose-pagination');
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
//TODO if empty add messages from db
var lastMsgs = [];

Message.find().paginate(1, 10).exec(function(err, data) {
	lastMsgs = data;
})

app.get('/', function(req, res) {
    res.send('<h1>Hello world</h1>');
});

app.post('/login', function(req, res) {
    //console.log(req.body);
    //console.log("-------------------");

    if(currentUsers.indexOf(req.body.user_login) != -1){
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
	var newUser = new User(req.body.username, req.body.password);
	newUser.save(function(err, data){
		if(err){
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
        if(lastMsgs.length > 10)
        	lastMsgs.shift();
    });

    socket.on('logged', function(name) {
        console.log('logged: ' + name);
        socket.username = name;
        socket.lastMsg = 11;
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
    	socket.emit
    })

});

http.listen(port, function() {
    console.log('listening on *:' + port);
});


/*TODO  
	load more
*/
	