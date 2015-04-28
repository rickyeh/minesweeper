var boardSize = 10;
var totalTurns = 0;
var MINE = '*';

var player = {
    reveal: function(i, j) {
        if (boardUI.isDisabled){
            console.log('Game is over.  Please Restart');
            return;
        }

        $('#box' + i + j).addClass('dug');
        $('#box' + i + j).removeClass('boardCell:hover');

        if (board.gameBoard[i][j] === MINE) {
            // Insert losing code
            boardUI.isDisabled = true;
            $('#box' + i + j).addClass('mine');
            console.log('You lose');
        } else if (board.gameBoard[i][j] === 0) {
            // Insert autoclear function
            return;
        }

        switch (board.gameBoard[i][j]) {
            case 1:
                $('#box' + i + j).addClass('one');
                break;
            case 2:
                $('#box' + i + j).addClass('two');
                break;
            case 3:
                $('#box' + i + j).addClass('three');
                break;
            case 4:
                $('#box' + i + j).addClass('four');
                break;
            case 5:
                $('#box' + i + j).addClass('five');
                break;
            case 6:
                $('#box' + i + j).addClass('six');
                break;
            case 7:
                $('#box' + i + j).addClass('seven');
                break;
            case 8:
                $('#box' + i + j).addClass('eight');
                break;
        }
        $('#box' + i + j).text(board.gameBoard[i][j]);
    },
    flag: function(i, j) {
        if (boardUI.isDisabled){
            console.log('Game is over.  Please Restart');
            return;
        }

        $('#box' + i + j).text('~');
        $('#box' + i + j).addClass('flag');
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

        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                var obj = {
                    row : i,
                    col : j,
                };

                this.freeSpaces.push(obj);
            }
        }
        this.freeSpaces = this.shuffleArray(this.freeSpaces);
    },
    shuffleArray: function (array) {
        var temp;
        var index;
        var counter = array.length;

        // Shuffle the array
        while (counter > 0) {
            index = Math.floor(Math.random() * counter);

            counter--;

            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    },

    placeMines: function(diff) {
        var numMines = Math.floor((boardSize * boardSize) * (diff / 100));
        var maxRows = boardSize - 1;
        var rowSearch, colSearch;


        for (var i = 0; i < numMines ; i++) {

            // Shift out first available coordinate
            var mineCoordinate = this.freeSpaces.shift();   
           
            var row = mineCoordinate.row;      // Assign row to first character
            var col = mineCoordinate.col;      // Assign column to second character

            board.gameBoard[row][col] = MINE;         // Place mine at row, col

            // Increment every number around it, unless another mine.
            // If this square is a number, increment.  Else ignore
            for (var j = -1; j < 2; j++) {
                for (var k = -1; k < 2; k++) {
                    rowSearch = row + j;
                    colSearch = col + k;

                    if (rowSearch < 0 || rowSearch > maxRows) {
                        continue;
                    } else if (colSearch < 0 || colSearch > maxRows) {
                        continue;
                    } else {
                        if ((this.gameBoard[rowSearch][colSearch] !== MINE)) {
                            this.gameBoard[rowSearch][colSearch]++;
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
        // Returns a handler function that is called when clicked.  Uses closure to pass in i, j
        function createHandler(i, j) {
            var handler = function(event) {
                switch (event.which) {
                    case 1:
                    default:
                        player.reveal(i, j);
                        break;
                    case 3:
                        player.flag(i, j);
                        break;
                }
            };
            return handler;
        }

        function createHoverHandler(i, j) {
            var handler = function() {
                $('#box' + i + j).addClass('boardCellHover');
            };
            return handler;
        }

        function createDeHoverHandler(i, j) {
            var handler = function() {
                $('#box' + i + j).removeClass('boardCellHover');
            };
            return handler;
        }

        // Loop to initialize all board cell handlers
        for (var i = 0; i < boardSize; ++i) {
            for (var j = 0; j < boardSize; ++j) {
                var handler = createHandler(i, j);
                $('#box' + i + j).mouseup(handler);
                $('#box' + i + j).on('mouseover', createHoverHandler(i, j));
                $('#box' + i + j).on('mouseout', createDeHoverHandler(i, j));
            }
        }

        // Reset button
        $('#resetButton').click(function() {
            boardUI.resetGame();
        });
    },
    resetGame: function() {
        for (var i = 0; i < boardSize; ++i) {
            for (var j = 0; j < boardSize; ++j) {
                $('#box' + i + j).text('');
                $('#box' + i + j).removeClass('dug');
                $('#box' + i + j).removeClass('mine');
                boardUI.isDisabled = false;
            }
        }
    }
};

$(document).ready(function() {

    boardUI.createGrid(boardSize);
    boardUI.createClickHandlers();
    board.createBoard(boardSize);
    board.createFreeSpaceArray(boardSize);
    board.placeMines(21);


});

