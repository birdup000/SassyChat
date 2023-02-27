const http = require('http');
const express = require('express')
const app = express();
const path = require('path')
const {v4: uuidV4} = require('uuid')
const bodyParser = require('body-parser'); // middleware
app.use(bodyParser.urlencoded({ extended: false }));
///Change here to change what port is server hosted on
var port = 80;
const socketio = require('socket.io')
const formatMessage = require('./views/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./views/users');
const { join } = require('path');
const server = http.createServer(app);
const io = socketio(server);
app.use(express.json())
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"))
app.set('views', './views'); // specify the views directory
-// Static Files
app.use(express.static(path.join(__dirname, 'views')));
app.use('/css', express.static(path.join(__dirname, 'views/css')));
app.use('/js', express.static(path.join(__dirname, 'views/js')));
app.use('/img', express.static(path.join(__dirname, 'views/img')));

app.get('/', (req, res) => {
  res.render("home")  
})
app.get('/home', (req, res) => {
  res.render("home")  
})
app.get('/contact', (req, res) => {
  res.render("contact")  
})
app.get('/about', (req, res) => {
  res.render("about")  
})
app.get('/login', (req, res) => {
  res.render("login")  
})
//Hidden Gem :) 
app.get('/gecko', (req, res) => {
  res.render("gecko")  
})
app.get('/signup', (req, res) => {
  res.render("signup")  
})
app.get('/dashboard', (req, res) =>{
res.render("dashboard")
})
/// set it to here this chat file when you it logs in
app.get('/chat', (req, res) =>{
 res.render("whenloggedin")
})
app.get('/chatlogged', (req, res) =>{
  res.render("chatlogged")
})


const botName = 'Chat Bot';
// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to the Chat!'));
    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });
  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });
  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});
//video chatting merge
//addition Audio chat
app.get('/videochat', (req, res) => {
  const uuid = uuidV4()
  res.redirect(`/video/${uuid}`)
})

app.get('/video/:room', (req, res) => {
  // Only allow access to the room if the user has the room code
  const roomId = req.params.room
  res.render('video', { roomId })
})

app.get('/audiochat', (req, res) => {
  const uuid = uuidV4()
  res.redirect(`/audio/${uuid}`)
})

app.get('/audio/:room', (req, res) => {
  // Only allow access to the room if the user has the room code
  const roomId = req.params.room
  res.render('audio', { roomId })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)
    
    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})


/// fixed
app.use(function (req,res,next){
	res.status(404).render("404");
});


///Also change here as well for showing what port server is running on
const PORT = process.env.PORT || 80
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
