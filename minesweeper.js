var boardSize = 10;
var numCells = boardSize * boardSize;
var numCellsRevealed = 0;
var MINE = '*';
var maxRows = boardSize - 1;

// Object that represents the player.
var player = {
    isFirstTurn: true,

    // Method called when player clicks on a cell.  Reveals the cell
    reveal: function(i, j) {

        // Check if board is disabled by loss/victory.  Do nothing if true.
        if (boardUI.isDisabled) {
            console.log('Game is over.  Please Restart');
            return;
        }

        // If this reveal is the first turn, initialize the game and generate the board
        if (this.isFirstTurn) {
            board.initGame(i, j);
            if (multiplayer.isMultiplayer) {
                PeerLib.send(board.gameBoard);  // Send over the generated board to peer
            }
            this.isFirstTurn = false;
        }

        $('#box' + i + j).addClass('dug');
        $('#box' + i + j).off('mouseup');

        // If the clicked cell is a mine, player loses, all mines are shown
        if (board.gameBoard[i][j] === MINE) {
            boardUI.isDisabled = true;
            console.log('You lose');
            $('#box' + i + j).addClass('mine');
            boardUI.showAllMines();
            return;
        }

        // Depending on what number is revealed, either change colors or autoclear if 0
        switch (board.gameBoard[i][j]) {
            case 0:
                player.autoClear(i, j);
                player.checkVictory();
                return;
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
        player.checkVictory();
    },

    // Method called when player right clicks
    flag: function(i, j) {
        if ($('#box' + i + j).hasClass('flag') && boardUI.isDisabled === false) {
            $('#box' + i + j).removeClass('flag').text('');
            boardUI.flagCounter++;
            $('#flagCounter').text(boardUI.flagCounter);
            return;
        }

        if (boardUI.isDisabled) {
            console.log('Game is over.  Please Restart');
            return;
        }

        // Inserts flag icon
        $('#box' + i + j).addClass('flag').prepend('<img class="icons" src="img/flag.png" />');
        boardUI.flagCounter--;
        $('#flagCounter').text(boardUI.flagCounter);
    },

    // Method that checks for a victory everytime a cell is successfully cleared
    checkVictory: function() {
        numCellsRevealed++;
        console.log(numCellsRevealed);

        if (numCellsRevealed === (numCells - board.numMines)) {
            console.log('You Won!');
            swal(boardUI.winAlert);
            boardUI.isDisabled = true;
        }
    },
    // Method that clears all surrounding cells when a 0 is revealed until there are no zeroes
    autoClear: function(row, col) {

        var rowSearch, colSearch;

        // Loops through each direction to reveal all adjacent cells.
        // Ignores rows and cols beyond the borders, and cell itself, and anything already revealed
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                rowSearch = row + i;
                colSearch = col + j;

                if (rowSearch < 0 || rowSearch > maxRows) {
                    continue;
                } else if (colSearch < 0 || colSearch > maxRows) {
                    continue;
                } else if (i === 0 && j === 0) {
                    continue;
                } else if ($('#box' + rowSearch + colSearch).hasClass('dug')) {
                    continue;
                } else {
                    player.reveal(rowSearch, colSearch);
                }
            }
        }
    }
};

// Object to represent the board data
var board = {
    gameBoard: new Array(boardSize),
    freeSpaces: [],
    numMines: 0,

    // Method that initializes the game by calling other methods.
    initGame: function(clickedRow, clickedCol) {
        this.numMines = this.getNumMines();
        this.createBoard(boardSize);
        this.createFreeSpaceArray(boardSize, clickedRow, clickedCol);
        this.placeMines(this.numMines);
    },
    // Method that creates the 2d array that will store the game data
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
    // Method that creates an array to determine where mines are placed
    createFreeSpaceArray: function(n, clickedRow, clickedCol) {

        this.freeSpaces = []; // Empty the freeSpaces array (in case of refresh)

        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                if (i === clickedRow && j === clickedCol) {
                    continue;
                } else {
                    var obj = {
                        row: i,
                        col: j,
                    };
                    this.freeSpaces.push(obj);
                }
            }
        }
        this.freeSpaces = this.shuffleArray(this.freeSpaces);
    },
    // Method that returns the number of mines appropriate for a difficulty
    getNumMines: function() {
        return Math.floor((parseInt($('#diffMenu').val()) / 100) * numCells);
    },
    // Method that shuffles an array.  Used to randomize available spaces for mine placement.
    shuffleArray: function(array) {
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

    // Method that randomly places mines
    placeMines: function(numMines) {
        var rowSearch, colSearch;

        for (var i = 0; i < numMines; i++) {

            // Shift out first available coordinate
            var mineCoordinate = this.freeSpaces.shift();

            var row = mineCoordinate.row; // Assign row to first character
            var col = mineCoordinate.col; // Assign column to second character

            board.gameBoard[row][col] = MINE; // Place mine at row, col

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
                            this.gameBoard[rowSearch][colSearch] ++;
                        }
                    }
                }
            }
        }
    }
};

// Object to represent the board's UI
var boardUI = {

    // Flag that toggles the board's clickability.
    isDisabled: false,
    flagCounter: 0,

    // SweetAlert object for winning alert
    winAlert: {
        title: 'Woot!',
        text: 'You win! \n Click refresh or select another difficulty level.',
        imageUrl: 'img/smiley.png',
        confirmButtonText: 'Okay',
        confirmButtonColor: '#DD6B55'
    },

    // Double for loop to insert HTML for grid creation
    createGrid: function(n) {
        for (var i = 0; i < n; ++i) {
            for (var j = 0; j < n; ++j) {
                var boxString = '<div class="boardCell" id="box' + i + j + '"></div>';
                $('#gameBoard').append(boxString);
            }
        }
    },

    // Creates click handlers for all the grids and buttons
    createClickHandlers: function() {
        // Returns a handler function that is called when clicked.  Uses closure to pass in i, j
        function createHandler(i, j) {
            var handler = function(event) {
                switch (event.which) {
                    case 1: // Left Click
                    default:
                        // If cell is flagged, do not reveal cell.
                        if ($('#box' + i + j).hasClass('flag')) {
                            // Do nothing
                        } else {
                            player.reveal(i, j);
                            if (multiplayer.isMultiplayer) {
                                PeerLib.send({click: 'l', row: i, col: j});
                            }
                        }
                        break;
                    case 3: // Right Click
                        player.flag(i, j);
                        if (multiplayer.isMultiplayer) {
                            PeerLib.send({click: 'r', row: i, col : j});
                        }
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
                $('#box' + i + j).on('mouseup', createHandler(i, j));
                $('#box' + i + j).on('mouseover', createHoverHandler(i, j));
                $('#box' + i + j).on('mouseout', createDeHoverHandler(i, j));
            }
        }

        // Reset button
        $('#resetButton').off().click(function() {
            boardUI.resetGame();
        });
    },
    // Initializes the fancy select box
    initHeaderElements: function() {

        // Initialize flag counter
        this.flagCounter = board.getNumMines();
        $('#flagCounter').text(this.flagCounter);

        // Initialize fancy select box
        $('#diffMenu').fancySelect();

        // On change in difficulty, the board is reloaded.
        $('#diffMenu').fancySelect().on('change.fs', function() {

            // If it's not the first turn, or the end of a game, pop up confirmation box
            if (!player.isFirstTurn  && !boardUI.isDisabled) {
                swal({
                    title: 'Are you sure?',
                    text: 'Game will reset and you will lose all progress.',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yep!',
                }, function(isConfirm) {
                    if (isConfirm) {
                        boardUI.resetGame();
                    } else {
                        $('#diffMenu').val(board.numMines).trigger('update');
                    }
                });
            } else {
                boardUI.resetGame();
            }
        });
    },
    // Pre-loads the graphics to prevent lag on first use.
    preloadImages: function() {
        var img1 = new Image();
        var img2 = new Image();

        img1.src = 'img/flag.png';
        img2.src = 'img/mine.png';
    },
    // Function to display all mines on a game loss
    showAllMines: function() {
        for (var i = 0; i < boardSize; ++i) {
            for (var j = 0; j < boardSize; ++j) {
                if (board.gameBoard[i][j] == MINE) {
                    $('#box' + i + j).html('<img class="icons" src="img/mine.png" />');
                }
            }
        }
    },
    // Method that resets game to initial state.
    resetGame: function() {
        if (multiplayer.isMultiplayer) {
            if(player.isFirstTurn) {
                return;
            }
            PeerLib.send({reset: true});
        }

        numCellsRevealed = 0;

        // Disable all click handlers and styles to the cells, reset to default.
        for (var i = 0; i < boardSize; ++i) {
            for (var j = 0; j < boardSize; ++j) {
                $('#box' + i + j).off().text('').attr('class', 'boardCell');
            }
        }
        
        player.isFirstTurn = true;
        boardUI.isDisabled = false;

        // Reset the board to undefined so multiplayer mode knows board is fresh.
        for (var i = 0; i < boardSize; ++i) {
            board.gameBoard[i] = undefined;
        }
        
        // Recreate click handlers and reset number of mines and flags.
        boardUI.createClickHandlers();
        board.numMines = board.getNumMines();
        boardUI.flagCounter = board.numMines;
        $('#flagCounter').text(boardUI.flagCounter);
    }
};

var multiplayer =  {
    isMultiplayer : true,
    apiKey : 'p4tiwn62dkt3ayvi',
    rcvRow : 0,
    rcvCol : 0,

    onReceivedData: function(data) {
        console.dir('RCV: ' + data);

        if (data.reset === true) {
            boardUI.resetGame();
            return;
        }

        if (board.gameBoard[0] === undefined) {  // If board is not generated yet
            board.gameBoard = data;              // Copy remote gameboard to local one
            player.isFirstTurn = false;
            console.log('Gameboard received from peer');
        }

        if (data.click === 'l'){
            player.reveal(data.row, data.col);
        } else if (data.click === 'r') {
            player.flag(data.row, data.col);
        }

    }
};

// For debugging purposes only.  Remove function after completed project.
// function revealAll() {
//     for (var i = 0; i < boardSize; ++i) {
//         for (var j = 0; j < boardSize; ++j) {
//             $('#box' + i + j).text(board.gameBoard[i][j]);
//         }
//     }
// }

$(document).ready(function() {
    boardUI.initHeaderElements();
    boardUI.createGrid(boardSize);
    boardUI.createClickHandlers();
    boardUI.preloadImages();
    PeerLib.setup(multiplayer.apiKey);
    PeerLib.setReceiveHandler(multiplayer.onReceivedData);
});