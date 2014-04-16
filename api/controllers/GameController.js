/*---------------------
	:: Game 
	-> controller
---------------------*/
var GameController = {

    index: function(req, res) {
        console.log(req);
        res.view({isHost: req.params.id == "host" ? true : false});
    },
    sdp: function(req, res) {
        console.log(req);
        req.socket.broadcast.emit("push_sdp", req.params.data);
    },
    move: function(req, res) {
        console.log(req.params.data);
        req.socket.broadcast.emit("push_move");
    }

};
module.exports = GameController;
