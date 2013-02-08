/*
TODO:



*/

ROWS = 7;
COLS = 7;

LEVEL = 1; // current level
TURNS = 5; // turns left on this level
SCORE = 0; // user's current score

BOARD = [ [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0] ];


$(document).ready( function() {
    // create backdrop
    for(var row = ROWS-1; row >= 0; row--) {
        for(var col = 0; col < COLS; col++) {
            $('<div class="cell" data-col="'+col+'" data-row="'+row+'"></div>').appendTo("#board");
        }
    }

    // attach listeners
    $("div.cell").on('click', function() {
        console.log("Player clicked on column", $(this).data('col'));
    });
});
