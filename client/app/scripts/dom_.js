// TODO: move nz out
var domOperations = (function(){

    var empty = function(node){
        while(node.firstChild){
            node.removeChild(node.firstChild);
        }
    };

    var trigger = function(node, eventName){
        if (document.createEvent) {
            var event_ = new Event(eventName);
            node.dispatchEvent(event_);

          } else {
            var event_ = document.createEventObject();
            event_.eventType = eventName;
            event_.eventName = eventName;

            node.fireEvent("on" + event_.eventType, event_);
        }
    };

    var visiblity = function(){
        var HIDDEN_CLASS = "hidden";
        var show = function(node){
            classes.remove(node, HIDDEN_CLASS);
        };

        var hide = function(node){
            classes.add(node, HIDDEN_CLASS);
        };

        var toggle = function(node){
            classes.toggle(node, HIDDEN_CLASS);
        };

        return {
            show: show,
            hide: hide,
            toggle: toggle
        };
    }();

    var classes = (function(){

        var set = function(node, className){
            node.className = className;
        };

        var add = function(node, className){
            if (node.className.indexOf(className) > -1) return;

            if (node.className === "") {
                set(node, className);
            } else{
                node.className += " " + className;
            }
        };

        var remove = function(node, className){
            node.className = node.className.replace(className, "");
        };

        var toggle = function(node, className){
            if (node.className.indexOf(className) > -1){
                remove(node, className);
            } else{
                add(node, className);
            }
        };

        return {
            add: add,
            set: set,
            remove: remove,
            toggle: toggle
        };
    })();


    var ui = (function(){
        var pushAssigns = function(node, assigns) {
            empty(node);

            var keys = Object.keys(assigns);

            for (var i = 0; i < keys.length; i++){
                var elm = document.createElement("option");
                elm.innerHTML = keys[i];
                node.appendChild(elm);
            }
        };

        var selectedAssign = function(){
            return document.getElementById("assign-func").value;
        };

        return {
            pushAssigns: pushAssigns,
            selectedAssign: selectedAssign
        };
    })();

    var board = (function(){
        var boardElement = document.getElementById("board");


        var push = function(board){
            empty(boardElement);

            for (var i = 0; i < board.length; i++){
                var elm = document.createElement("div");
                elm.id = "board-" + i;
                classes.add(elm, board[i]);
                boardElement.appendChild(elm);
            }
        };

        var update = function(board){
            for (var i = 0; i < board.length; i++){
                var elm = document.getElementById("board-" + i);
                classes.set(elm, board[i]);
            }
        };

        return {
            update: update,
            push: push
        };
    })();

    var pathPainter = (function(){
        var pathPainterElement = document.getElementById("path-painter");


        var push = function(board){
            empty(pathPainterElement);

            for (var i = 0; i < board.length; i++){
                var elm = document.createElement("div");
                elm.id = "path-piece-" + i;
                classes.set(elm, board[i]);

                elm.addEventListener("click", function(){
                    classes.toggle(this, "selected-square");
                });

                pathPainterElement.appendChild(elm);
            }
        };

        var update = function(board){
            for (var i = 0; i < board.length; i++){
                var elm = document.getElementById("path-piece-" + i);
                classes.set(elm, board[i]);
            }
        };

        return {
            update: update,
            push: push,
            _painterElement : pathPainterElement
        };
    })();

    // TODO: make this more generic
    // Attribute regex?
    var loadWatcher = function(window){
        var save = function(elm){
            var watch = elm.attributes["nz-watch"].value;
            var event_ = elm.attributes["nz-what"].value || "change";
            var condition = elm.attributes['nz-show'].value || true;

            var thingy = window[watch] || document.getElementById(watch);

            thingy.addEventListener(event_, function(){
                if (eval(condition)){
                    domOperations.visiblity.show(elm);    
                } else {
                   domOperations.visiblity.hide(elm);
                }
            });

            trigger(thingy, event_);
        };

        var nodes = document.querySelectorAll("[nz-show]");
        for (var i = 0; i < nodes.length; i++){
            save(nodes[i]);
        }
    };

    return {
        board: board,
        ui: ui,
        paths: pathPainter,
        visiblity: visiblity,
        loadWatcher: loadWatcher
    };
})();