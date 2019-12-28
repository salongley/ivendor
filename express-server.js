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



//external routing files.
var jobRoutes = require('./app/routes/jobRoutes');
var countryRoutes = require('./app/routes/countryRoutes');
var resourceTypeRoutes = require('./app/routes/resourceTypeRoutes');
var vendorRoutes = require('./app/routes/vendorRoutes');
var mailerRoutes = require('./app/routes/mailerRoutes');
var reportRoutes = require('./app/routes/reportRoutes');
var invoiceRoutes = require('./app/routes/invoiceRoutes');
var userRoutes = require('./app/routes/userRoutes');
var tagRoutes = require('./app/routes/tagRoutes');

app.use('/jobs/', jobRoutes);
app.use('/countries/', countryRoutes);
app.use('/resourceTypes/', resourceTypeRoutes);
app.use('/vendors/', vendorRoutes);
app.use('/mail/', mailerRoutes);
app.use('/reports/', reportRoutes);
app.use('/invoices/', invoiceRoutes);
app.use('/users/', userRoutes);
app.use('/tags/', tagRoutes);

// required dependency
app.use('/*', cookieParser());


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



//communication Routes
router.route('/appleComments/:id')
  .put(function (request, reply) {
    var index = request.params.id;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myobj = request.body;
      var myquery = {
        _id: ObjectId(index)
      };


      var UpdatedData = {
        $push: {
          vendorComments: {
            "jobID": myobj.jobID,
            "comments": myobj.comments,
            "date": myobj.date,
            "authorName": myobj.authorName,
            "icon": myobj.icon
          }
        }
      };

      dbo.collection("jobs").updateOne(myquery, UpdatedData, function (err, res) {
        if (err) throw err;
        reply.status(201).send("record updated");
        db.close();
      });
    });

  })




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

app.listen(3128);



//to reset counter
router.route('/resetCounter/:counter')
  .put(function (request, reply) {
    var mycounter = request.params.counter;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        _id: new ObjectId('jobIDCounter')
      };
      var myobj = request.body;
      dbo.collection("counters").updateOne(myquery, {
        $set: {
          counter: mycounter
        }
      }, function (err, res) {
        if (err) throw err;
        reply.status(200).send("counter updated");
        db.close();
      });
    });
  });