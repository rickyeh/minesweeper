var boardSize = 10;
var totalTurns = 0;

var player = { 

};

var board = {
    gameBoard : new Array(boardSize),

    createBoard: function(n) {
        for (var i = 0; i < n; i++) {
            this.gameBoard[i] = new Array(n);
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
    }
};

$(document).ready(function() {

    boardUI.createGrid(boardSize);
    board.createBoard(boardSize);

});