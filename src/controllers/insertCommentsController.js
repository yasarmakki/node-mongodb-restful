/**
 * This js file is responsible for requesting the repository
 *  to insert the comment in the database of the requested organization.
 */

var repo = require('./../repository/repository');
var stringConstants = require('./../stringConstants');
const log = require('log-to-file'); //logging the status

exports.new = function(req,res){
    
    var comment = req.body.comment;
    if(Object.keys(req.body).length === 0 || comment === ""){
        log("Invalid request");
        res.status(400);
        res.send({
            Success : false,
            Message : stringConstants.Empty_Comment
        });
        return;
    }
    var dbModel = {comment : comment}
    var orgName = req.params.orgName;

    repo.InsertComments(orgName,dbModel,function (err,result){
        if(result){
            log("Comment successfully saved in the database");
            res.json({
                    Success : true,
                    Message : stringConstants.Comments_Saved_Success
                });
                return;
        }
        else{
            log("Comment could not be saved in the database");
            res.json({
                Success : false,
                Message : stringConstants.Comments_Saved_Fail + err
            });
        }        
    });
};