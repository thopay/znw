const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const socket = io();

var username = ''

//Get username and room from URL
const { room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.on('usernameUpdate', (newUsername) => {
    username = newUsername;
})

//Join chatroom
socket.emit('joinRoom', { room });

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    //outputUsers(users);
})

//Message from server
socket.on('message', message => {
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value

    //Emit message to server
    socket.emit('chatMessage', msg);

    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.innerHTML = `<div class="row" style="width: 100%;margin: 0px;">
    <div class="col" style="padding: 0px;">
        <div class="messages" style="background-color: rgb(54,57,63);margin-left: 30px;margin-right: 30px;margin-top: 10px;">
            <div class="message-body" style="padding-bottom: 0px;">
                <h6 style="color: rgb(255,255,255);font-family: UniSansRegular;font-size: 20px;">${message.username}&nbsp;&nbsp;<span style="color: rgb(133,133,133);font-size: 15px;">${message.time}</span></h6>
                <p class="message-text" style="font-size: 16px;color: rgb(220,218,212);">${message.text}</p>
            </div>
        </div>
    </div>
</div>`
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
    document.getElementById('msg').placeholder = `Message ${room}`
}

//Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
     ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}