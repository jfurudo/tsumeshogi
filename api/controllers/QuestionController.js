/*---------------------
	:: Question 
	-> controller
---------------------*/
var QuestionController = {

    add: function(req, res) {
        res.view();
    },
    list: function(req, res) {
        Question.findAll().done(function(err, questions) {
            if (err) {
                console.log(err);
                return;
            } else {
                res.view({questions: questions});
            }
        });
    },
    try: function(req, res) {
        Question.find(req.params.id).done(function(err, question) {
            if (err) {
                console.log(err);
            } else {
                res.view({question: question});
            }
        });
    }

};
module.exports = QuestionController;
