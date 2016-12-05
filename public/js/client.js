console.log("starting client");


function Checkers() {

	var hit;
	var currentPlayer;
	var currentTurn;
	var socket;
	var gameId;
	var board;
	var virtualBoard;


	function findLeft(position, direction) {

		if (direction) {
			if (position.boardY > 6 || position.boardX < 1){
				return null;
			}

			else {
				var left = virtualBoard[position.boardY + 1][position.boardX - 1];
				return left;
			}
		}

		else {
			if (position.boardY < 1 || position.boardX < 1){
				return null;
			}

			else {
				var left = virtualBoard[position.boardY - 1][position.boardX - 1];
				return left;
			}
		}
	}


	function findRight(position, direction) {

		if (direction) {
			if (position.boardX > 6 || position.boardY > 6){
				return null;
			}

			else {
				var right = virtualBoard[position.boardY + 1][position.boardX + 1];
				return right;
			}
		}

		else {
			if (position.boardX > 6 || position.boardY < 1){
				return null;
			}

			else {
				var right = virtualBoard[position.boardY - 1][position.boardX + 1];
				return right;
			}
		}
	}


	function canHitLeft (position, direction) {
		var road = {};
		var left = findLeft(position, direction);
		if (left == null || left[1] == null || currentPlayer == left[1].player) {
			return null;
		}

		var leftOfLeft = findLeft({boardX: left[1].boardX, boardY: left[1].boardY}, direction);
		if (leftOfLeft == null || leftOfLeft[1] != null) {
			return null;
		}

		road.enemy = left[1];

		if (direction) {
			road.destination = {boardX: left[1].boardX - 1, boardY: left[1].boardY + 1};
		}

		else {
			road.destination = {boardX: left[1].boardX - 1, boardY: left[1].boardY - 1};
		}	

		return road;
	}


	function canHitRight(position, direction){

		var road = {};
		var right = findRight(position, direction);
		if (right == null || right[1] == null || currentPlayer == right[1].player) {
			return null;
		}

		var rightOfRight = findRight({boardX: right[1].boardX, boardY: right[1].boardY}, direction);
		if (rightOfRight == null || rightOfRight[1] != null) {
			return null;
		}

		road.enemy = right[1];

		if (direction) {
			road.destination = {boardX: right[1].boardX + 1, boardY: right[1].boardY + 1};
		}

		else {
			road.destination = {boardX: right[1].boardX + 1, boardY: right[1].boardY - 1};
		}
		
		return road;
	}


	function anyHit() {
		for (row = 0; row < 8; row++) {
			for (col = 0; col < 8; col++){
				var piece = virtualBoard[row][col][1];
				if (piece == null || piece.player != currentPlayer) {
					continue;
				}
				var position = {boardX: piece.boardX, boardY: piece.boardY}
				var leftEnemy = canHitLeft(position, currentPlayer);
				var rightEnemy = canHitRight(position, currentPlayer);
				var leftEnemyRev = piece.king ? canHitLeft(position, !currentPlayer) : null;
				var rightEnemyRev = piece.king ? canHitRight(position, !currentPlayer): null;

				if (leftEnemy != null || rightEnemy != null || leftEnemyRev != null || rightEnemyRev != null) {
					return true;
				}
			}
		}

		return false;
	}
		

	function availableHits(position, isKing, prevEnemy) {
		var listOfPaths = [];
		var leftEnemy = canHitLeft(position, currentPlayer);
		var rightEnemy = canHitRight(position, currentPlayer);
		var leftEnemyRev = isKing ? canHitLeft(position, !currentPlayer) : null;
		var rightEnemyRev = isKing ? canHitRight(position, !currentPlayer): null;
		var enemyList = [leftEnemy, rightEnemy, leftEnemyRev, rightEnemyRev];


		for (var enemyIndex in enemyList){
			var enemy_road = enemyList[enemyIndex];

			if (enemyList[enemyIndex] != null) {
				if (prevEnemy != enemyList[enemyIndex].enemy){

					var path = availableHits(enemy_road.destination, isKing, enemyList[enemyIndex].enemy);

					for (i = 0; i < path.length; i++) {
						path[i].unshift(enemy_road.enemy, enemy_road.destination);	
					}

					if (path.length == 0) {
						path.push([enemy_road.enemy, enemy_road.destination]);
					}

					listOfPaths = listOfPaths.concat(path);
				}
			}
		}

		return listOfPaths;	
	}


	function availableMoves(piece) {
		var moves = [];
		if (currentTurn == currentPlayer){
			
			if (hit) {

				hits = availableHits({boardX: piece.boardX, boardY: piece.boardY}, piece.king, null);

				for (i = 0; i < hits.length; i++) {
					var path = hits[i];
					destination = path[path.length - 1];
					square = virtualBoard[destination.boardY][destination.boardX][0];
					moves.push(square);
				}
				
				return moves;
			}


			
			var left = findLeft(piece, currentPlayer);
			if (left != null && left[1] == null) {
				moves.push(left[0]);
			}
		
			var right = findRight(piece, currentPlayer);
			if (right != null && right[1] == null) {
				moves.push(right[0]);
			}

			if (piece.king == 1){
				var leftRev = findLeft(piece, !currentPlayer);
				if (leftRev != null && leftRev[1] == null) {
					moves.push(leftRev[0]);
				}
			
				var rightRev = findRight(piece, !currentPlayer);
				if (rightRev != null && rightRev[1] == null) {
					moves.push(rightRev[0]);
				}
			}

			
			return moves;
			

		}

		else {
			return moves;
		}
	}


	function initBoard(board) {
		var virtualBoard = [];
		for (row = 0; row < 8; row++) {
			each_row = [];
			for (col = 0; col < 8; col++){
				cell = [];
				for (obj = 0; obj < 2; obj++){
					cell.push(null);
				}
				each_row.push(cell);
			}
			virtualBoard.push(each_row);
		}

		var squares = [];
		for (row = 0; row < 8; row++) {
			for (col = 0; col < 8; col++) {
				square = new createjs.Shape();
				(col + row) % 2 == 0 ? square.graphics.beginFill("grey").drawRect(0, 0, 50, 50) : 
				square.graphics.beginFill("black").drawRect(0, 0, 50, 50);
				square.x = 200 + col * 50;
				square.y = 100 + row * 50;
				square.boardX = col;
				square.boardY = row;
				squares.push(square);
				virtualBoard[row][col][0] = square;
				board.addChild(square);
			}
		}

		return virtualBoard;
	}


	function initPieces(board) {
		var piece;
		var initial_positions = [0, 1, 2, 5, 6, 7];

		for (row_index = 0; row_index < 6; row_index++) {
			for (col = 0; col < 8; col++){
				var row = initial_positions[row_index];
				piece = new createjs.Shape();
				piece.x = virtualBoard[row][col][0].x + 25;
				piece.y = virtualBoard[row][col][0].y + 25;
				piece.boardX = col;
				piece.boardY = row;
				piece.king = 0;
				
				if ( ([0, 1, 2].indexOf(row) != -1) && ((row + col) % 2 == 1)) {					
					piece.graphics.beginFill("red").drawCircle(0,0,20);
					piece.player = 1;
					board.addChild(piece);
					virtualBoard[row][col][1] = piece;
				}

				else if ( ([5, 6, 7].indexOf(row) != -1) && ((row + col) % 2 == 1)){
					piece.graphics.beginFill("white").drawCircle(0,0,20);
					piece.player = 0;
					board.addChild(piece);
					virtualBoard[row][col][1] = piece;
				}				

				piece.on("pressmove", function(evt){
					var piece = evt.currentTarget;
					if (piece.player != currentPlayer) {
						return;
					}
					if (currentPlayer){
						evt.stageX = 800 - evt.stageX;
						evt.stageY = 600 - evt.stageY;
					}
					var position = {boardX: piece.boardX, boardY: piece.boardY};
					piece.x = evt.stageX;
					piece.y = evt.stageY;
					var moves = availableMoves(piece);
					var paths = availableHits(position, piece.king);
					paths.forEach(function(path){
						for (i = 0; i < path.length; i++){
							virtualBoard[path[i].boardY][path[i].boardX][0].alpha = 0.8;
						}
					});

					moves.forEach(function(square){
						square.alpha = 0.7;
						square.graphics.beginStroke("red").drawRect(1, 1, 48, 48) ;
					});
				})

				piece.on("pressup", function(evt) {
					var piece = evt.currentTarget;
					if (currentPlayer){
						evt.stageX = 800 - evt.stageX;
						evt.stageY = 600 - evt.stageY;
					}
					if (piece.player != currentPlayer) {
						return;
					}
					var position = {boardX: piece.boardX, boardY: piece.boardY};				
					var moves = availableMoves(piece, virtualBoard);
					var initial_square = virtualBoard[piece.boardY][piece.boardX];
					var paths = availableHits(position, piece.king);
					paths.forEach(function(path){
						for (i = 0; i < path.length; i++){
							virtualBoard[path[i].boardY][path[i].boardX][0].alpha = 1;
						}
					});

					moves.forEach(function(square){
						square.alpha = 1;
						square.graphics.clear()
						square.graphics.beginFill("black").drawRect(0, 0, 50, 50) ;
					})

					var closestSquare = moves.find(function(square){
						return ((square.x < evt.stageX) && (evt.stageX < square.x + 50)) && 
						((square.y < evt.stageY) && (evt.stageY < square.y + 50));
						})

					if (closestSquare == null){
						piece.x = initial_square[0].x + 25;
						piece.y = initial_square[0].y + 25;	
					}

					else {
						
						var paths = availableHits(position, piece.king, null);
						piece.x = closestSquare.x + 25;
						piece.y = closestSquare.y + 25;
						virtualBoard[piece.boardY][piece.boardX][1] = null;
						var move = {
							initialX: piece.boardX,
							initialY: piece.boardY,
							finalX: closestSquare.boardX,
							finalY: closestSquare.boardY
						};

						piece.boardX = closestSquare.boardX;
						piece.boardY = closestSquare.boardY;
						virtualBoard[closestSquare.boardY][closestSquare.boardX][1] = piece;
						
						var taken_enemies = [];						
						if (paths.length != 0) {
							var selectedPath = paths.find(function(path){
								var destination = path[path.length - 1];
								return (destination.boardX == closestSquare.boardX) &&
								(destination.boardY == closestSquare.boardY);
							});

							for (i = 0 ; i < selectedPath.length; i += 2){
								taken_enemy = virtualBoard[selectedPath[i].boardY][selectedPath[i].boardX][1]
								board.removeChild(taken_enemy);
								enemy = {
									boardX: taken_enemy.boardX,
									boardY: taken_enemy.boardY
								};
								taken_enemies.push(enemy);
								virtualBoard[selectedPath[i].boardY][selectedPath[i].boardX][1] = null;
							};

						}

						var king = false;
						if (currentPlayer){
							if (closestSquare.boardY == 7){
								piece.king = 1;
								piece.graphics.beginFill("grey").drawPolyStar(0, 0, 20, 5, 0.6, -90);
								king = true;
							}
						}
						else {
							if (closestSquare.boardY == 0) {
								piece.king = 1;
								piece.graphics.beginFill("grey").drawPolyStar(0, 0, 20, 5, 0.6, -90);
								king = true;
							}
						}
					

						socket.send({
							gameId: gameId,
							action: "MOVE",
							move: move,
							taken_enemies: taken_enemies,
							king: king
						})
						currentTurn = currentTurn ? 0 : 1;
					}
					
					hit = anyHit(virtualBoard);
				})				
			}
		}		
		console.log("hit flag ", hit);
	}


	function initSocket() {
		var socket = new io({reconnection: false});

		socket.on('connect',function() {
			console.log('Client has connected to the server!');
			socket.send({
				action: "CONNECT",
				gameId: gameId
			});
		});

		socket.on('message',function(msg) {
			console.log('Received a message from the server!',msg);
			if (msg["action"] == "START"){
				initPieces(board);
				
				currentPlayer = msg["player"];
				currentTurn = 0;

				if (currentPlayer){
					board.regX = 800;
					board.regY = 600;
					board.rotation = 180;

				}
			}

			else if (msg["action"] == "MOVE"){
				var move = msg["move"];
				var initY = move["initialY"];
				var initX = move["initialX"];
				var finX = move["finalX"];
				var finY = move["finalY"];
				currentTurn = currentTurn ? 0 : 1;

				moved_piece = virtualBoard[initY][initX][1];
				moved_piece.x = virtualBoard[finY][finX][0].x + 25;
				moved_piece.y = virtualBoard[finY][finX][0].y + 25;
				if (msg["king"] == true){
					moved_piece.king = 1;
					moved_piece.graphics.beginFill("grey").drawPolyStar(0, 0, 20, 5, 0.6, -90);

				}

				virtualBoard[initY][initX][1] = null;
				virtualBoard[finY][finX][1] = moved_piece;
				moved_piece.boardY = finY;
				moved_piece.boardX = finX;

				msg["taken_enemies"].forEach(function(enemy){
					var taken_piece = virtualBoard[enemy["boardY"]][enemy["boardX"]][1];
					board.removeChild(taken_piece);
					virtualBoard[enemy["boardY"]][enemy["boardX"]][1] = null;
				})
				
				hit = anyHit(virtualBoard);
				console.log("hit flag ", hit)
				console.log("Following move has been done ", msg);

			}
		});

		socket.on('disconnect',function() {
			console.log('The client has disconnected!');
		});

		return socket;
	}


	function init() {
		var stage = new createjs.Stage("demoCanvas");

		board = new createjs.Container();
		stage.addChild(board);

		virtualBoard = initBoard(board);

		


		gameId = "";
		var pathnames = window.location.pathname.split("/");
		if (pathnames.length == 3){
			gameId = pathnames[2];		
		}
		if (gameId == "") {
			gameId = Math.floor(Math.random() * 1000000).toString();
		}
		console.log(gameId);


		socket = initSocket();
		socket.connect();


		createjs.Ticker.on("tick", function tick(event) {  
			stage.update(event);
		});
		createjs.Ticker.setFPS(20);


	}


	init();


		// 	if (currentPlayer){
		// 	stage.regX = 800;
		// 	stage.regY = 600;
		// 	stage.rotation = 180;
		// }





}
