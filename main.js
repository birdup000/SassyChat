const http = require('http');
const express = require('express')
const app = express();
const path = require('path')
const {v4: uuidV4} = require('uuid')
const bodyParser = require('body-parser');
const socketio = require('socket.io')
const formatMessage = require('./views/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./views/users');
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => res.render('home'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/about', (req, res) => res.render('about'));
app.get('/login', (req, res) => res.render('login'));
app.get('/gecko', (req, res) => res.render('gecko'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/dashboard', (req, res) => res.render('dashboard'));
app.get('/chat', (req, res) => res.render('whenloggedin'));
app.get('/chatlogged', (req, res) => res.render('chatlogged'));
app.get('/videochat', (req, res) => {
  const uuid = uuidV4();
  res.redirect(`/video${uuid}`);
});
app.get('/video:room', (req, res) => res.render('video', {roomId: req.params.room}));
app.get('/audiochat', (req, res) => {
  const uuid = uuidV4();
  res.redirect(`/audio${uuid}`);
});
app.get('/audio:room', (req, res) => res.render('audio', {roomId: req.params.room}));

const botName = 'Chat Bot';
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit('message', formatMessage(botName, 'Welcome to the Chat!'));
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));
    io.to(user.room).emit('roomUsers', { room: user.room, users: getRoomUsers(user.room) });
  });
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
      io.to(user.room).emit('roomUsers', { room: user.room, users: getRoomUsers(user.room) });
    }
  });
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.emit('user-connected', userId);
    socket.on('disconnect', () => socket.broadcast.emit('user-disconnected', userId));
  });
});

const PORT = process.env.PORT || 80;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use((req, res) => res.status(404).render('404'));