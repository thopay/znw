const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//Set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'Bot'

//Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        var username = uniqueNamesGenerator({
            dictionaries: [colors, animals],
            separator: '',
            style: 'capital',
            length: 2
          }); // Red_Big_Donkey
        socket.emit('usernameUpdate', username)
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        //Welcome user
        //Single client
        socket.emit('message', formatMessage(botName, `Welecome to the room ${user.username}.`));

        //All client except single client
        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined.`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    

    //All clients
    //io.emit()


    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left.`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
})

const { PORT=3000, LOCAL_ADDRESS='0.0.0.0' } = process.env

server.listen(PORT, LOCAL_ADDRESS, () => {
    const address = server.address();
    console.log('server listening at', address);
  });
