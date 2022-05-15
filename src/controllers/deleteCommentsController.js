/**
 * This js file is responsible for requesting the repository
 *  to soft delete the comments from the database.
 */
var repo = require('./../repository/repository');
var stringConstants = require('./../stringConstants');
const log = require('log-to-file'); //logging the status

exports.delete = function(req,res){
    var orgName = req.params.orgName; /** Database name is fetched from the endpoint */
    repo.DeleteComments(orgName,function(result){
        if(result){
            log("Comments successfully deleted for :"+orgName);
            res.json(
                {   Success : true,
                    Message : result
                }
            );
        }
        else{
            log("Comments deletion failed for :"+orgName);
            res.json(
                {   Success : false,
                    Message : stringConstants.Comments_No_Del
                }
            );
        }        
    });   
}