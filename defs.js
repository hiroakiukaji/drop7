TILE = function(row, col, val) {
    this.row = row;
    this.col = col;
    this.val = val;
    this.element = $('<div class="tile"></div>').data( { row: row, col: col, val: val, } );
    this.destroyed = false;
};
TILE.prototype = {
    toString: function() {
        return "[" + this.val + " @ " + this.row + "," + this.col + "]";
    },
    draw: function() {
        // draw a tile on the board
        this.element.attr("class", "tile") // remove any other classes
            .addClass("tile" + this.val)
            .css("left", this.col * 31)
            .css("bottom", this.row * 31)
            .appendTo("#board");
    },
    destroyable: function() {
        // returns true if tile is eligible for destruction
        var _this = this;

        if (board.getColumnHeight(this.col) == this.val) {
            // column's height is equal to this tile's value - destroy!
            return true;
        }

        // calculating horizontal values is harder, since htey don't collapse in any given direction
        // to count horizontal neighbors, scan to the right and left until we hit a zero or go off the board
        var neighbors_horizontal = 1;
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

        if (neighbors_horizontal == this.val) {
            return true;
        }
        return false;
    },
    collapsible: function() {
        // returns number of slots this tile can drop down
        zeros = 0;
        for(var row = this.row - 1; row >= 0; row--) {
            if (board.val(row, this.col) == 0) {
                zeros++;
            }
        }
        return zeros;
    },
    destroy: function() {
        var _this = this;

        // damage any nearby tiles
        var neighbors = $.grep(tiles, function(tile) {
            var neighbor = (tile.row == _this.row && (tile.col == _this.col+1 || tile.col == _this.col-1))
                || (tile.col == _this.col && (tile.row == _this.row+1 || tile.row == _this.row-1));
            var destructable = tile.val < 0;
            return neighbor && destructable;
        });

        $.each(neighbors, function(i, tile) {
            if (tile.val == -2) {
                tile.val = -1;
            } else if (tile.val == -1) {
                tile.val = Math.ceil(Math.random() * VALUES);
            }
            tile.draw();
            tile.update();
        });

        tiles = $.grep(tiles, function(tile) { return tile !== _this; } );
    },
    update: function() {
        this.element.data( { row: this.row, col: this.col, } );
    },
};

BOARD = function() { };
BOARD.prototype = {
    val: function(row, col) {
        var t = $.grep(tiles, function(tile) { return tile.row == row && tile.col == col; } );
        if (t.length == 0) { return 0; } // no tile at this position
        return t[0].val;
    },
    addTile: function(tile) {
        tiles.push(tile);
    },
    getColumnHeight: function(col) {
        return $.grep(tiles, function(tile) { return tile.col == col; }).length;
    },
    draw: function() {
        $("#board > div.tile").remove();
        $.each(tiles, function(i, tile) { tile.draw(); });
    },
    getDestroyableTiles: function() {
        return $.grep(tiles, function(tile) { return tile.destroyable(); } );
    },
    getCollapsibleTiles: function() {
        // returns array of tiles that can be dropped down
        return $.grep(tiles, function(tile) { return tile.collapsible() > 0; } );
    },
};

