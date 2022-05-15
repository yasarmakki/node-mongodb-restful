process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.should();
var mongoDb = require('mongodb').MongoClient;


process.env.CONN_STRING = 'mongodb://localhost:27017/';
let app = require('../app');


chai.use(chaiHttp);

describe('DELETE NOTHING',() => {  
    before((done)=>{        
        mongoDb.connect(process.env.CONN_STRING,{ useNewUrlParser: true,useUnifiedTopology: true},(err,client) => {
          var mongoClient = client;
          var dbo = mongoClient.db("Xendit");
          var collection = dbo.collection('Comment');
          collection.deleteMany({});
        });  
      done();
});      
    it('should not delete anything since no comment exists',((done)=>{
        chai.request(app)
        .del('/orgs/Xendit/comments')
        .end((err,res) => {
            res.should.have.status(200);
            res.body.Success.should.be.eql(true);
            res.body.Message.should.be.eql("There does not exist any comments for the organization : Xendit")
            done();
        });        
    }));
});


describe('DELETE ONE COMMENT',() => {  
    
    let model = { comment : "Test comment"};
     it('should return true success for the comment be deleted',((done)=>{
        chai.request(app)
        .post('/orgs/Xendit/comments')
        .send(model)
        .end((err,res)=>{
            console.log(res.body);
        });
        chai.request(app)
        .get('/orgs/Xendit/comments')
        .end((err,res) => {
            res.should.have.status(200);
            res.body.Success.should.be.eql(true);
            res.body.Message.should.be.eql("Comments successfully fetched.");
            res.body.Data.length.should.be.eql(1);
        });
        chai.request(app)
        .del('/orgs/Xendit/comments')
        .end((err,res) => {
            res.should.have.status(200);
            res.body.Success.should.be.eql(true);
            res.body.Message.should.be.eql("Comments were successfully deleted.");
            done();
        });             
    }));
});
