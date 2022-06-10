const Express = require("express")();
const Http = require("http").Server(Express);
const SocketIO = require("socket.io")(Http, {
    cors: {
        origin: '*'
    }
});

let players = [];

Http.listen(3001, () => {
    console.log("Listening at :3001...");
});

function checkAndReveal() {
    let reveal = true;
    players.forEach(el => { if (el.vote === 0) reveal = false; });
    if (reveal) SocketIO.emit("reveal", players);
}

SocketIO.on("connection", socket => {
    socket.on("join", data => {
        if (!players.find(el => el.name === data)) {
            let player = {name: data, vote: 0};
            players.push(player);
            SocketIO.emit("playerJoined", player);
        }
        SocketIO.emit("players", players);

        checkAndReveal()
    })
    socket.on("leave", data => {
        let index = players.findIndex(el => el.name === data);
        if (index !== -1) {
            players.splice(index, 1);
            SocketIO.emit("playerLeft", data);
        }
    });
    socket.on("vote", data => {
        let index = players.findIndex(el => el.name === data.name);
        if (index !== -1) {
            players[index] = data;
            SocketIO.emit("players", players);
        }

        checkAndReveal()
    });
    socket.on("reset", data => {
        players = [];
        SocketIO.emit("reset", players);
    });
});
