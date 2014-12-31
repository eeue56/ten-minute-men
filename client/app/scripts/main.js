
// VERY IMPORTANT TO CHANGE THIS WITH THE CSS
var BOARD_MAX_WIDTH = 50;

var DEBUG = true; 

var debug = function(f){
    // TODO: add wrappers
    if (DEBUG){ 
        f(); 
    };
};


var assignFunctions = (function() {
    // TODO:
    //      Take classes from CSS to provide the classnames
    var _default = function(i, n, board){
        return "earth";
    };

    var island = function(i, n, board){
        if (calculations.isEdge(i, n)){
            return "water";
        }
        return "earth";
    };

    var edgy = function(i, n, board){
        if (calculations.isTopEdge(i, n)) return "water";
        if (calculations.isBottomEdge(i, n)) return "fire";
        if (calculations.isRightEdge(i, n)) return "grass";
        if (calculations.isLeftEdge(i, n)) return "stone";

        return "earth";
    };

    var paths = function(i, n, board){
        // assign all but last to water
        if (i < n - 1) return "water";

        // once everything else has been assigned, 
        // make a path
        var NUMBER_OF_PATHS = BOARD_MAX_WIDTH / 4;

        var exitNode = "water";

        for (var x = 0; x < NUMBER_OF_PATHS; x++){
            var node = parseInt(Math.random() * BOARD_MAX_WIDTH);

            while (true){
                board[node] = "fire";
                node = oneOf(calculations.neighbors(node, n), function(n){
                    return n > node;
                });

                if (board[node] === "fire" || calculations.isBottomEdge(node, n)){
                    // shortcut if node is last so that no painting
                    if (node === n - 1) exitNode = "fire";
                    
                    board[node] = "fire";
                    break;
                }
            }
        } 

        return exitNode;
    };

    var neighborsPaint = function(i, n, board){
        if (calculations.isEdge(i, n)){
            return "water";
        }

        var neighbors = calculations.neighbors(i, n);

        for (var x = 0; x < neighbors.length; x++){

            if (calculations.isEdge(neighbors[x], n)){
                return "fire";
            }
        }

        return "earth";
    };

    var pathPainter = function(i, n, board){
        var pieces = document.getElementsByClassName("selected-square");

        for (var x = 0; x < pieces.length; x++){
            if ("path-piece-" + i % BOARD_MAX_WIDTH === pieces[x].id){
                return "fire";
            }
        }

        return "water";
    };

    return {
        _default : _default,
        island : island,
        neighbors : neighborsPaint,
        edgy: edgy,
        paths: paths,
        pathPainter: pathPainter
    };
})();

// TODO: Move out
var calculations = (function(){
    var neighbors = function(i, n){
        var above = i - BOARD_MAX_WIDTH;
        var below = i + BOARD_MAX_WIDTH;

        var topLeft = above - 1,
            top = above,
            topRight = above + 1,
            left = i - 1,
            right = i + 1,
            bottomLeft = below - 1,
            bottom = below,
            bottomRight = below + 1;

        var neighbors = [
            topLeft, top, topRight, 
            left, right, 
            bottomLeft, bottom, bottomRight
        ];

        var remove = function(){
            var args = arguments;

            for (var i = 0; i < args.length; i++){
                var index = neighbors.indexOf(args[i]);
                neighbors.splice(index, 1); 
            }
        };

        if (isRightEdge(i, n)) remove(topRight, right, bottomRight);

        if (isLeftEdge(i, n)) remove(topLeft, left, bottomLeft);
        
        if (isTopEdge(i, n)) remove(topLeft, top, topRight);
        
        if (isBottomEdge(i, n)) remove(bottomLeft, bottom, bottomRight);
    

        return neighbors;
    };

    var isTopEdge = function(i, n){
        return i < BOARD_MAX_WIDTH;
    };

    var isRightEdge = function(i, n){
        return (i + 1) % BOARD_MAX_WIDTH === 0;
    };

    var isLeftEdge = function(i, n){
        return i % BOARD_MAX_WIDTH === 0;
    };

    var isBottomEdge = function(i, n){
        return i >= n - BOARD_MAX_WIDTH;
    };

    var isEdge = function(i, n){
        return (
            isTopEdge(i, n) || 
            isBottomEdge(i, n) ||
            isLeftEdge(i, n) ||
            isRightEdge(i, n)
        );   
    };

    return {
        neighbors: neighbors,
        isEdge: isEdge,
        isBottomEdge: isBottomEdge,
        isLeftEdge: isLeftEdge,
        isRightEdge: isRightEdge,
        isTopEdge: isTopEdge
    };
})();

// TODO: Move out
var board = (function(){
    var create = function(n, assign){
        if (assign === null || typeof assign === "undefined"){
            assign = assignFunctions._default;
        }

        var board = [];
        for (var i = 0; i < n; i++){
            board.push(
                assign(i, n, board)
            );
        }

        return board;
    };

    var updateClasses = function(board, assign){
        if (assign == null || typeof assign == undefined){
            assign = assignFunctions._default;
        }   

        var board = board;
        var n = board.length;
        for (var i = 0; i < n; i++){
            board[i] = assign(i, n, board);
        }
    };

    return {
        updateClasses: updateClasses,
        create: create
    };
})();



var init = function(){
    var _board = board.create(2500, assignFunctions.edgy);
    domOperations.board.push(_board);
    domOperations.board.update(_board);

    var paths = board.create(BOARD_MAX_WIDTH, assignFunctions._default);
    domOperations.paths.push(paths);

    // TODO: replace with nz
    domOperations.paths._painterElement.addEventListener("click", function(){
            var func = assignFunctions.pathPainter; 
            if (func){
                board.updateClasses(_board, func);
                domOperations.board.update(_board);
            }
        }   
    );

    // TODO: decide if this temp or perm
    debug(function() {

        var assignmentSelector = function() {
            var body = document.getElementsByTagName("body")[0];

            var master = document.createElement("div");
            master.className = "debug";

            var assignSelector = document.createElement("select");
            assignSelector.id = "assign-func"
            
            var assignText = document.createElement("div");
            assignText.contentEditable = true;

            domOperations.ui.pushAssigns(assignSelector, assignFunctions);

            master.appendChild(assignSelector);
            master.appendChild(assignText);

            assignSelector.addEventListener("change", function(){
                board.updateClasses(_board, assignFunctions[assignSelector.value]);
                domOperations.board.update(_board);
                assignText.innerHTML = assignFunctions[assignSelector.value];
            });



            body.appendChild(master);
        };

        assignmentSelector();

        domOperations.loadWatcher(window);
    });

}();
