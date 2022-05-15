/**
 * This js file is responsible for requesting the repository
 *  to get all the comments from the database of the requested organization.
 */

var repo = require('../repository/repository');
var stringConstants = require('./../stringConstants');
const log = require('log-to-file'); //logging the status


exports.view = function(req,res){
    var orgName = req.params.orgName;
    repo.GetAllComments(orgName,function (err,result){
        if(result && result.length != 0){
            log("Comments fetched for :"+orgName);
            res.json(
                {   Success : true,
                    Message : stringConstants.Comments_Fetch_Success,
                    Data : result
                }
            );
        }
        else{
            log("Comments not found for :"+orgName);
            res.json(
                {   Success : false,
                    Message : stringConstants.Comments_Not_Found + orgName
                }
            );
        }       
    });
   
};