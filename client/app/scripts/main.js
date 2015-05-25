
// VERY IMPORTANT TO CHANGE THIS WITH THE CSS
var BOARD_MAX_WIDTH = 50;
var NUMBER_OF_CELLS = BOARD_MAX_WIDTH * BOARD_MAX_WIDTH;

var DEBUG = true; 

var selected = [];

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

    var pixelPainter = function(i, n, board){
        if (i < n - 1) return "water";

        var pieces = Object.keys(selected);
        var exitNode = "water";

        for (var x = 0; x < pieces.length; x++){
            var id = parseInt(pieces[x], 10);
            board[id] = selected[pieces[x]];

            if (id === n - 1) exitNode = selected[pieces[x]];
        }
        return exitNode;

    };

    var combinedPainter = function(i, n, board){
        var pieces = document.getElementsByClassName("selected-square");

        for (var x = 0; x < pieces.length; x++){
            if ("path-piece-" + i % BOARD_MAX_WIDTH === pieces[x].id){
                return "fire";
            }
        }

        if (i < n - 1) return "water";

        var pieces = Object.keys(selected);
        var exitNode = "water";

        for (var x = 0; x < pieces.length; x++){
            var id = parseInt(pieces[x], 10);
            board[id] = selected[pieces[x]];

            if (id === n - 1) exitNode = selected[pieces[x]];
        }
        return exitNode;
    };

    var turtle = function(i, n, board){
        // TODO: Ew
        if (i < n - 1) return "water";

        var commands = document.getElementById("turtle-commands").value.trim();

        if (commands === null || commands.trim() === "") return "water";

        commands = commands.split("\n");
        var exitNode = "water";

        var boardProps = {
            color: "fire",
            node: 0,
            default_amount : 1,
            _last_command: null
        };

        var COMMANDS = {
            up: calculations.up,
            down: calculations.down,
            right: calculations.right,
            left: calculations.left,
            print: function(args) {
                var splittedArgs = args.split(" ");
                for (var i = 0; i < splittedArgs.length; i++){
                    var variable = splittedArgs[i].trim();
                    console.log(boardProps[variable]);
                }
            },
            paint: function(node) { 
                board[node] = boardProps.color; 
            },
            "with": function(args) {
                // TODO: for some reason this doesn't like the last one

                var splittedArgs = args.split(" ");
                var divs = document.querySelectorAll(splittedArgs[0]);

                for (var i = 0; i < divs.length; i++){
                    var id = divs[i].id.replace("board-", "");
                    COMMANDS.paint(parseInt(id));                }

            },
            "to-the-death": function(){
                while(!calculations.isBottomEdge(boardProps.node, n)){
                    console.log(boardProps.node, boardProps._last_command);

                    var r = COMMANDS[boardProps._last_command](boardProps.node, n);
                    if (r !== null){
                        boardProps.node = r;
                    }
                    COMMANDS.paint(boardProps.node);
                }
            },
            "one-of": function(args){
                if (args.split(" ")[0].trim() === "neighbors"){
                    return oneOf(calculations.neighbors(boardProps.node))
                }
            },
            set: function(args){
                // todo: add typing
                var variable = args.split(" ")[0].trim();
                var _value = args.split(" ")[1].trim();
                boardProps[variable] = _value;
            },
            ask: function(args){
                var who = args.split(" ")[0].trim();

                if (who === "neighbors"){
                    var neighbors = calculations.neighbors(boardProps.node, n);

                    for (var i = 0; i < neighbors.length; i++){
                        board[neighbors[i]] = boardProps.color;
                    }
                }
                else if (who === "one-of"){
                    var node = COMMANDS["one-of"]("neighbors");
                    board[node] = boardProps.color;
                }
            },
            reload : function(){
                board = Board.create(NUMBER_OF_CELLS, assignFunctions._default);
            },
            null: function(){}
        };

        for (var x = 0; x < commands.length; x++, boardProps._last_command = currentCommand){   

            // todo: urgh  
            boardProps.node = parseInt(boardProps.node, 10);       
            var currentCommand = commands[x].trim();

            if (currentCommand.indexOf("set") === 0){
                var args = currentCommand.replace("set ", "");
                COMMANDS["set"](args);
                continue;
            }

            if (currentCommand.indexOf("with") === 0){
                var args = currentCommand.replace("with ", "");
                COMMANDS["with"](args);
                continue;
            }


            if (currentCommand.indexOf("ask") === 0){
                var args = currentCommand.replace("ask ", "");
                COMMANDS["ask"](args);
                continue;
            }

            if (currentCommand.indexOf("print") === 0){
                var args = currentCommand.replace("print ", "");
                COMMANDS["print"](args);
                continue;
            }

            if (currentCommand.indexOf("reload") === 0){
                COMMANDS["reload"]();
                continue;
            }


            var amount = boardProps.default_amount;

            if (currentCommand.indexOf("*") > -1){
                amount = parseInt(currentCommand.split("*")[1].trim());
                currentCommand = currentCommand.split("*")[0].trim(); 
            }

            for (var _x = 0; _x < amount; _x++){
                board[boardProps.node] = boardProps.color;   
                console.log("d", currentCommand, "d");
                boardProps.node = COMMANDS[currentCommand](boardProps.node, n) || boardProps.node;
            }

        }

        return exitNode;
    };

    return {
        _default : _default,
        island : island,
        neighbors : neighborsPaint,
        edgy: edgy,
        paths: paths,
        pathPainter: pathPainter, 
        pixelPainter: pixelPainter,
        combinedPainter: combinedPainter,
        turtle: turtle
    };
})();

// TODO: Move out
var calculations = (function(){
    var up = function(i, n){
        return i - BOARD_MAX_WIDTH;
    };

    var down = function(i, n){
        return i + BOARD_MAX_WIDTH;
    };

    var right = function(i, n){
        return i + 1;
    };

    var left = function(i, n){
        return i - 1;
    };

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
        up: up,
        down: down,
        left: left,
        right: right,

        neighbors: neighbors,
        isEdge: isEdge,
        isBottomEdge: isBottomEdge,
        isLeftEdge: isLeftEdge,
        isRightEdge: isRightEdge,
        isTopEdge: isTopEdge
    };
})();

// TODO: Move out
var Board = (function(){
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


var app = function(){
    var board = Board.create(NUMBER_OF_CELLS, assignFunctions.edgy);
    domOperations.board.push(board);
    domOperations.board.update(board);

    var paths = Board.create(BOARD_MAX_WIDTH, assignFunctions._default);
    domOperations.paths.push(paths);



    var assignSelector = document.getElementById("assign-func");
    
    var assignText = document.getElementById("assign-func-text");

    domOperations.ui.pushAssigns(assignSelector, assignFunctions);

    var lastRepaint = null;

    var boardRepaint = function(){
        var func = assignFunctions[assignSelector.value]; 
        if (func){
            Board.updateClasses(board, func);
            domOperations.board.update(board);
        }
    };

    var setFuncText = function(){
        assignText.innerHTML = assignFunctions[assignSelector.value];
    }

    // TODO: replace with nz
    domOperations.paths._painterElement.addEventListener("click", boardRepaint);

    domOperations.board._boardElement.addEventListener("click", function(event_){
        var id = parseInt(event_.target.id.replace("board-", ""), 10);
        if (typeof selected[id] === "undefined"){
            selected[id] = "fire";
        } else {
            selected[id] = "water";
        }

        if (assignSelector.value === "pixelPainter" || 
            assignSelector.value === "combinedPainter") boardRepaint();
    });

    domOperations.nzLoader.register("show", function(){
        var condition = arguments[1];

        if (eval(condition)){
            domOperations.visiblity.show(arguments[0]);
        } else {
            domOperations.visiblity.hide(arguments[0]);
        };
    });

    domOperations.nzLoader.register("model", function(){
        var variable = arguments[1];
        var elm = arguments[0];

        var mutationCallback = function(){
            domOperations.nzLoader.trigger("show");
        };

        var allObserve = function(elm){
            var obs = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutationCallback();
                });    
            });

            var config = { 
                attributes: false, 
                childList: false, 
                characterData: true, 
                subtree: true
            };
            
            obs.observe(elm, config);
        };

        var selectObserve = function(elm){
            elm.addEventListener("change", function(event_){
                event_.preventDefault();
                mutationCallback();
            });
        };

        if (elm.tagName === "SELECT"){
            selectObserve(elm);
        } else {
            allObserve(elm);
        }

    });

    domOperations.nzLoader.run();

    return {
        repaint: boardRepaint,
        setFuncText: setFuncText
    };
}();

domOperations.loadWatcher(window);