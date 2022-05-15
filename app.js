/**
 * The entry file of the application
 */

let express = require('express');
const sls = require('serverless-http')
require('dotenv').config(); // To load all the environment variables from the .env file
const log = require('log-to-file'); //logging the status

const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

let app = express();
let routes = require("./src/routes");

let bodyParser = require('body-parser');

var port = process.env.PORT;

app.use(bodyParser.urlencoded({
    extended: true
 }));
app.use(bodyParser.json());

app.get('/',(req,res) => 
res.send("Connected to the server"));

app.use('/orgs',routes);


module.exports = app.listen(port, function () {
    log("Server is running ");
    console.log("Running server on port " + port);
});

module.exports.server = sls(app)
