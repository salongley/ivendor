var fs = require('fs');
var express = require('express');
var app = express();
var router = express.Router();
const cron = require("node-cron");
var path = require('path');
var ObjectId = require('mongodb').ObjectID;
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
var newRequest = require('./app/NewRequest');
var updateRequest = require('./app/UpdateRequest');
var jobCompleteReminder = require('./app/JobCompleteReminder');
const cookieParser = require('cookie-parser');
var cancelRequest = require('./app/CancelRequest');
app.use(express.static(__dirname + '/app/public'));

app.use(bodyParser.json());
app.set('json spaces', 2);

app.use('/', router);



//Set DB path

var  dbName = 'ivendor';
var dbUrl = 'mongodb://ivendor:watryn-bimcu8-dypgyD@ds125183.mlab.com:25183/heroku_6llkbck1';
var baseURL = 'https://ivendor.herokuapp.com/'



//generates a counter to make the invoice number
MongoClient.connect(dbUrl, {
  useNewUrlParser: true
}, function (err, db) {
  var dbo = db.db(dbName);
  dbo.createCollection('counters');
  try {
    dbo.collection('counters').updateOne({
      _id: "jobIDCounter"
    }, {
      $setOnInsert: {
        _id: "jobIDCounter",
        counter: 0
      },

    }, {
      upsert: true
    })
  } catch (error) {
    console.log(error);
  }
});





//Index for APP


app.get('/', function (request, reply) {
  reply.set('Content-Type', 'text/html');
  reply.status(200).sendFile(path.join(__dirname + '/app/index.html'));
});

app.get('/index.1.html', function (request, reply) {
  reply.set('Content-Type', 'text/html');
  reply.status(200).sendFile(path.join(__dirname + '/app/index.1.html'));
});

app.get('/testing.html', function (request, reply) {
  reply.set('Content-Type', 'text/html');
  reply.status(200).sendFile(path.join(__dirname + '/app/testing.html'));
});

app.get('/__health', function (request, reply) {
  reply.status(200).send('OK');
});

var port = Number(process.env.PORT_PUBLIC) || 80;
var server = app.listen(port, "0.0.0.0", function () {
  console.log('Express is listening on port ' + port);
});



cron.schedule("* 18 * * *", function () {

});



