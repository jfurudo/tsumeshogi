var is_allay = function(value) {
    return value && 
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        typeof value.splice === 'function' &&
        !(value.propertyIsEnumerable('length'));
};
// type = 'full' or 'kanji'
var castNum = function (a, type) {
    return type === 'full' ? "０１２３４５６７８９"[a] : "零一二三四五六七八九"[a];
};
var piecesData = {
    "_fu": {alt: "歩", src: "/images/_fu.png"},
    "_kyo": {alt: "香", src: "/images/_kyo.png"},
    "_kei": {alt: "桂", src: "/images/_kei.png"},
    "_gin": {alt: "銀", src: "/images/_gin.png"},
    "_kin": {alt: "金", src: "/images/_kin.png"},
    "_kaku": {alt: "角", src: "/images/_kaku.png"},
    "_hisha": {alt: "飛", src: "/images/_hisha.png"},
    "_oh": {alt: "王", src: "/images/_oh.png"},
    "_to": {alt: "と", src: "/images/_to.png"},
    "_nkyo": {alt: "金", src: "/images/_nkyo.png"},
    "_nkei": {alt: "金", src: "/images/_nkei.png"},
    "_ngin": {alt: "金", src: "/images/_ngin.png"},
    "_uma": {alt: "馬", src: "/images/_uma.png"},
    "_ryu": {alt: "龍", src: "/images/_ryu.png"},
    "fu": {alt: "歩", src: "/images/fu.png"},
    "kyo": {alt: "香", src: "/images/kyo.png"},
    "kei": {alt: "桂", src: "/images/kei.png"},
    "gin": {alt: "銀", src: "/images/gin.png"},
    "kin": {alt: "金", src: "/images/kin.png"},
    "kaku": {alt: "角", src: "/images/kaku.png"},
    "hisha": {alt: "飛", src: "/images/hisha.png"},
    "oh": {alt: "王", src: "/images/oh.png"},
    "to": {alt: "と", src: "/images/to.png"},
    "nkyo": {alt: "金", src: "/images/nkyo.png"},
    "nkei": {alt: "金", src: "/images/nkei.png"},
    "ngin": {alt: "金", src: "/images/ngin.png"},
    "uma": {alt: "馬", src: "/images/uma.png"},
    "ryu": {alt: "龍", src: "/images/ryu.png"},
    "empty": {alt: "空", src: "/images/empty.gif"}
};
var board;
var mode = 'tsume';
var turn = 1; // 1: 先手番 -1: 後手番
var boardState = 'default';
var selected;
var stockPid = null;
var teban = 1; // sente: 1, gote: -1

var initPos = {};

var shogi = logicalShogi().create();
board = {};
var shogiNum = function(i, j) {
    return (i == -1 && j == 9) ? "" : i === -1 ? castNum(9-j, 'full') : castNum(i+1, 'kanij');
};
$(function() {
    for (var i = -1; i<9; i++) {
        for (var j = 0; j<10; j++) {
            var value;
            if (i == -1 || j == 9) {
                value = $("<div/>");
                value.html(shogiNum(i, j));
                value.addClass("rulerCell");
            } else {
                var key = JSON.stringify(logicalShogi().decord({x: i, y: j}));
                value = $("<img/>");
                value.addClass("square");
                value.attr("place", key);
                value.click(squareClicked);
                board[key] = value;
            }
            $('#board').append(value);
        }
    }
    shogi.init(initPos.places, initPos.stocks);
    refresh();

    $("#undo").click(function() {        
        if (!shogi.wait()) alert("これ以上戻れねぇよアホ");
        refresh();
    });

    $('.stock').click(stockContainerClicked);

    $('#submit').click(function() {
        $('#place').val(JSON.stringify(shogi.getPos()));
    });

    $('#cli').change(function(e) {
        if (this.value.match(/[1-9][1-9]_?[a-z][a-z]+(\ u)?/)) {
            //         console.log(this.value.match(/_?[a-z][a-z]+$/)[0]);
            console.log(this.value.match(/[a-z][a-z]+/)[0]);
            console.log(this.value.match(/[1-9][1-9]_?[a-z][a-z]+(\ u)?/)[0]);
            var pid = ((shogi.getTurn() == -1) ? "_" : "") + this.value.match(/[a-z][a-z]+/)[0];
            if (this.value.match(/\ u/)) {
                console.log(pid);
                shogi.utsu(Number(this.value[0]),Number(this.value[1]), pid);
            } else {
                console.log(pid);
                shogi.moveOnlyTarge([Number(this.value[0]),Number(this.value[1]), pid]);
            }
            this.value = '';
            $(this).blur();
            init();
        } else {
            console.log("format error");
        }
    });
});

var updateStock = function() {
    var stocks = shogi.getStock();
    _.each(stocks, function(stock, teban) {
        $('#'+teban).empty();
        _.each(stock, function(pid) {
            $('#'+teban).append($('<img/>').css({height: 30, width: 30}).attr(piecesData[pid]).attr('pid', pid).addClass("stock").click(stockClicked));
        });
    });
};

var init = function() {
    _.each(board, function (square) {
        square.attr(piecesData[shogi.getPidByPlace(JSON.parse(square.attr('place')))]);
    });
    updateStock();
    $("#logger").html(shogi.getKifu);
    $('#cli').focus();
};
var refresh = function (){
    _.each(board, function (square) {
        square.attr(piecesData[shogi.getPidByPlace(JSON.parse(square.attr('place')))]);
    });
    updateStock();
    $("#logger").html(shogi.getKifu);
    $('#cli').focus();
    moveCancel();
};
var putPieces = function(pieces) {
    if (arguments.length == 3) {
        var p = {place: {}};
        p.place.x = arguments[0];
        p.place.y = arguments[1];
        p.pid = arguments[2];
        pieces = p;
    };
    if (is_allay(pieces)) {
        _.each(pieces, function(piece) {
            putPieces(piece);
        });
    } else {
        board[JSON.stringify(pieces.place)].attr(piecesData[pieces.pid]);
        if (pieces.utsu) {
            console.log(pieces);
            shogi.utsu(pieces.place.x, pieces.place.y, pieces.pid);
            refresh();
        } else {
            shogi.putPiece(pieces);
        }
    }
};

var stockClicked = function() {
    console.log(boardState);
    if (boardState == 'selected') {
        moveCancel();
        boardState = 'default';
    } else {
        var puttable = shogi.puttable($(this).attr('pid'));
        if (puttable.length) {
            _.each(puttable, function(place) {
                board[JSON.stringify(place)].addClass('puttable');
            });
            stockPid = $(this).attr('pid');
            boardState = 'selected';
        }
    }
};

var squareClicked = function() {
    if (mode == "tsume" || mode == "play") {
        if (teban != shogi.getTurn() && mode == "play") return;
        if (boardState == 'default') {
            var movablePlaces = shogi.movable(JSON.parse($(this).attr('place')));
            if (movablePlaces.length) {
                _.each(movablePlaces, function(place) {
                    board[JSON.stringify(place)].addClass('movable');
                });
                selected = $(this);
                boardState = 'selected';
            }
        } else if (boardState == 'selected') {
            if ($(this).hasClass('puttable')) {
                console.log($(this).attr('pid'));
                putPieces({place: JSON.parse($(this).attr('place')), pid: stockPid, utsu: true});
            }
            if ($(this).hasClass('movable')) {
                var nari = false;
                if (shogi.nareru(JSON.parse(selected.attr('place')), JSON.parse($(this).attr('place')))) {
                    nari = confirm("成りますか？");
                };
                shogi.move(JSON.parse(selected.attr('place')), JSON.parse($(this).attr('place')), nari);
                refresh();
                if (mode == "play") {
                    var move = "shogi.move(" + selected.attr('place') + ", " + $(this).attr('place') + ", " + nari + ");";
                    console.log("shogi.move(" + selected.attr('place') + ", " + $(this).attr('place') + ", " + nari + ");");
                    var obj = {seq: 0, max: 0, message: move};
                    pci.dc.send(JSON.stringify(obj));
                }
            }
            moveCancel();
            boardState = 'default';
        }
    } else if (mode == 'create') {
        if (boardState == 'default') {
            $(this).addClass('selected');
            selected = $(this);
            _.each(board, function(square) {
                square.addClass('puttable');
            });
            boardState = 'selected';
        } else if (boardState == 'selected') {
            if ($(this).hasClass('puttable')) {
                var target = {};
                target.place = JSON.parse($(this).attr('place'));
                target.pid = selected.attr('pid');
                shogi.putPiece(target);
            } else {
            }
            selected.removeClass('selected');
            refresh();
            boardState = 'default';
        }
    }
};

var stockContainerClicked = function() {
    if (mode == 'create' && boardState =='selected') {
        var teban = selected.attr('pid').match(/_/) ? 'gote' : 'sente';
        if ($(this).attr('id') == teban) {
            shogi.setStock(teban, selected.attr('pid'));
            refresh();
            selected.removeClass('selected');
            boardState = 'default';
        }
    }
};

var moveCancel = function() {
    _.each(board, function(square) {
        if(square.hasClass('movable')) {
            square.removeClass('movable');
        } else if (square.hasClass('puttable')) {
            square.removeClass('puttable');
        }
    });
};

var createrMenu = function() {
    _.each(piecesData, function(piece, pid) {
        var img = $("<img/>");
        img.addClass("square");
        img.attr(piece);
        img.attr('pid', pid);
        img.click(squareClicked);
        $('#pieceList').append(img);
    });
    $('#pieceList').append($("<button/>").click(function() {shogi.init([]);refresh();}).html("初期化"));
    $('#pieceList').append($("<button/>").click(function() {mode = 'tsume';}).html("試す"));
    $('#createrMenu').show();
};

var test = function() {
    var ret = {};
    ret.nari = function() {
        var shogi = logicalShogi().create();
        shogi.init([{place: {x: 4, y: 4}, pid: 'fu'}, {place: {x: 7, y: 6}, pid: '_fu'}]);
        shogi.move({x: 4, y: 4}, {x: 4, y: 3});
        shogi.move({x: 7, y: 6}, {x: 7, y: 7});
        shogi.show();
        console.log("先手: " + (shogi.getIdByPlace({x: 4, y: 3}) == 11 ? "SUCCESS!" : "ERROR!"));
        console.log("後手: " + (shogi.getIdByPlace({x: 7, y: 7}) == -11 ? "SUCCESS!" : "ERROR!"));
    };
    ret.toru = function() {
        var shogi = logicalShogi().create();
        shogi.init([{place: {x: 4, y: 6}, pid: 'fu'}, {place: {x: 4, y: 5}, pid: '_fu'}, {place: {x: 4, y: 4}, pid: '_fu'}, {place: {x: 4, y: 3}, pid: '_fu'}, {place: {x: 3, y: 2}, pid: '_fu'}]);
        shogi.move({x: 4, y: 6}, {x: 4, y: 5});
        shogi.move({x: 4, y: 4}, {x: 4, y: 5});
        shogi.show();
        shogi.showStock();
    };
    ret.kyo = function() {
        var shogi = logicalShogi().create();
        shogi.init([{place: {x: 9, y: 9}, pid: 'kyo'}]);
        shogi.movable({x: 9, y: 9});
        shogi.show();
    };
    ret.create = function() {
        var shogi = logicalShogi().create();
        shogi.init([]);
        shogi.putPiece([[1,2,'kyo'],[2,3,'_kei']]);
        shogi.setStock("sente", 'kyo');
        shogi.setStock("sente", 'ryu');
        console.log(JSON.stringify(shogi.getPos()));
    };
    return ret;
};
