Array.prototype.copy = function () {
	var ret = [];
	for (var i = 0; i < this.length; i++) {
		ret[i] = [];
		for (var j = 0; j < this[i].length; j++){
			ret[i][j] = this[i][j];
		}
	}
	return ret;
};
Array.prototype.contains = function (place) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].x == place.x && this[i].y == place.y)
            return true;
    }
    return false;
};

var logicalShogi = function() {
    var size = 9;
    var ret = {};
    var correspond = {
        _fu: -1, _kyo: -2, _kei: -3, _gin: -4, _kin: -5, _kaku: -6, _hisha: -7, _oh: -8,
        _to: -11, _nkyo: -12, _nkei: -13, _ngin: -14, _uma: -16, _ryu: -17, empty: 0,
        fu: 1, kyo: 2, kei: 3, gin: 4, kin: 5, kaku: 6, hisha: 7, oh: 8,
        to: 11, nkyo: 12, nkei: 13, ngin: 14, uma: 16, ryu: 17
    };
    var pieces = {
        "-1": {pid: "_fu", name: "歩", nari: -1, move: { place: [{x:1, y:0}]}},
        "-2": {pid: "_kyo", name: "香", nari: -1, move: { dir: [{x:1, y:0}]}},
        "-3": {pid: "_kei", name: "桂", nari: -1, move: { place: [{x:2, y:1},{x:2, y:-1}]}},
        "-4": {pid: "_gin", name: "銀", nari: -1, move: { place: [{x:-1, y:1},{x:1, y:1},{x:1, y:0},{x:1, y:-1},{x:-1, y:-1}]}},
        "-5": {pid: "_kin", name: "金", nari: 0, move: { place: [{x:-1, y:0},{x:0, y:1},{x:1, y:1},{x:1, y:0},{x:1, y:-1},{x:0, y:-1}]}},
        "-6": {pid: "_kaku", name: "角", nari: -1, move: { dir: [{x:-1, y:1},{x:1, y:1},{x:1, y:-1},{x:-1, y:-1}]}},
        "-7": {pid: "_hisha", name: "飛", nari: -1, move: { dir: [{x:-1, y:0},{x:0, y:1},{x:1, y:0},{x:0, y:-1}]}},
        "-8": {pid: "_oh", name: "王", nari: 0, move: { place: [{x:-1, y:0},{x:-1, y:1},{x:0, y:1},{x:1, y:1},{x:1, y:0},{x:1, y:-1},{x:0, y:-1},{x:-1, y:-1}]}},
        "-11": {pid: "_to", name: "と", nari: 0, move: { place: [{x:-1, y:0},{x:0, y:1},{x:1, y:1},{x:1, y:0},{x:1, y:-1},{x:0, y:-1}]}},
        "-12": {pid: "_nkyo", name: "金", nari: 0, move: { place: [{x:-1, y:0},{x:0, y:1},{x:1, y:1},{x:1, y:0},{x:1, y:-1},{x:0, y:-1}]}},
        "-13": {pid: "_nkei", name: "金", nari: 0, move: { place: [{x:-1, y:0},{x:0, y:1},{x:1, y:1},{x:1, y:0},{x:1, y:-1},{x:0, y:-1}]}},
        "-14": {pid: "_ngin", name: "金", nari: 0, move: { place: [{x:-1, y:0},{x:0, y:1},{x:1, y:1},{x:1, y:0},{x:1, y:-1},{x:0, y:-1}]}},
        "-16": {pid: "_uma", name: "馬", nari: 0, move: { place: [{x:-1, y:0},{x:0, y:1},{x:1, y:0},{x:0, y:-1}], dir: [{x:-1, y:1},{x:1, y:1},{x:1, y:-1},{x:-1, y:-1}]}},
        "-17": {pid: "_ryu", name: "龍", nari: 0, move: { place: [{x:-1, y:1},{x:1, y:1},{x:1, y:-1},{x:-1, y:-1}], dir: [{x:-1, y:0},{x:0, y:1},{x:1, y:0},{x:0, y:-1}]}},
        "1": {pid: "fu", name: "歩", nari: 1, move: { place: [{x:-1, y:0}]}},
        "2": {pid: "kyo", name: "香", nari: 1, move: { dir: [{x:-1, y:0}]}},
        "3": {pid: "kei", name: "桂", nari: 1, move: { place: [{x:-2, y:1},{x:-2, y:-1}]}},
        "4": {pid: "gin", name: "銀", nari: 1, move: { place: [{x:-1, y:0},{x:-1, y:1},{x:1, y:1},{x:1, y:-1},{x:-1, y:-1}]}},
        "5": {pid: "kin", name: "金", nari: 0, move: { place: [{x:-1, y:0},{x:-1, y:1},{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:-1}]}},
        "6": {pid: "kaku", name: "角", nari: 1, move: { dir: [{x:-1, y:1},{x:1, y:1},{x:1, y:-1},{x:-1, y:-1}]}},
        "7": {pid: "hisha", name: "飛", nari: 1, move: { dir: [{x:-1, y:0},{x:0, y:1},{x:1, y:0},{x:0, y:-1}]}},
        "8": {pid: "oh", name: "王", nari: 0, move: { place: [{x:-1, y:0},{x:-1, y:1},{x:0, y:1},{x:1, y:1},{x:1, y:0},{x:1, y:-1},{x:0, y:-1},{x:-1, y:-1}]}},
        "11": {pid: "to", name: "と", nari: 0, move: { place: [{x:-1, y:0},{x:-1, y:1},{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:-1}]}},
        "12": {pid: "nkyo", name: "金", nari: 0, move: { place: [{x:-1, y:0},{x:-1, y:1},{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:-1}]}},
        "13": {pid: "nkei", name: "金", nari: 0, move: { place: [{x:-1, y:0},{x:-1, y:1},{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:-1}]}},
        "14": {pid: "ngin", name: "金", nari: 0, move: { place: [{x:-1, y:0},{x:-1, y:1},{x:0, y:1},{x:1, y:0},{x:0, y:-1},{x:-1, y:-1}]}},
        "16": {pid: "uma", name: "馬", nari: 0, move: { place: [{x:-1, y:0},{x:0, y:1},{x:1, y:0},{x:0, y:-1}], dir: [{x:-1, y:1},{x:1, y:1},{x:1, y:-1},{x:-1, y:-1}]}},
        "17": {pid: "ryu", name: "龍", nari: 0, move: { place: [{x:-1, y:1},{x:1, y:1},{x:1, y:-1},{x:-1, y:-1}], dir: [{x:-1, y:0},{x:0, y:1},{x:1, y:0},{x:0, y:-1}]}},
        "0": {pid: "empty", name: "ー"}
    };
    var initPieces = [
        [1,1,'_kyo'],[2,1,'_kei'],[3,1,'_gin'],[4,1,'_kin'],[5,1,'_oh'],[6,1,'_kin'],[7,1,'_gin'],[8,1,'_kei'],[9,1,'_kyo'],
        [2,2,'_kaku'],[8,2,'_hisha'],
        [1,3,'_fu'],[2,3,'_fu'],[3,3,'_fu'],[4,3,'_fu'],[5,3,'_fu'],[6,3,'_fu'],[7,3,'_fu'],[8,3,'_fu'],[9,3,'_fu'],
        [1,7,'fu'],[2,7,'fu'],[3,7,'fu'],[4,7,'fu'],[5,7,'fu'],[6,7,'fu'],[7,7,'fu'],[8,7,'fu'],[9,7,'fu'],
        [2,8,'hisha'],[8,8,'kaku'],
        [1,9,'kyo'],[2,9,'kei'],[3,9,'gin'],[4,9,'kin'],[5,9,'oh'],[6,9,'kin'],[7,9,'gin'],[8,9,'kei'],[9,9,'kyo']];
    var blackTri = "▲";
    var whiteTri = "△";
    var castNum = function (a, type) {
        return type === 'full' ? "０１２３４５６７８９"[a] : "零一二三四五六七八九"[a];
    };
    // 論理ボード用に変換 二３ -> 7, 2
    // format {x: 1, y: 2} or [1, 2]
    var encord = function(place) {
        var ret;
        if (is_allay(place)) {
            var p = place;
            place.x = place[0];
            place.y = place[1];
        }
        ret = {};
        ret.x = place.y - 1;
        ret.y = size - place.x;
        if (place.pid)
            ret.pid = correspond[place.pid];

        return ret;
    };
    // 実ボード用に変換 7.2  -> 二三
    var decord = function(place) {
        var ret;
        if (is_allay(place)) {
            var p = place;
            place.x = place[0];
            place.y = place[1];
        }
        ret = {};
        ret.x = size - place.y;
        ret.y = place.x + 1;
        if (place.pid)
            ret.pid = place.pid;        
        return ret;
    };
    ret.decord = decord;
    ret.encord = encord;
    ret.create = function() {
        var ret = {};
        var board = [];
        var stock = {sente: [], gote: []};
        var turn; // 1: 先手番 -1: 後手番
        var log;
        var kifu;
        var turnEnd = function(place) {
            if (place) {
                console.log(decord(place));
                var p = decord(place);
                var pName = pieces[board[place.x][place.y]].name;
                kifu.push((turn == 1 ? blackTri : whiteTri)+castNum(p.x, 'full')+castNum(p.y, 'kanji')+pName);
            }
            log.push({board: board.copy(), stock: JSON.parse(JSON.stringify(stock))});
            turn *= -1;
        };
        ret.init = function(initial, stocks) {
            for (var i = 0; i < size; i++) {
                board[i] = [];
                for (var j = 0; j < size; j++) {
                    board[i][j] = 0;
                }
            }
            stock = {sente: [], gote: []};
            turn = 1;
            log = [];
            kifu = [];
            if (!initial) {
                initial = initPieces;
            }
            var piece = [];
            this.putPiece(initial);
            if (stocks) {
                var f = function (args) {
                    if (stocks[args]) {
                        for (var i = 0; i < stocks[args].length; i++) {
                            stock[args][i] = correspond[stocks[args][i]];
                        }
                    }
                };
                f('sente');
                f('gote');
            }
            turnEnd();
            turn = 1;
        };
        // 引数: 場所 戻り値: 動ける場所の配列
        ret.movable = function(place) {
            var p = encord(place);
            if (turn * board[p.x][p.y] < 0) return false;
            var ret = [];
            var selected = pieces[board[p.x][p.y]];
            if (board[p.x][p.y] == 0) return ret;
            var check = function(pre, dir) {
                if (0 > pre.x + dir.x || pre.x + dir.x > size-1  ||
                    0 > pre.y + dir.y || pre.y + dir.y > size-1) {
                    return;
                } else if (board[pre.x + dir.x][pre.y + dir.y] != 0) {
                    if (board[p.x][p.y] * board[pre.x + dir.x][pre.y + dir.y] < 0) {
                        ret.push(decord({x: pre.x + dir.x, y: pre.y + dir.y}));
                    }
                    return;
                } else {
                    ret.push(decord({x: pre.x + dir.x, y: pre.y + dir.y}));
                    check({x: pre.x + dir.x, y: pre.y + dir.y}, dir);
                }
            };
            if (selected.move.dir) {
                for (var i = 0; i < selected.move.dir.length; i++) {
                    check(p, selected.move.dir[i]);
                }
            }
            if (!(selected.id == 'empty' || selected.id == 'movable')) {
                if (is_allay(selected.move.place)) {
                    for (var i = 0; i < selected.move.place.length; i++) {
                        if (0 <= p.x + selected.move.place[i].x && p.x + selected.move.place[i].x <= size-1  &&
                            0 <= p.y + selected.move.place[i].y && p.y + selected.move.place[i].y <= size-1 &&
                            0 >= board[p.x][p.y] * board[p.x + selected.move.place[i].x][p.y + selected.move.place[i].y]) {
                            ret.push(decord({x: p.x + selected.move.place[i].x, y: p.y + selected.move.place[i].y}));
                        }
                    }
                }
            }
            return ret;
        };
        ret.moveCancel = function() {
            for (var i = 0; i < size; i++) {
                for (var j = 0; j < size; j++) {
                    if (board[i][j] == 9)
                        board[i][j] = 0;
                }
            }
        };
        // 第一引数の場所の駒を第二引数の箇所に動かす．
        ret.move = function(current, target, nari) {
            var movable = this.movable(current);
            var movableFlag = false;
            for (var i = 0; i < movable.length; i++) {
                if (movable[i].x == target.x && movable[i].y == target.y) {
                    movableFlag = true;
                }
            }
            if (movableFlag) {
                var c = encord(current);
                var t = encord(target);
                var cp = board[c.x][c.y];
                var tp = board[t.x][t.y];
                var takenPiece = null;
                // とれる場合
                if (board[t.x][t.y] != 0) {
                    takenPiece = board[t.x][t.y] * -1 % 10;
                    stock[board[t.x][t.y] < 0 ? 'sente' : 'gote'].push(takenPiece);
                }
                board[t.x][t.y] = board[c.x][c.y];
                if (nari) {
                    console.log(pieces[cp]);
                    board[t.x][t.y] += 10 * pieces[cp].nari;
                }
                board[c.x][c.y] = 0;
                turnEnd(t);
                // turn *= -1;
            }
            return takenPiece;
        };
        ret.nareru = function(current, target) {
            var c = encord(current);
            var t = encord(target);
            var cp = board[c.x][c.y];
            var ret = false;
            if ((pieces[cp].nari == 1 && t.x < 3) || (pieces[cp].nari == -1 && 5 < t.x)) {
                ret = true;
            } else if ((pieces[cp].nari == 1 && c.x < 3)|| pieces[cp].nari == -1 && 5 < c.x){
                ret = true;
            }
            return ret;
        };
        // 引数: 場所，駒 戻り値: 置ける場所の配列
        ret.puttable = function(pid) {
            ret = [];
            console.log(correspond[pid]);
            if (correspond[pid] * turn < 0) return ret;
            for (var i = 0; i < size; i++) {
                for (var j = 0; j < size; j++) {
                    if (board[i][j] == 0) ret.push(decord({x:i,y:j}));
                }
            }
            return ret;
        };
        // format: (x, y, pid) or ({place: place, pid: pid})
        ret.putPiece = function(x, y, pid) {
            var p;
            var _pid;
            if (is_allay(x)) {
                for (var i = 0; i < x.length; i++) {
                    this.putPiece(x[i][0], x[i][1], x[i][2]);
                }
            } else if (arguments[2] != undefined){
                p = encord([x, y]);
                _pid = arguments[2];
                board[p.x][p.y] = correspond[_pid];
            } else {
                p = encord(x.place);
                _pid = x.pid;
                board[p.x][p.y] = correspond[_pid];
            }
        };
        ret.utsu = function(x, y, pid) {
            this.putPiece(x, y, pid);
            var teban = turn > 0 ? 'sente' : 'gote';
            console.log(stock[teban]);
            for (var i = 0; i < stock[teban].length; i++) {
                if (stock[teban][i] == correspond[pid]) {
                    stock[teban].splice(i, 1);
                    break;
                }
            }
            turnEnd(encord([x,y]));
            // turn *= -1;
        };
        // 引数: [x, y, pid]
        ret.moveOnlyTarge = function(target) {
            var p = encord(target);
            var id = correspond[target[2]];
            var current;
            var pieces = [];
            var movable = [];
            for (var i = 0; i < size; i++) {
                for (var j = 0; j < size; j++) {
                    if (board[i][j] == id)
                        pieces.push(decord([i,j]));
                }
            }
            console.log(pieces);
            if (pieces.length == 0) {
                console.log("No piece could moce to target.");
                return false;
            } else if (pieces.length == 1) {
                current = pieces[0];
                this.move(current, target);
            } else{
                for (i = 0; i < pieces.length; i++) {
                    if (this.movable(pieces[i]).contains(target)) {
                        movable.push(pieces[i]);
                    }
                }
                if (movable.length == 0) {
                    console.log("No piece could moce to target.");
                    return false;
                } else if (movable.length == 1) {
                    current = movable[0];
                    this.move(current, target);
                } else {
                    return movable;
                }
            }
            return true;
        };
        ret.wait = function() {
            console.log(log);
            if (log.length == 1) return false;
            log.pop();
            kifu.pop();
            board = JSON.parse(JSON.stringify(log[log.length-1].board));
            stock = JSON.parse(JSON.stringify(log[log.length-1].stock));
            turn *= -1;
            return true;
        };
        ret.show = function(type, b) {
            var out = [];
            var board = b || board;
            for (var i = 0; i < size; i++) {
                out[i] = [];
                for (var j = 0; j < size; j++) {
                    out[i][j] = (type == 'num') ? board[i][j] : pieces[board[i][j]].name;
                }
                out[i] = out[i].join((type == 'num') ? '\t' : '');
            }
            out = out.join('\n');
            if (type != 'num') out = out.replace(/0/g, 'ー');
            console.log(out);
        };
        ret.setTurn = function(v) {
            turn = v;
        };
        ret.setStock = function(teban, pid) {
            console.log(teban);
            console.log(pid);
            stock[teban].push(correspond[pid]);
        };
        ret.showLog = function() {
            for (var i = 0; i < log.length; i++) {
                this.show('kanji', log[i].board);
            }
        };
        ret.showStock = function() {
            console.log(stock);
        };
        ret.getKifu = function() {
            return kifu.join("\n");
        };
        ret.getIdByPlace = function(place) {
            var p = encord(place);
            return board[p.x][p.y];
        };
        ret.getPidByPlace = function(place) {
            var p = encord(place);
            return pieces[board[p.x][p.y]].pid;
        };
        ret.getBoard = function() {
            return board;
        };
        ret.getTurn = function() {
            return turn;
        },
        ret.getStock = function() {
            var ret = {sente: [], gote:[]};
            var f = function (args) {
                for (var i = 0; i < stock[args].length; i++) {
                    ret[args][i] = pieces[stock[args][i]].pid;
                }
            };
            f('sente');
            f('gote');
            return ret;
        };
        ret.getPlace = function() {
            var result = [];
            var p;
            for (var i = 0; i < size; i ++) {
                for (var j = 0; j < size; j++) {
                    if (board[i][j] != 0) {
                        var res = [];
                        p = decord([i,j]);
                        res[0] = p.x;
                        res[1] = p.y;
                        res[2] = pieces[board[i][j]].pid;
                        result.push(res);
                    }
                }
            }
            return result;
        };
        ret.getPos = function() {
            var result = {};
            result.places = this.getPlace();
            result.stocks = this.getStock();
            return result;
        };
        return ret;
    };

    var is_allay = function(value) {
        return value && 
            typeof value === 'object' &&
            typeof value.length === 'number' &&
            typeof value.splice === 'function' &&
            !(value.propertyIsEnumerable('length'));
    };
    return ret;
};
