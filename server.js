const net = require('net');
const fs = require('fs');
const file = fs.createWriteStream('./server.log.txt');
let clients = [];
let count = 0;
let password = 'password';
const server = net.createServer((client) => {
  count++;
  client.name = `Guest${count}`;
  clients.push(client);

  console.log('Client Connected');
  client.write(`\n~~Welcome to the Chat room ${client.name}!~~\n\n`);
  client.write(
    'commands:\n(/username newUsername): changes your username\n(/w userName message): whispers to a single user\n(/kick user password): removes user from  chat room\n(/clientlist): send a list of all connected users\n\n'
  );
  client.write('--start typing to chat with the other users--\n\n');

  send(`${client.name} joined the chat`, client);

  client.setEncoding('utf8');
  client.on('data', (data) => {
    if (data.startsWith('/w')) {
      handleWhisper(data, client);
    } else if (data.startsWith('/username')) {
      handleUsername(data, client);
    } else if (data.startsWith('/kick')) {
      handleKick(data, client);
    } else if (data.startsWith('/clientlist')) {
      handleClientList(data, client);
    } else if (data.startsWith('/')) {
      client.write('invalid command');
    } else {
      send(`${client.name}> ${data}`, client);
    }
  });
  client.on('end', () => {
    clients.filter((user) => {
      return user.name !== client.name;
    });
    send(`${client.name} left the chat`);
    clients = clients.filter((user) => {
      return user.name !== client.name;
    });
  });
});

let send = (msg, socket) => {
  clients.forEach((user) => {
    if (user !== socket) {
      user.write(msg);
    }
  });
  file.write(`${msg}\n`);
};

let handleWhisper = (msg, socket) => {
  msg = msg.split(' ');
  if (msg.length < 3) {
    socket.write('incorrect number of inputs could not send the whisper');
  } else if (msg[1] === socket.name) {
    socket.write('cannot whisper to yourself');
  } else if (
    clients.find((user) => {
      return user.name === msg[1];
    })
  ) {
    clients.forEach((user) => {
      if (user.name === msg[1]) {
        user.write(`${socket.name}> Whispered: ${msg.slice(2).join(' ')}`);
        file.write(`${socket.name}> Whispered: ${msg.slice(2).join(' ')}\n`);
      }
    });
  } else {
    socket.write('could not find user');
  }
};
let handleUsername = (msg, socket) => {
  msg = msg.split(' ');
  if (msg.length !== 2) {
    socket.write('incorrect number of inputs could not change username');
  } else if (socket.name === msg[1]) {
    socket.write('error: that is already your username');
  } else if (
    clients.find((user) => {
      return user.name === msg[1];
    })
  ) {
    socket.write('username already exists please choose a different username');
  } else {
    send(`${socket.name} updated their username to ${msg[1]}`, socket);
    socket.name = msg[1];
    socket.write(`Username has been updated: Welcome ${socket.name}`);
  }
};
let handleKick = (msg, socket) => {
  msg = msg.split(' ');
  if (msg.length !== 3) {
    socket.write('incorrect number of inputs could not kick user');
  } else if (msg[2] !== password) {
    socket.write('incorrect password');
  } else if (msg[1] === socket.name) {
    socket.write('cannot kick yourself');
  } else if (
    clients.find((user) => {
      return user.name === msg[1];
    })
  ) {
    clients.forEach((user) => {
      if (user.name === msg[1]) {
        send(`${user.name} left the chat`, user);
        file.write(`${socket.name} kicked ${user.name} from the chat`);
        user.write('you have been kicked from the chatroom');
        user.destroy();
      }
    });
  } else {
    socket.write('could not find user');
  }
};
let handleClientList = (msg, socket) => {
  msg = msg.split(' ');
  if (msg.length > 1) {
    socket.write('invalid command too many inputs');
  } else {
    socket.write('Connected Clients:\n');
    file.write('Connected Clients:\n');
    clients.forEach((user) => {
      socket.write(`${user.name}\n`);
      file.write(`${user.name}\n`);
    });
  }
};

server.listen(3000, () => {
  console.log('Listening on port 3000');
});
