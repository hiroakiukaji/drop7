ROWS = 7;
COLS = 7;
board = [ [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0] ];


var update_table = function() {
    // make sure that the HTML table accurately reflects the game board.
    $("td").attr('class', '');
    for(var row = 0; row < ROWS; row++) {
        for(var col = 0; col < COLS; col++) {
            $("td#cell_" + row + "_" + col).addClass("a" + board[row][col]);
        }
    }
}

var populate_board = function() {
    // zero out all cells
    // for each column, add a random stack of tiles.
    // after stacking tiles, make sure all are "valid" - e.g., a 1 by itself would disappear.

    for(var row = 0; row < ROWS; row++) {
        for(var col = 0; col < COLS; col++) {
            board[row][col] = 0;
        }
    }

    for(var col = 0; col < COLS; col++) {
        var stack_height = Math.floor(Math.random() * ROWS); // 0-7, inclusive
        while(--stack_height >= 0) {
            tile = Math.ceil(Math.random() * ROWS);
            board[stack_height][col] = tile;
        }
    }
}


var destroyable = function(row, col) {
    // returns true if the tile at this position is destroyable

    // sanity checks
    if (row < 0 || row >= ROWS) { return false; }
    if (col < 0 || col >= COLS) { return false; }
    if (board[row][col] <= 0) { return false; } // either an empty space, or a bricked-up tile

    // include the tile itself
    var neighbors_horizontal = 1;
    var neighbors_vertical = 1;

    // for vertical, just count the height of the stack.
    for(var x=ROWS-1; x>=0; x--) {
        if (board[x][col] != 0) {
            neighbors_vertical = x+1;
            break;
        }
    }
    if (neighbors_vertical == board[row][col]) {
        return true;
    }

    jQuery.each([-1, 1], function(i, direction) {
        for(var x=direction; x<COLS; x += direction) {
            // fell off the edge of the board
            if (col+x >= COLS || col+x < 0) { break; }

            // no more neighbors on this side
            if (board[row][col+x] == 0) { break; }

            neighbors_horizontal++;
        }
    });
    if (neighbors_horizontal == board[row][col]) {
        return true;
    }

    return false;
}

var destroy_tiles = function(animate) {
    // destroys all tiles that need to be destroyed, as well as collapsing vertical gaps.
    // returns count of destroyed tiles
    if (typeof(animate) == undefined) { animate = false; }

    var destroyable_tiles = [];

    for(var row = 0; row < ROWS; row++) {
        for(var col = 0; col < COLS; col++) {
            if (destroyable(row, col)) {
                destroyable_tiles.push( { row: row, col: col, } );
            }
        }
    }

    // erase the tiles, dealing damage to neighbors
    jQuery.each( destroyable_tiles, function(i, tile) {
        board[tile.row][tile.col] = 0;
        damage_neighbors(tile.row, tile.col, animate);
    });

    return destroyable_tiles.length;
}

var collapse_gaps = function(animate) {
    // collapse any gaps in columns
    if (typeof(animate) == undefined) { animate = false; }

    var moves = 0;
    for(var col = 0; col < COLS; col++) {
        for(var row = 1; row < ROWS; row++) {
            if (board[row][col] != 0 && board[row-1][col] == 0) {
                // found a tile with an empty under it - swap places.
                board[row-1][col] = board[row][col];
                board[row][col] = 0;
                moves++;
            }
        }
    }

}

var damage_neighbors = function(row, col, animate) {
    if (typeof(animate) == undefined) { animate = false; }

    console.log("TODO: damage_neighbors(",row,col,")");
}
