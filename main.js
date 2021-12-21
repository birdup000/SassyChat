const http = require('http');
const express = require('express')
const app = express();
const path = require('path')
const {v4: uuidV4} = require('uuid')
var port = 8080;



const socketio = require('socket.io')
const formatMessage = require('./views/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./views/users');

const server = http.createServer(app);

const io = socketio(server);


const users = []
app.use(express.urlencoded({extended: false}))
app.use(express.json())


app.set('view engine', 'ejs');

app.set("views", path.join(__dirname, "views"))

app.set('views', './views'); // specify the views directory
-// Static Files
app.use(express.static('views'))
app.use('/css', express.static(__dirname + 'views/css'))
app.use('/js', express.static(__dirname + 'views/js'))
app.use('/img', express.static(__dirname + 'views/img'))

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


app.get('/signup', (req, res) => {
  res.render("signup")  
})

app.get('/dashboard', (req, res) =>{
res.render("dashboard")
})

/// set it to here this chat file when you it loggs in
app.get('/chat', (req, res) =>{
 res.render("whenloggedin")
})

app.get('/chatlogged', (req, res) =>{
  res.render("chatlogged")
 })

app.post("/login", (req, res) => {
  let form = req.body;
  let username = req.body["uname"];
  let password = req.body["password"];
  //chack user login
  console.log(`\x1b[42mNEW LOGIN REQUEST\x1b[0m: (${username} | ${password})`)
})


app.post("/signup", (req, res) => {
  let form = req.body;
  let username = req.body["uname"];
  let password = req.body["password"];
  let email = req.body["email"];
  //chack user login
  console.log(`\x1b[42mNEW LOGIN REQUEST\x1b[0m: (${username} | ${password} | ${email})`)
})


////app.use(function (req,res,next){
////	res.status(404).render("404");
///});

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


// If they join the link, generate a random UUID and send them to a new room with said UUID
app.get('/videochat', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
// If they join a specific room, then render that room
app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room})
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






const PORT = process.env.PORT || 8080

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

