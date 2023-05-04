const net = require('net');
const client = net.createConnection({ port: 3000 }, () => {
  console.log('Connected to Server');
});

let input = process.stdin;
input.setEncoding('utf-8');

input.on('data', (response) => {
  response = response.trim();
  if (response === 'exit') {
    console.log('Left the chat');
    process.exit();
  } else {
    client.write(response);
  }
});

client.on('data', (data) => {
  console.log(data.toString());
});
client.on('end', () => {
  process.exit();
});
