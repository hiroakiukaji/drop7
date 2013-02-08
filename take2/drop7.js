/*
TODO:
 - the destroy-collapse cycle happens instantly, instead of waiting for things to animate out of hte way
 - the droptile reaction should be WAY faster




*/

ROWS = 7;
COLS = 7;
DESTROY_DURATION = 400;
COLLAPSE_ANIMATION = 1000;
ANIMATE = false;

LEVEL = 1; // current level
TURNS = 5; // turns left on this level
SCORE = 0; // user's current score


window.TILE = function(row, col, value) {
    this.row = row;
    this.col = col;
    this.value = value;
    this.element = $('<div class="tile"></div>');
    this.destroyed = false;
}
TILE.prototype = {
    destroy: function() {
        // damage nearby neighbors
        var _this = this;
        var damageable_neighbors = jQuery.grep(tiles, function(tile) {
            if (tile.value >= 0) { return false; }
            return (tile.row == _this.row && (tile.col == _this.col+1 || tile.col == _this.col-1) )
                || (tile.col == _this.col && (tile.row == _this.row+1 || tile.row == _this.row-1) );
        } );
        jQuery.each(damageable_neighbors, function(i, tile) {
            tile.damage();
        });

        if (!ANIMATE) {
            this.element.detach();
        } else {
            this.element.fadeOut(DESTROY_DURATION, function() { $(this).detach(); } );
        }

        this.destroyed = true;
    },

    damage: function() {
        if (this.value == -1) {
            // break it open, revealing random value
            this.value = Math.ceil(Math.random() * 7);
        }
        if (this.value == -2) {
            this.value = -1;
        } // crack it

        if (ANIMATE) {
            this.draw();
        }

    },

    draw: function() {
        this.element.attr('class', 'tile') // remove any other tile classes
            .addClass("tile" + this.value) // set current class
            .css('left', this.col * 31)    // position tile
            .css('bottom', this.row * 31); // position tile

        // if necessary, put tile on the board.
        if (this.element.parent("#board").length == 0) {
            this.element.appendTo("#board");
        }
    },

    collapse: function() {
        // if there are any empty cells under this tile, move this tile that many places down.
        var _this = this;

        var downstairs_neighbors = jQuery.grep(tiles, function(tile) { return tile.col == _this.col && tile.row < _this.row; });
        if (this.row > downstairs_neighbors.length) {
            var new_row = downstairs_neighbors.length;

            if (!ANIMATE) {
                this.row = new_row;
            } else {
                this.element.animate( { bottom: new_row * 31, },
                                      COLLAPSE_ANIMATION,
                                      function() { _this.row = new_row; } );
            }
        }
    },

    destroyable: function() {
        // returns true if tile is destroyable, false otherwise.

        // include the tile itself
        var neighbors_horizontal = 1;
        var neighbors_vertical = 1;
        var _this = this;

        // to count vertical neighbors, just count the number of tiles in the column
        jQuery.each(tiles, function(i, tile) {
            if (tile.row == _this.row && tile.col == _this.col) { return; } // we're looking at this tile
            if (tile.col == _this.col) { neighbors_vertical++; }
        });

        if (neighbors_vertical == this.value) {
            return true;
        }

        // to count horizontal neighbors, scan to the right and left until we hit a zero or go off the board
        for(var col = this.col+1; col < COLS; col++) {
            var matches = jQuery.grep(tiles, function(tile) { return tile.col == col && tile.row == _this.row; } );
            if (matches.length == 0) { break; } // hit a zero
            neighbors_horizontal++;
        }
        for(var col = this.col-1; col >= 0; col--) {
            var matches = jQuery.grep(tiles, function(tile) { return tile.col == col && tile.row == _this.row; } );
            if (matches.length == 0) { break; } // hit a zero
            neighbors_horizontal++;
        }

        if (neighbors_horizontal == this.value) {
            return true;
        }

        return false;
    },

    toString: function() {
        return 'tile[' + this.row + ',' + this.col + '](' + this.value + ')';
    },

};


tiles = [];

var start_game = function() {
    tiles = [];
    for(var col = 0; col < COLS; col++) {
        var row = 0;
        while( Math.random() < 0.5 ) {
            var tile = new TILE(row++, col, Math.ceil(Math.random() * 7));
            tiles.push(tile);
        }
    }

    // Now, since this was randomly generated, it's possible that some of these tiles are destroyable
    // so let's do that before the user sees them.
    do {
        destroyable = destroy_tiles();
        collapse_board();
    } while (destroyable.length > 0);

    // draw everything on the board
    jQuery("div.tile").remove();
    jQuery.each(tiles, function(i, tile) {
        tile.draw();
    });

    poop_tile();
}

var collapse_board = function() {
    jQuery.each(tiles, function(i, tile) { tile.collapse(); } );
}

var destroy_tiles = function() {
    // find destroyable tiles
    destroyable = jQuery.grep(tiles, function(tile) { return tile.destroyable(); } );

    // destroy destroyable tiles
    jQuery.each(destroyable, function(i, tile) { tile.destroy(); } );

    // update list of tiles
    tiles = jQuery.grep(tiles, function(tile) { return !tile.destroyed; } );

    return destroyable;
}

var poop_tile = function() {
    // poop out a tile for us to drop

    droptile = new TILE(7, 3, (Math.ceil(Math.random() * 7)));
    droptile.draw();
}

var drop = function(col) {
    // decrement TURNS by 1, and style
    TURNS--;
    $("#turns span").css("color", "#606060");
    $("#turns span:lt(" + TURNS + ")").css("color", "#ffffff");

    var downstairs_neighbors = jQuery.grep(tiles, function(tile) { return tile.col == col; });
    var row = downstairs_neighbors.length;

    // move the dropslot tile to the correct column
    console.log("Animating column move");
    droptile.element.animate( { left: col * 31 }, COLLAPSE_ANIMATION, function() {
        console.log("Animating drop");
        droptile.element.animate( { bottom: row * 31 }, COLLAPSE_ANIMATION, function() {
            droptile.col = col;
            droptile.row = row;
            tiles.push(droptile);

            console.log("Calculating destruction");
            do {
                destroyable = destroy_tiles();
                collapse_board();
            } while (destroyable.length > 0);

            poop_tile();

        });
    });

    // drop the dropslot down to the first unoccupied space


    // if turns is zero: increment level by one, and add new row of unbroken tiles, pushing the reset up one.
    if (TURNS == 0) {
        LEVEL++;
        TURNS = 5;
    }

    // Update
    $("#turns span").css("color", "#606060");
    $("#turns span:lt(" + TURNS + ")").css("color", "#ffffff");

    $("#level").text("LEVEL " + LEVEL);
}

$(document).ready( function() {

    // create backdrop
    for(var row = ROWS-1; row >= 0; row--) {
        for(var col = 0; col < COLS; col++) {
            $('<div class="cell" data-col="'+col+'" data-row="'+row+'"></div>').appendTo("#board");
        }
    }

    // attach listeners
    $("div.cell").on('click', function() {
        drop( $(this).data('col') );
    });

    // make rocket go now
    start_game();
});
