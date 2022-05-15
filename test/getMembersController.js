
process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.should();
var mongoDb = require('mongodb').MongoClient;


process.env.CONN_STRING = 'mongodb://localhost:27017/';
let app = require('../app');


chai.use(chaiHttp);

describe('GET NO DATA',() => {  
    before((done)=>{        
        mongoDb.connect(process.env.CONN_STRING,{ useNewUrlParser: true,useUnifiedTopology: true},(err,client) => {
          var mongoClient = client;
          var dbo = mongoClient.db("Xendit");
          var collection = dbo.collection('Members');
          collection.deleteMany({});
        });  
      done();
});      
    it('should return no data and false success',((done)=>{
        chai.request(app)
        .get('/orgs/Xendit/members')
        .end((err,res) => {
            res.should.have.status(200);
            res.body.Success.should.be.eql(false);
            res.body.Message.should.be.eql("There were no members found for the organization : Xendit");
            done();
        });        
    }));
});

describe('GET ONE DATA',() => {  
    before((done)=>{        
        mongoDb.connect(process.env.CONN_STRING,{ useNewUrlParser: true,useUnifiedTopology: true},(err,client) => {
          var mongoClient = client;
          var dbo = mongoClient.db("Xendit");
          var collection = dbo.collection('Members');
          collection.deleteMany({});
        });  
      done();
});      
    
    it('should return one members data',((done)=>{
        let member = {
            login : "login",
            avatarUrl : "loginAvatar",
            followers : 5,
            following : 10
        };
        chai.request(app)
        .post('/orgs/Xendit/members')
        .send(member)
        .end((err,res)=>{
            console.log(res.body);
        });
        chai.request(app)
        .get('/orgs/Xendit/members')
        .end((err,res) => {
            res.should.have.status(200);
            res.body.Success.should.be.eql(true);
            res.body.Message.should.be.eql("Members successfully fetched");
            res.body.Data.length.should.be.eql(1);
            done();
        });        
    }));
});


describe('GET DATA IN DESCENDING ORDER',() => {  
    it('should return members data in a descending order',((done)=>{
        let member = {
            login : "login",
            avatarUrl : "loginAvatar",
            followers : 5,
            following : 10
        };

        let member1 = {
            login : "login1",
            avatarUrl : "loginAvatar1",
            followers : 15,
            following : 20
        };
        chai.request(app)
        .post('/orgs/Xendit/members')
        .send(member)
        .end((err,res)=>{
            console.log(res.body);
        });
        chai.request(app)
        .post('/orgs/Xendit/members')
        .send(member1)
        .end((err,res)=>{
            console.log(res.body);
        });
        chai.request(app)
        .get('/orgs/Xendit/members')
        .end((err,res) => {
            res.should.have.status(200);
            res.body.Success.should.be.eql(true);
            res.body.Message.should.be.eql("Members successfully fetched");
            res.body.Data.length.should.be.eql(2);
            res.body.Data[0].login.should.be.eql(member1.login);
            done();
        });        
    }));
});