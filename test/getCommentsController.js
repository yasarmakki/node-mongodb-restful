
process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.should();
var mongoDb = require('mongodb').MongoClient;



let app = require('../app');


chai.use(chaiHttp);

describe('GET NO DATA',() => {  
    before((done)=>{        
        mongoDb.connect(process.env.CONN_STRING,{ useNewUrlParser: true,useUnifiedTopology: true},(err,client) => {
          var mongoClient = client;
          var dbo = mongoClient.db("Xendit");
          var collection = dbo.collection('Comment');
          collection.deleteMany({});
        });  
      done();
});      
    it('should return no data and false success',((done)=>{
        chai.request(app)
        .get('/orgs/Xendit/comments')
        .end((err,res) => {
            res.should.have.status(200);
            res.body.Success.should.be.eql(false);
            res.body.Message.should.be.eql("There were no comments found for the organization :Xendit")
            done();
        });        
    }));
});

describe('GET EXACTLY ONE COMMENT',() => {  
    
    let model = { comment : "Test comment"};
     it('should return one comment and true success',((done)=>{
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
            done();
        });        
    }));
});




           

