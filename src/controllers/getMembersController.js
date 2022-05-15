/**
 * This js file is responsible for requesting the repository
 *  to get all the members from the database of the requested organization.
 */

var repo = require('../repository/repository');
var stringConstants = require('./../stringConstants');
const log = require('log-to-file'); //logging the status


exports.view = function(req,res){
    var orgName = req.params.orgName;
    repo.GetAllMembers(orgName,function (err,result){
        if(result && result.length != 0){
            log("Members of the organization "+orgName+" found");
            res.json(
                {   Success : true,
                    Message : stringConstants.Members_Fetch_success,
                    Data : result
                }
            );
        }
        else{
            log("Members of the organization "+orgName+" could not be found");
            res.json(
                {   Success : false,
                    Message : stringConstants.Members_Not_Found + orgName
                }
            );
        }        
    });
   
};