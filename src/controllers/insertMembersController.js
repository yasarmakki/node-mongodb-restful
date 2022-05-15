/**
 * This js file is responsible for requesting the repository
 *  to insert the member in the database of the requested organization.
 */

var repo = require('../repository/repository');
var stringConstants = require('./../stringConstants');

exports.new = function(req,res){
    if(Object.keys(req.body).length === 0){
        res.status(400);
        res.send({
            Success : false,
            Message : stringConstants.Invalid_Request
        });
        return;
    }
    var login = req.body.login;
    var avatarUrl = req.body.avatarUrl;
    
    if(!login){
        res.status(400);
        res.send({
            Success : false,
            Message : stringConstants.Invalid_Login
        });
        return;
    }
    if(!avatarUrl){
        res.status(400);
        res.send({
            Success : false,
            Message : stringConstants.Invalid_AvatarUrl
        });
        return;
    }
    var dbModel = {
                login : login,
                avatarUrl : avatarUrl,
                followers : req.body.followers,
                following : req.body.following
             }

    var orgName = req.params.orgName;

    repo.InsertMembers(orgName,dbModel,function (err,result){
        if(result){
            res.json({
                    Success : true,
                    Message :stringConstants.Member_Saved_Success
                });
                return;
            }
            else{
                res.json({
                    Success : false,
                    Message : stringConstants.Member_Saved_Fail + err
                });
                return;
            }            
           });
        };