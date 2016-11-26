console.log("starting client");
		
			

function init() {
	var hit;
	var currentPlayer = 0;


	function initBoard(stage) {
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
				stage.addChild(square);
			}
		}
		return virtualBoard;
	}


	function availableMoves(virtualBoard, piece) {
		var moves = [];
		

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

		if (piece.boardX > 0 && piece.boardY < 7){
			var left = virtualBoard[piece.boardY+1][piece.boardX - 1];
			if (left[1] == null) {
				moves.push(left[0]);
			}
		}

		if (piece.boardX < 7 && piece.boardY < 7){
			var right = virtualBoard[piece.boardY+1][piece.boardX + 1];
			if (right[1] == null) {
				moves.push(right[0]);
			}
		}

	

		return moves;
	}


	function findLeft(position, virtualBoard) {
		if (position.boardY > 6){
			return null;
		}
		var left = virtualBoard[position.boardY + 1][position.boardX - 1];
		return left;
	}

	function findRight(position, virtualBoard) {
		if (position.boardX > 6 || position.boardY > 6){
			return null;
		}
		var right = virtualBoard[position.boardY + 1][position.boardX + 1];
		return right;
	}





	function initPieces(stage, virtualBoard) {
		var piece, test_enemy;
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
					
					piece.graphics.beginFill("white").drawCircle(0,0,20);
					piece.player = 0;
					stage.addChild(piece);
					virtualBoard[row][col][1] = piece;
				}






				// else if ( ([5, 6, 7].indexOf(row) != -1) && ((row + col) % 2 == 1)){
				// 	piece.graphics.beginFill("red").drawCircle(0,0,20);
				// 	piece.player = 1;
				// 	stage.addChild(piece);
				// virtualBoard[row][col][1] = piece;

				// }

				piece.on("pressmove", function(evt){
					var piece = evt.currentTarget;

					piece.x = evt.stageX;
					piece.y = evt.stageY;

					var moves = availableMoves(virtualBoard, piece);
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
					var moves = availableMoves(virtualBoard, piece);
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
						piece.boardX = closestSquare.boardX;
						piece.boardY = closestSquare.boardY;
						virtualBoard[closestSquare.boardY][closestSquare.boardX][1] = piece;
						
						
						if (paths.length != 0) {
							var selectedPath = paths.find(function(path){
								var destination = path[path.length - 1];

								return (destination.boardX == closestSquare.boardX) &&
								(destination.boardY == closestSquare.boardY);
							});
							
							for (i = 0 ; i < selectedPath.length; i += 2){
								
								stage.removeChild(virtualBoard[selectedPath[i].boardY][selectedPath[i].boardX][1]);
								virtualBoard[selectedPath[i].boardY][selectedPath[i].boardX][1] = null;
							};





						}

					}
					hit = anyHit(virtualBoard);
												
					
				})
				




				
			}
		}

		//Adding enemy pieces to test jumping;

		test_enemy = new createjs.Shape();
		test_enemy.x = virtualBoard[5][2][0].x + 25;
		test_enemy.y = virtualBoard[5][2][0].y + 25;

		test_enemy.boardX = 2;
		test_enemy.boardY = 5;			
		test_enemy.graphics.beginFill("red").drawCircle(0,0,20);
		test_enemy.player = 1;
		stage.addChild(test_enemy);
		virtualBoard[5][2][1] = test_enemy;

		test_enemy = new createjs.Shape();
		test_enemy.x = virtualBoard[7][6][0].x + 25;
		test_enemy.y = virtualBoard[7][6][0].y + 25;

		test_enemy.boardX = 6;
		test_enemy.boardY = 7;			
		test_enemy.graphics.beginFill("red").drawCircle(0,0,20);
		test_enemy.player = 1;
		stage.addChild(test_enemy);
		virtualBoard[7][6][1] = test_enemy;

		test_enemy = new createjs.Shape();
		test_enemy.x = virtualBoard[3][2][0].x + 25;
		test_enemy.y = virtualBoard[3][2][0].y + 25;

		test_enemy.boardX = 2;
		test_enemy.boardY = 3;			
		test_enemy.graphics.beginFill("red").drawCircle(0,0,20);
		test_enemy.player = 1;
		stage.addChild(test_enemy);
		virtualBoard[3][2][1] = test_enemy;


		test_enemy = new createjs.Shape();
		test_enemy.x = virtualBoard[5][4][0].x + 25;
		test_enemy.y = virtualBoard[5][4][0].y + 25;

		test_enemy.boardX = 4;
		test_enemy.boardY = 5;			
		test_enemy.graphics.beginFill("red").drawCircle(0,0,20);
		test_enemy.player = 1;
		stage.addChild(test_enemy);
		virtualBoard[5][4][1] = test_enemy;

		test_enemy = new createjs.Shape();
		test_enemy.x = virtualBoard[5][6][0].x + 25;
		test_enemy.y = virtualBoard[5][6][0].y + 25;

		test_enemy.boardX = 6;
		test_enemy.boardY = 5;			
		test_enemy.graphics.beginFill("red").drawCircle(0,0,20);
		test_enemy.player = 1;
		stage.addChild(test_enemy);
		virtualBoard[5][6][1] = test_enemy;

		hit = anyHit(virtualBoard);
		console.log(hit);

		
		//can hit
	}

	function anyHit (virtualBoard) {
		


		for (row = 0; row < 6; row++) {
			for (col = 0; col < 8; col++){
				var piece = virtualBoard[row][col][1];
				if (piece == null || piece.player == 1) {
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


	function canHitLeft (position, virtualBoard) {
		

		if (position.boardX > 1 && position.boardY < 6){

			var road = {};


			var left = findLeft(position, virtualBoard);
			if (left[1] != null && currentPlayer != left[1].player && findLeft({boardX: left[1].boardX, boardY: left[1].boardY}, virtualBoard)[1] == null ) {
				road.enemy = left[1];
				road.destination = {boardX: left[1].boardX - 1, boardY: left[1].boardY + 1};
				return road;

			}
		}
		return null;

	}

	function canHitRight(position, virtualBoard){
		

		if (position.boardX < 6 && position.boardY < 6) {
			var road = {};
			var right = findRight(position, virtualBoard);


			

			if (right[1] != null && currentPlayer != right[1].player && findRight({boardX: right[1].boardX, boardY: right[1].boardY}, virtualBoard)[1] == null) {

				road.enemy = right[1];
				road.destination = {boardX: right[1].boardX + 1, boardY: right[1].boardY + 1};

				return road;
			}
		}
		return null;

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

		


	


							

					// else if ( [5, 6, 7].indexOf(row) != -1 && (row + col) % 2 == 1) {
					// 	a = a + 1
					// 	red_piece = new createjs.Shape();
					// 	red_piece.graphics.beginFill("red").drawCircle(0,0,20);
					// 	red_piece.x = square.x + 25;
					// 	red_piece.y = square.y + 25;
					// 	red_pieces.push(red_piece);
					// 	virtualBoard[row][col][1] = red_piece;
					// 	red_piece.boardX = col;
					// 	red_piece.boardY = row;
					// 	stage.addChild(red_piece);
					// }

	var stage = new createjs.Stage("demoCanvas");

	var virtualBoard = initBoard(stage);

	initPieces(stage, virtualBoard);
	


	createjs.Ticker.on("tick", function tick(event) {  
		stage.update(event);
	});
	
	createjs.Ticker.setFPS(20);


	

	


}



