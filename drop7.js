/*
TODO:
 - prevent player from clicking while a drop is happening




LOOP:
// drop tile
// loop:
//   destroy tiles
//   collapse tiles
// increment turn
// check for endgame
// create droptile


*/

ROWS = 7;
COLS = 7;
VALUES = 7;

ANIM_DROPTILE_HORIZONTAL = 33;
ANIM_DROPTILE_VERTICAL = 33;
ANIM_DESTROY = 500;

level = 1; // current level
turns = 5; // turns left on this level
score = 0; // user's current score

tiles = [];
board = new BOARD();
droptile = null;

function start_game() {
    // Populate the board with random tiles
    var tile_count = Math.floor(Math.random() * 25);

    for(var i=0; i<tile_count; i++) {
        var col = Math.floor(Math.random() * COLS);
        for(var row = 0; row < ROWS && board.val(row, col) != 0; row++);
        if (row == ROWS) { i--; tile_count--; continue; } // this column is full
        var val = Math.ceil(Math.random() * VALUES);
        board.addTile( new TILE(row, col, val) );
    }

    // destroy and collapse the tiles as necessary, if any are collapsible
    do {
        var destroyable = board.getDestroyableTiles();
        $.each(destroyable, function(i, tile) { tile.destroy(); } );
        var collapsible = board.getCollapsibleTiles();
        $.each(collapsible, function(i, tile) { tile.row -= tile.collapsible(); } );
    } while (destroyable.length > 0 || collapsible.length > 0);

    // draw the board
    board.draw();

    // create a tile that's ready to be dropped.
    create_droptile();
}

function create_droptile() {
    // create a tile that's ready to be dropped.
    droptile = new TILE(ROWS, Math.floor(COLS / 2), Math.ceil(Math.random() * VALUES));
    droptile.draw();

    // listen for user dropping
    allow_clicks();
}

function allow_clicks() {
    $('div.cell').on('click', drop);
}
function forbid_clicks() {
    $('div.cell').off('click');
}

function drop() {
    forbid_clicks();

    var col = $(this).data('col');
    var row = board.getColumnHeight(col);

    console.log("Player clicked on column", $(this).data('col'), 'will be shoving into', row);

    // is column full?
    if (row > ROWS) { allow_clicks(); return; }

    // Place droptile onto the board
    board.addTile(droptile);

    // animate droptile

    droptile.element
        .animate( { left: col * 31, }, ANIM_DROPTILE_HORIZONTAL * Math.abs(droptile.col - col))
        .animate( { bottom: row * 31, }, ANIM_DROPTILE_VERTICAL * Math.abs(droptile.row - row))
        .promise().done( function() {
            console.log("Done animating");
            droptile.row = row;
            droptile.col = col;

            destroy_tiles();
        });
}

function destroy_tiles(chain) {
    if (typeof(chain) == undefined) { chain = 1; }

    // destroy tiles
    var destroyable = board.getDestroyableTiles();
    var wait = $.Deferred();
    var destroyed = destroyable.length;

    console.log("There are", destroyable.length, "tiles waiting to be destroyed");

    wait.progress( function(notification) {
        console.log("Received notification! ", notification, destroyed);
        destroyed++;
        if (destroyed >= destroyable.length) {
            wait.resolve();
        }
    }).done( function() {
        // if there are any collapsible tiles, call collapse_tiles
        console.log("We are done destroying tiles");
        if (board.getCollapsibleTiles.length > 0) {
            collapse_tiles(chain+1);
        } else {
            increment_turn();
        }
    } );

    $.each(destroyable, function(i, tile) {
        // animate this tile's destruction
        tile.element
            .animate( { width: '+=10', height: '+=10', left: '-=5', bottom: '-=5', }, ANIM_DESTROY )
            .animate( { width: '-=10', height: '-=10', left: '+=5', bottom: '+=5', opacity: 0, }, ANIM_DESTROY )
            .promise()
            .done( function() {
                tile.destroy();

                // notify the Deferred object wait that we are done with a tile
                wait.notify("Hey, tile" + tile + " is done being destroyed now");

            } )

    });


}

function collapse_tiles(chain) {
    if (typeof(chain) == undefined) { chain = 1; }

    // collapse tiles

    // if there are any destroyable tiles, call destroy_tiles
    if (board.getDestroyableTiles.length > 0) {
        destroy_tiles(chain+1);
    } else {
        increment_turn();
    }
}

function increment_turn() {
    // TODO

    // increment turn
    // if end of level reached, increase level
    // check for endgame condition
    // create droptile
    create_droptile();
}







$(document).ready( function() {
    // create backdrop
    for(var row = ROWS-1; row >= 0; row--) {
        for(var col = 0; col < COLS; col++) {
            $('<div class="cell" data-col="'+col+'" data-row="'+row+'"></div>').appendTo("#board");
        }
    }

    start_game();
});
