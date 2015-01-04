var _p = function(collection, i){
    if (i === -1){
        return collection[collection.length - 1];
    }
    return collection[collection.length + i];
};

var lastChar = function(i){
    var i = i + "";
    return _p(i, -1);
};

var oneOf = function(collection, eq){
    if (typeof eq === "undefined" || eq === null){
        eq = function() { return true; }
    }

    var ones = [];

    for (var i = 0; i < collection.length; i++){
        if (eq(collection[i], i)){
            ones.push(collection[i]);
        }
    }
 
    return ones[parseInt(Math.random() * ones.length)];
};