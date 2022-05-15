process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.should();
var mongoDb = require('mongodb').MongoClient;


process.env.CONN_STRING = 'mongodb://localhost:27017/';
let app = require('../app');
let repo = require('./../src/repository/repository');


chai.use(chaiHttp);

describe('RETURN FALSE FOR EMPTY REQUEST',() => {  
    before((done)=>{        
        mongoDb.connect(process.env.CONN_STRING,{ useNewUrlParser: true,useUnifiedTopology: true},(err,client) => {
          var mongoClient = client;
          var dbo = mongoClient.db("Xendit");
          var collection = dbo.collection('Comment');
          collection.deleteMany({});
        });  
      done();
});          
    let model = {};
     it('should return false success and bad request',((done)=>{
        chai.request(app)
        .post('/orgs/Xendit/comments')
        .send(model)
        .end((err,res)=>{
            res.should.have.status(400);
            res.body.Success.should.be.eql(false);
            res.body.Message.should.be.eql("Please provide a comment.");
            done();
        });              
    }));
});

describe('RETURN FALSE FOR EMPTY COMMENT',() => {  
    before((done)=>{        
        mongoDb.connect(process.env.CONN_STRING,{ useNewUrlParser: true,useUnifiedTopology: true},(err,client) => {
          var mongoClient = client;
          var dbo = mongoClient.db("Xendit");
          var collection = dbo.collection('Comment');
          collection.deleteMany({});
        });  
      done();
});          
    let model = {comment : ""};
     it('should return false success and bad request for an empty comment',((done)=>{
        chai.request(app)
        .post('/orgs/Xendit/comments')
        .send(model)
        .end((err,res)=>{
            res.should.have.status(400);
            res.body.Success.should.be.eql(false);
            res.body.Message.should.be.eql("Please provide a comment.");
            done();
        });              
    }));
});

describe('INSERT EXACTLY ONE COMMENT',() => {  
    before((done)=>{        
        mongoDb.connect(process.env.CONN_STRING,{ useNewUrlParser: true,useUnifiedTopology: true},(err,client) => {
          var mongoClient = client;
          var dbo = mongoClient.db("Xendit");
          var collection = dbo.collection('Comment');
          collection.deleteMany({});
        });  
      done();
});          
    let model = { comment : "Test comment"};
     it('should save one comment and return true success',((done)=>{
        chai.request(app)
        .post('/orgs/Xendit/comments')
        .send(model)
        .end((err,res)=>{
            res.should.have.status(200);
            res.body.Success.should.be.eql(true);
            res.body.Message.should.be.eql("Comment successfully saved.");
            done();
        });              
    }));
});

