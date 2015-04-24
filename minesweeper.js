var boardSize = 10;
var totalTurns = 0;

var player = { 
    reveal: function(i, j) {
        $('#box'+ i + j).html(board.gameBoard[i][j]);
    }
};

var board = {
    gameBoard : new Array(boardSize),
    freeSpaces : [],

    createBoard: function(n) {
        for (var i = 0; i < n; i++) {
            this.gameBoard[i] = new Array(n);
        }
        for (i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                this.gameBoard[i][j] = 0;
            }
        }
    },
    createFreeSpaceArray: function(n) {
        var temp;
        var index;

        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                this.freeSpaces.push(i.toString() + j.toString());
            }
        }

        var counter = this.freeSpaces.length;

        // Shuffle the array
        while (counter > 0) {
            index = Math.floor(Math.random() * counter);

            counter--;

            temp = this.freeSpaces[counter];
            this.freeSpaces[counter] = this.freeSpaces[index];
            this.freeSpaces[index] = temp;
        }

    },
    placeMines: function(diff) {
        var numMines = Math.floor((boardSize * boardSize) * (diff / 100));
        var maxRows = boardSize - 1;

        for (var i = 0; i < numMines ; i++) {

            // Shift out first available coordinate
            var mineCoordinate = this.freeSpaces.shift();   
           
            var row = parseInt(mineCoordinate.charAt(0));      // Assign row to first character
            var col = parseInt(mineCoordinate.charAt(1));      // Assign column to second character

            board.gameBoard[row][col] = 'm';         // Place mine at row, col

            // Increment every number around it, unless another mine.
            // If this square is a number, increment.  Else ignore
            for (var j = -1; j < 2; j++) {
                for (var k = -1; k < 2; k++) {
                    if (row + j < 0 || row + j > maxRows) {
                        continue;
                    } else if (col + k < 0 || col + k > maxRows) {
                        continue;
                    } else {
                        if (!isNaN(this.gameBoard[row + j][col + k])) {
                            this.gameBoard[row + j][col + k] ++;
                        }
                    }
                }
            }
        }
    }
};

var boardUI = {

    isDisabled: false,

    // Double for loop to insert HTML for grid creation
    createGrid: function(n) {
        for (var i = 0; i < n; ++i) {
            for (var j = 0; j < n; ++j) {
                var boxString = '<div class="boardCell" id="box' + i + j + '"></div>';
                $('#gameBoard').append(boxString);
            }
        }
    },

    createClickHandlers: function() {
    // Create anonymous function to pass in the i to create closure
        function createAnonFunction(i, j) {
            var actionOnClick = function() {
                player.reveal(i,j);
            };
            return actionOnClick;
        }

        // Loop to initialize all board cell handlers
        for (var i = 0; i < boardSize; ++i) {
            for (var j = 0; j < boardSize; ++j) {
                $('#box' + i + j).click(createAnonFunction(i, j));
            }
        }

        // Reset button
        // $('#resetButton').click(function() {
        //     boardUI.resetGame();
        // });
    }
};

$(document).ready(function() {

    boardUI.createGrid(boardSize);
    boardUI.createClickHandlers();
    board.createBoard(boardSize);
    board.createFreeSpaceArray(boardSize);
    board.placeMines(20);


});

