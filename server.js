var express = require('express');
var io = require('socket.io');


var app = express()

app.use(express.static('public'))

//Routes

app.get('/game', function (req, res) {
  	res.sendfile('public/index.html');
})

app.get('/game/:id', function (req, res) {
	console.log(req.params);
	res.sendfile('public/index.html');
})


// Starts express server listening on 3000
var httpServer = app.listen(3000, "0.0.0.0", function () {
	console.log('Example app listening on port 3000!')
})

var games = {};




// Create a Socket.IO instance, passing it our server
var socket = io.listen(httpServer);

// Add a connect listener
socket.on('connection', function(client){
	client.gameId = null; 
	
	client.send("hey, client!");

	// Success!  Now listen to messages to be received
	client.on('message',function(msg){ 
		console.log('Received message from client!',msg, client.gameId);

		if (msg.action == "CONNECT") {
			var gameId = msg.gameId;
			
			if (games[gameId] && !games[gameId]["isStarted"]){
				client.gameId = gameId;
				games[gameId]["player_1"] = client;
				games[gameId]["isStarted"] = true;
				games[gameId]["player_0"].send({
					player: 0,
					action: "START",
					turn: 0
				})
				games[gameId]["player_1"].send({
					player: 1,
					action: "START",
					turn: 0
				})
			}
			else if (!games[gameId]) {
				client.gameId = gameId;
				games[gameId] = {
					turn: 0,
					player_0: client,
					isStarted: false
				};
			}

			else {
				client.send({
					action: "ERROR",
					reason: "Game exists, choose different game ID"
				});
			}
		}

		else if (msg.action == "MOVE") {
			var gameId = msg.gameId;


			if (games[gameId]["turn"] == 0){
				games[gameId]["player_1"].send(msg);
				games[gameId]["turn"] = 1;
			}

			else {
				games[gameId]["player_0"].send(msg);
				games[gameId]["turn"] = 0;
			}

			if ( msg["numberOfPieces"]["player_0"] == 0 || msg["numberOfPieces"]["player_1"] == 0) {
				games[gameId]["player_1"].send({
					action: "END",
					reason: "GAMEOVER"
				});

				games[gameId]["player_0"].send({
					action: "END",
					reason: "GAMEOVER"
				});
				games[gameId]["player_1"].disconnect();
				games[gameId]["player_0"].disconnect();


				delete games[client.gameId];


			}
		}
	});


	client.on('disconnect',function(){
		console.log('Server has disconnected', client.gameId);
		var myGame = games[client.gameId];

		if (myGame == null){
			return;
		}

		delete games[client.gameId];

		if (myGame["player_0"]){
			myGame["player_0"].send({
				action: "END",
				reason: "DISCONNECT"
			});
			myGame["player_0"].disconnect();
		}
		console.log(games[client.gameId]);

		if (myGame["player_1"]){
			myGame["player_1"].send({
				action: "END",
				reason: "DISCONNECT"
			});
			myGame["player_1"].disconnect();
		}
		
		

		
		

		
	});

});


