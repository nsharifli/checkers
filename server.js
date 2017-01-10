var express = require('express');
var io = require('socket.io');


var app = express()

app.use(express.static('public'));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var uuid = require('node-uuid');





//Routes

app.get('/', function (req, res) {
	res.sendfile('views/index.html');
})

app.get('/game/:id', function (req, res) {
	if (!req.cookies.userIdCookie){
		var idCookie = uuid.v4();
		res.cookie('userIdCookie', idCookie, { maxAge: 900000, httpOnly: false });
	}	
	res.sendfile('views/game.html');
	
})




// Starts express server listening on 19456
var httpServer = app.listen(19456, "0.0.0.0", function () {
	console.log('App listening on port 19456!')
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
		console.log('Received message from client!',msg, client.gameId, client.connected);

		if (msg.action == "CONNECT") {
			var gameId = msg.gameId;

			client.userIdCookie = msg.userIdCookie;
			
			if (games[gameId]){
				if (games[gameId]["player_0"] && games[gameId]["player_0"].userIdCookie == client.userIdCookie
					&& !games[gameId]["player_0"].connected){
					client.gameId = gameId;
					games[gameId]["player_0"] = client;

					var opponent_exists = true;
					if (games[gameId]["isStarted"]){
						if (!games[gameId]["player_1"].connected){
						var opponent_exists = false;
					}

					}
					
					games[gameId]["player_0"].send({
						action: "RECONNECT",
						player: 0, 
						board: games[gameId]["board"],
						turn: games[gameId]["turn"],
						isStarted: games[gameId]["isStarted"],
						opponent_exists: opponent_exists,
						numberOfPieces: games[gameId]["numberOfPieces"]
					})
					if (games[gameId]["isStarted"]) {
							games[gameId]["player_1"].send({
								action: "OPPONENT RECONNECT",
								turn: games[gameId]["turn"]
							})
						}
				}

				else if (games[gameId]["player_1"] && games[gameId]["player_1"].userIdCookie == client.userIdCookie
					&& !games[gameId]["player_1"].connected){
					client.gameId = gameId;
					games[gameId]["player_1"] = client;

					var opponent_exists = true;
					if (!games[gameId]["player_0"].connected){
						var opponent_exists = false;
					}

					games[gameId]["player_1"].send({
						action: "RECONNECT",
						player: 1,
						board: games[gameId]["board"],
						turn: games[gameId]["turn"],
						isStarted: games[gameId]["isStarted"],
						opponent_exists: opponent_exists,
						numberOfPieces: games[gameId]["numberOfPieces"]
					})



					games[gameId]["player_0"].send({
						action: "OPPONENT RECONNECT",
						turn: games[gameId]["turn"],
						numberOfPieces: games[gameId]["numberOfPieces"]
					})
						
				}

				else if (!games[gameId]["isStarted"] && games[gameId]["player_0"].userIdCookie != client.userIdCookie){
					client.gameId = gameId;
					games[gameId]["player_1"] = client;
					games[gameId]["isStarted"] = true;
					games[gameId]["player_0"].send({
						player: 0,
						action: "START",
						turn: 0,
						board: games[gameId]["board"],
						numberOfPieces: games[gameId]["numberOfPieces"]

					})
					games[gameId]["player_1"].send({
						player: 1,
						action: "START",
						turn: 0,
						board: games[gameId]["board"],
						numberOfPieces: games[gameId]["numberOfPieces"]
					})
				}


				else {
					client.send({
						action: "ERROR",
						reason: "Game exists, choose different game ID"
					});
				}
			}

			else {
				var board = [
				[-1, 1, -1, 1, -1, 1, -1, 1],
				[1, -1, 1, -1, 1, -1, 1, -1],
				[-1, 1, -1, 1, -1, 1, -1, 1],
				[-1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1],
				[0, -1, 0, -1, 0, -1, 0, -1],
				[-1, 0, -1, 0, -1, 0, -1, 0],
				[0, -1, 0, -1, 0, -1, 0, -1]
				];
				var numberOfPieces = {
					white: 12,
					red: 12
				};
				client.gameId = gameId;
				games[gameId] = {
					turn: 0,
					player_0: client,
					isStarted: false, 
					board: board,
					numberOfPieces: numberOfPieces
				};
				games[gameId]["player_0"].send({
					action: "WAIT",
					board: games[gameId]["board"],
					numberOfPieces: games[gameId]["numberOfPieces"]
				})
			}		
		}

		else if (msg.action == "MOVE") {
			var gameId = msg.gameId;

			games[gameId]["numberOfPieces"] = {
					white: 0,
					red: 0
				};

			msg.board.forEach(function(row){
				row.forEach(function(square){
					if (square == 0 || square == 2){
						games[gameId]["numberOfPieces"]["white"] += 1;
					}
					else if (square == 1 || square == 3){
						games[gameId]["numberOfPieces"]["red"] += 1;
					}
				})
			})
			msg["numberOfPieces"] = games[gameId]["numberOfPieces"];



			if (games[gameId]["turn"] == 0){
				games[gameId]["player_1"].send(msg);
				games[gameId]["turn"] = 1;
				games[gameId]["board"] = msg.board;
			}

			else {
				games[gameId]["player_0"].send(msg);
				games[gameId]["turn"] = 0;
				games[gameId]["board"] = msg.board;
			}

			if (games[gameId]["numberOfPieces"]["white"] == 0 || games[gameId]["numberOfPieces"]["red"] == 0) {
				var myGame = games[client.gameId];
				delete games[client.gameId];
				myGame["player_1"].send({
					action: "END",
					reason: "GAMEOVER",
					numberOfPieces: myGame["numberOfPieces"]
				});

				myGame["player_0"].send({
					action: "END",
					reason: "GAMEOVER",
					numberOfPieces: myGame["numberOfPieces"]
				});
				myGame["player_1"].disconnect();
				myGame["player_0"].disconnect();


				


			}
		}
	});


	client.on('disconnect',function(){
		console.log('Server has disconnected', client.gameId);
		var myGame = games[client.gameId];

		if (myGame == null){
			return;
		}


		if (myGame["player_0"]){
			myGame["player_0"].send({
				action: "END",
				reason: "DISCONNECT"
			});
			
			
		}


		if (myGame["player_1"]){
			myGame["player_1"].send({
				action: "END",
				reason: "DISCONNECT"
			});

			
		}	
	});

});


