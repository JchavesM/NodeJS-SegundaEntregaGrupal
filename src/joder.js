const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "../public")));

// sockets
io.on("connection", function(socket) {
	console.log('Un cliente se ha conectado');
});

//starting the server
server.listen(3000, () => {
    console.log("Server on port");
});
