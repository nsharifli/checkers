console.log("starting client");
		
			

function init() {

	var hit;
	var currentPlayer;
	var currentTurn;


	function findLeft(position, virtualBoard) {

		if (currentPlayer) {
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


	function findRight(position, virtualBoard) {
		if (currentPlayer) {

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


	function canHitLeft (position, virtualBoard) {

		if (currentPlayer) {

			var road = {};
			var left = findLeft(position, virtualBoard);
			if (left == null || left[1] == null || currentPlayer == left[1].player) {
				return null;
			}

			var leftOfLeft = findLeft({boardX: left[1].boardX, boardY: left[1].boardY}, virtualBoard);
			if (leftOfLeft == null || leftOfLeft[1] != null) {
				return null;
			}

			road.enemy = left[1];
			road.destination = {boardX: left[1].boardX - 1, boardY: left[1].boardY + 1};

			return road;
			
		}

		else {
			var road = {};
			var left = findLeft(position, virtualBoard);
			if (left == null || left[1] == null || currentPlayer == left[1].player) {
				return null;
			}

			var leftOfLeft = findLeft({boardX: left[1].boardX, boardY: left[1].boardY}, virtualBoard);
			if (leftOfLeft == null || leftOfLeft[1] != null) {
				return null;
			}

			road.enemy = left[1];
			road.destination = {boardX: left[1].boardX - 1, boardY: left[1].boardY - 1};

			return road;
		}
		


	}


	function canHitRight(position, virtualBoard){

		if (currentPlayer) {

			var road = {};
			var right = findRight(position, virtualBoard);
			if (right == null || right[1] == null || currentPlayer == right[1].player) {
				return null;
			}

			var rightOfRight = findRight({boardX: right[1].boardX, boardY: right[1].boardY}, virtualBoard);
			if (rightOfRight == null || rightOfRight[1] != null) {
				return null;
			}

			road.enemy = right[1];
			road.destination = {boardX: right[1].boardX + 1, boardY: right[1].boardY + 1};

			return road;
			
		}

		else {
			var road = {};
			var right = findRight(position, virtualBoard);
			if (right == null || right[1] == null || currentPlayer == right[1].player) {
				return null;
			}

			var rightOfRight = findRight({boardX: right[1].boardX, boardY: right[1].boardY}, virtualBoard);
			if (rightOfRight == null || rightOfRight[1] != null) {
				return null;
			}

			road.enemy = right[1];
			road.destination = {boardX: right[1].boardX + 1, boardY: right[1].boardY - 1};

			return road;
		}
	};


	function anyHit (virtualBoard) {
		for (row = 0; row < 8; row++) {
			for (col = 0; col < 8; col++){
				var piece = virtualBoard[row][col][1];
				if (piece == null || piece.player != currentPlayer) {
					continue;
				}

				var leftEnemy = canHitLeft({boardX: piece.boardX, boardY: piece.boardY}, virtualBoard);
				var rightEnemy = canHitRight({boardX:piece.boardX, boardY: piece.boardY},virtualBoard);

				if (leftEnemy != null || rightEnemy != null) {
					return true;

				}
			}
		}

		return false;
	}
		

	function availableHits (position, virtualBoard) {
		// hit function should determine the final place of piece after hit, and remove the enemy pieces;
		// it should return the destination cell and enemy pieces' locations;
		var listOfPaths = [];
		var leftEnemy = canHitLeft(position, virtualBoard);
		var rightEnemy = canHitRight(position, virtualBoard);

		if (leftEnemy != null) {
			var leftPath = availableHits (leftEnemy.destination, virtualBoard);

			for (i = 0; i < leftPath.length; i++) {
				leftPath[i].unshift(leftEnemy.enemy, leftEnemy.destination);	
			}

			if (leftPath.length == 0) {
				leftPath.push([leftEnemy.enemy, leftEnemy.destination]);
			}
			listOfPaths = listOfPaths.concat(leftPath);
		}
		

		if (rightEnemy != null) {
			var rightPath = availableHits(rightEnemy.destination, virtualBoard);
			
			for (i = 0; i < rightPath.length; i++) {
				rightPath[i].unshift(rightEnemy.enemy, rightEnemy.destination);	
			}

			if (rightPath.length == 0) {
				rightPath.push([rightEnemy.enemy, rightEnemy.destination]);
			}
			listOfPaths = listOfPaths.concat(rightPath);	
		}

		return listOfPaths;	
	}


	function availableMoves(piece, virtualBoard) {
		var moves = [];
		if (currentTurn == currentPlayer){
			

			if (hit) {
				hits = availableHits({boardX: piece.boardX, boardY: piece.boardY}, virtualBoard);
				for (i = 0; i < hits.length; i++) {
					var path = hits[i];
					destination = path[path.length - 1];
					square = virtualBoard[destination.boardY][destination.boardX][0];
					moves.push(square);
				}
				
				return moves;
			}


			var left = findLeft(piece, virtualBoard);

			if (left != null && left[1] == null) {
				moves.push(left[0]);
			}
		
			var right = findRight(piece, virtualBoard);
			if (right != null && right[1] == null) {
				moves.push(right[0]);
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


	function initPieces(stage, board, virtualBoard) {
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

					piece.x = evt.stageX;
					piece.y = evt.stageY;

					var moves = availableMoves(piece, virtualBoard);
					var paths = availableHits({boardX: piece.boardX, boardY: piece.boardY}, virtualBoard);
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
					var moves = availableMoves(piece, virtualBoard);
					var initial_square = virtualBoard[piece.boardY][piece.boardX];
					var paths = availableHits({boardX: piece.boardX, boardY: piece.boardY}, virtualBoard);
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
						var paths = availableHits({boardX: piece.boardX, boardY: piece.boardY}, virtualBoard);
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
							console.log(paths);

							
							for (i = 0 ; i < selectedPath.length; i += 2){

								taken_enemy = virtualBoard[selectedPath[i].boardY][selectedPath[i].boardX][1]
								board.removeChild(taken_enemy);
								enemy = {
									boardX: taken_enemy.boardX,
									boardY: taken_enemy.boardY
								}
								taken_enemies.push(enemy);
								virtualBoard[selectedPath[i].boardY][selectedPath[i].boardX][1] = null;
							};
						}

						socket.send({
							gameId: gameId,
							action: "MOVE",
							move: move,
							taken_enemies: taken_enemies
						})

						currentTurn = currentTurn ? 0 : 1;

					}

					hit = anyHit(virtualBoard);
												
					
				})
				
			}
		}
		


		
		console.log(hit);

		
		//can hit
	}

	var board = new createjs.Container();
	// board.setTransform(0, 0, 1, 1, 0);
	var stage = new createjs.Stage("demoCanvas");
	stage.addChild(board);

	var virtualBoard = initBoard(board);



	

	createjs.Ticker.on("tick", function tick(event) {  
		stage.update(event);
	});
	
	createjs.Ticker.setFPS(20);




	//Socket demo;

	// Create SocketIO instance, connect
	var socket = new io({reconnection: false});
	socket.connect();
	var gameId = "";

	var pathnames = window.location.pathname.split("/");
	
	if (pathnames.length == 3){

		gameId = pathnames[2];		
	}

	if (gameId == "") {
		gameId = Math.floor(Math.random() * 1000000).toString();
	}


	console.log(gameId);

	// Add a connect listener
	socket.on('connect',function() {
		console.log('Client has connected to the server!');
		socket.send({
			action: "CONNECT",
			gameId: gameId
		});
	});
	// Add a connect listener
	socket.on('message',function(msg) {
		console.log('Received a message from the server!',msg);
		if (msg["action"] == "START"){
			initPieces(stage, board, virtualBoard);
			currentPlayer = msg["player"];
			currentTurn = 0;


		}

		else if (msg["action"] == "MOVE"){
			currentTurn = currentTurn ? 0 : 1;
			moved_piece = virtualBoard[msg["move"]["initialY"]][msg["move"]["initialX"]][1];
			board.removeChild(virtualBoard[msg["move"]["initialY"]][msg["move"]["initialX"]][1]);
			virtualBoard[msg["move"]["initialY"]][msg["move"]["initialX"]][1] = null;
			moved_piece.boardY = msg["move"]["finalY"];
			moved_piece.boardX = msg["move"]["finalX"];
			moved_piece.x = virtualBoard[msg["move"]["finalY"]][msg["move"]["finalX"]][0].x + 25;
			moved_piece.y = virtualBoard[msg["move"]["finalY"]][msg["move"]["finalX"]][0].y + 25;
			virtualBoard[msg["move"]["finalY"]][msg["move"]["finalX"]][1] = moved_piece;
			board.addChild(moved_piece);


			msg["taken_enemies"].forEach(function(enemy){
				taken_piece = virtualBoard[enemy["boardY"]][enemy["boardX"]][1];
				board.removeChild(taken_piece);
				virtualBoard[enemy["boardY"]][enemy["boardX"]][1] = null;
			})
			
			hit = anyHit(virtualBoard);
			console.log(hit)

		}


	});
	// Add a disconnect listener
	socket.on('disconnect',function() {
		console.log('The client has disconnected!');
	});



}



