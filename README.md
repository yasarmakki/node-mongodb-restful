# node-mongodb-restful
This is CRUD nodejs app with mongodb

To install the dependencies, run this in the application folder from the command-line:

$ npm install
Running Your Application
$ npm start
Testing Your Application
$ npm test

There are 2 endpoints deployed once the application is running :

/orgs/{orgName}/comments
/orgs/{orgName}/members
The "comments" endpoint accepts POST,GET and DELETE requests. POST request accepts json object as

{comment : "SOME COMMENT"}
against the database to store the comment in MongoDB collection. GET request returns all the comments from the database. DELETE request soft deletes all the comments from the "Comments" collection and saves all of them to "ARCHIVE" collection.

The "members" endpoint accepts POST and GET requests. POST request accepts json object as

{
	"login":"login detail",
	"avatarUrl":"avatar url",
	"followers":30,
	"following":25
}
against the database to store the member data in MongoDB collection. GET request returns all the members from the database in descending order by the number of the followers the member has.

Logs
Logs can be found in a file called "default.log" in the app directory.

# From Docker-file build docker image.

$docker build -t node-server .


$docker run -d --name nodongo -p 3030:3030 node-server

 Upload The Image To Docker Registry Docker Hub


$docker tag node-server yasarmak/nodejs-starter

$docker push yasarmak/nodejs-starter:1.0

$docker tag node-server yasarmak/nodejs-starter

$docker push yasarmak/nodejs-starter:1.0



# Start The Kube

$kubectl create -f deploy.yaml


