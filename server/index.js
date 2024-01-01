const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const cors = require('cors');
const { rejects } = require('assert');
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        exposedHeaders: {
            'ngrok-skip-browser-warning': '1'
        }
    }
});
app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

app.use(cors())


const users = []

let sum = 0;

const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    // timeZoneName: "short",
};

io.on('connection', (socket) => {
    console.log('A user connected. Socket ID:', socket.id);
    const id = socket.id;
    // user[`${id}`] = {

    // }
    socket.emit('return_id_connect', socket.id)
    socket.on('disconnect', () => {
        console.log('user disconnected');
        // io.emit('another-left', user[`${id}`].name)
        // delete user[`${id}`];
        users.splice(
            users.indexOf(socket.Username), 1
        );
        console.log(users)
        socket.broadcast.emit('server_send_list_users', users)

        // if(user == {}){
        //     sum = 0
        // }
    });

    socket.on('client-message', (message) => {
        console.log('Received message from client:', message);
        io.emit('server-message', `Server received: ${message}`);
    });


    //receiver number
    socket.on('client-send-number', (message) => {
        console.log('number: ', message)
        sum += parseInt(message)
        io.emit('message-from-another', {
            // name: user[`${id}`].name,
            id: socket.id,
            message: message
        })
        io.emit('server-sum', {
            name: 'Server',
            id: 'xxx',
            message: 'Tổng : '+ sum
        });
    });

    socket.on('login', data => {
        if(users.indexOf(data) >= 0) {
            socket.emit("return_login_fail");
        } else {
            users.push(data);
            socket.Username = data;
            console.log("user:", users);
            socket.emit('login_success', id);
            socket.emit('return_users', data);
            io.sockets.emit("server_send_list_users", users);
        }
    })

    socket.on("logout", () => {
        users.slice(
            users.indexOf(socket.Username), 1
        );
        socket.broadcast.emit('server_send_list_users', users)
    });

    socket.on('user_send_msg', (data) => {
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        const formattedDate = today.toLocaleString("en-US", options);
        socket.Date = formattedDate;

        var pattern = /^\d+\.?\d*$/;
        const c = pattern.test(data);  // returns a boolean
        if(c) {
            if(data < 1 || data > 10) {
                socket.emit("server_return_error", `${data} không hợp lệ!`);
            } else {
                io.sockets.emit("server_send_msg", {un: socket.Username,id: socket.id, msg: data, date: socket.Date});
                sum += parseInt(data);
                io.sockets.emit("server_send_sum", {
                    sv: "Server",
                    id: "server",
                    msg: sum,
                    date: socket.Date
                })
            }
        } else {
            socket.emit("server_return_error", `${data} không hợp lệ!`);
        }
    })
});


server.listen(5000, () => {
    console.log('server running at http://localhost:5000');
});