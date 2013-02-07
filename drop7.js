ROWS = 7;
COLS = 7;
DESTROY_DURATION = 400;
COLLAPSE_ANIMATION = 1000;

window.TILE = function(row, col, value) {
    this.row = row;
    this.col = col;
    this.value = value;
    this.element = $('<div class="tile"></div>');
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

        this.element.fadeOut(DESTROY_DURATION, function() { $(this).detach(); } );
    },

    damage: function() {
        if (this.value == -1) {
            // break it open, revealing random value
            this.value = Math.ceil(Math.random() * 7);
        }
        if (this.value == -2) { this.value = -1; } // crack it
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
        console.log("DS:",downstairs_neighbors);
        if (this.row >= downstairs_neighbors.length) {
            var new_row = this.row - downstairs_neighbors.length;
            this.element.animate( { bottom: new_row * 31, },
                                  COLLAPSE_ANIMATION,
                                  function() {
                                      _this.row = new_row;
                                  } );
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


var populate_board = function() {
    tiles = [];
    for(var col = 0; col < COLS; col++) {
        var row = 0;
        while( Math.random() < 0.5 ) {
            var tile = new TILE(row++, col, Math.ceil(Math.random() * 7));
            tiles.push(tile);
        }
    }
}

var draw_board = function() {
    jQuery("div.tile").remove();
    jQuery.each(tiles, function(i, tile) {
        tile.draw();
    });
}

