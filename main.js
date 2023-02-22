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
app.use(express.static(path.join(__dirname, 'views')))
app.use('/css', express.static(path.join(__dirname, 'views/css')))
app.use('/js', express.static(path.join(__dirname, 'views/js')))
app.use('/img', express.static(path.join(__dirname, 'views/img')))

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
// Generate a random UUID and send the user to a new room with said UUID for video chat
app.get('/videochat', (req, res) => {
  const uuid = uuidV4()
  res.redirect(`/video/${uuid}`)
})
/// Serve the video chat page
app.get('/video/:room', (req, res) => {
  res.render('video', {roomId: req.params.room})
})
// Generate a random UUID and send the user to a new room with said UUID for audio chat
app.get('/audiochat', (req, res) => {
  const uuid = uuidV4()
  res.redirect(`/audio/${uuid}`)
})
// Serve the audio chat page
app.get('/audio/:room', (req, res) => {
  res.render('audio', { roomId: req.params.room })
})
// When someone connects to the server
io.on('connection', socket => {
  // When someone attempts to join the room
  socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)  // Join the room
      socket.broadcast.emit('user-connected', userId) // Tell everyone else in the room that we joined
      // Communicate the disconnection
      socket.on('disconnect', () => {
          socket.broadcast.emit('user-disconnected', userId)
      })
  })
})


/// not yet fixed 
app.use(function (req,res,next){
	res.status(404).render("404");
});


///Also change here as well for showing what port server is running on
const PORT = process.env.PORT || 80
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

