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

//UAT APPLE CONNECT
// appId: "148544",
// appAdminPassword: "st7b9928q7zehx9v",
// appIdKey: "0d0de74fb7d44cf2641d126167079f00f469fdb841b464fe34614e0ea2adcddf"

//PROD APPLE CONNECT
// appId: "148544",
// appAdminPassword: "st7b9928q7zehx9v",
// appIdKey: "b1a2f62709e5157444d8810e4e3bb7215f3a7a44c9d43a0527b4b7d7e8221317"


/*
 * This code is for Authentication with Apple Connect
 *
 *
 *
 */
// const {
//   APPLE_CONNECT_ENVIRONMENT,
//   APPLE_CONNECT_MIDDLEWARE_NAME,
//   appleConnect
// } = require('@spg/express-apple-connect');

// var unless = function (path, middleware) {
//   return function (req, res, next) {
//     if (path === req.path) {
//       res.status(200).send('OK');
// 
//     } else {
//       return next();
//       //return middleware(req, res, next);
//     }
//   };
// };
// 
// app.use(unless('/__health', authenticate));
// 
// 
// setup the appleConnect middleware
// app.use('/*', appleConnect({
//   environment: APPLE_CONNECT_ENVIRONMENT['PROD'],
//   appId: '148544',
//   appAdminPassword: 'st7b9928q7zehx9v',
//   appIdKey: 'b1a2f62709e5157444d8810e4e3bb7215f3a7a44c9d43a0527b4b7d7e8221317',
//   baseURL: 'https://ivendor-ivendor-prod.usspk05.app.apple.com/'

// }));

// // setup the appleConnect middleware
// app.use('/*', appleConnect({
//   environment: APPLE_CONNECT_ENVIRONMENT['LOCAL'],
//   appId: '148544',
//   appAdminPassword: 'st7b9928q7zehx9v',
//   appIdKey: '0d0de74fb7d44cf2641d126167079f00f469fdb841b464fe34614e0ea2adcddf',
//   baseURL: 'localhost:8080'

// }));

// // setup the appleConnect middleware
// app.use('/*', appleConnect({
//   environment: APPLE_CONNECT_ENVIRONMENT['UAT'],
//   appId: '148544',
//   appAdminPassword: 'st7b9928q7zehx9v',
//   appIdKey: '0d0de74fb7d44cf2641d126167079f00f469fdb841b464fe34614e0ea2adcddf',
//   baseURL: 'https://ivendor-ivendor-dev.usspk05.app.apple.com/'
// }));

// // // handle authenticated requests
// app.get('/*', (request, response) => {

//   // On success, validUser and myacinfo are available on the request object.
//   // When LOCAL, the middleware will still add the the request[APPLE_CONNECT_MIDDLEWARE_NAME]
//   // property but the validUser, myacinfo, and ip properties will all be undefined
//   const {
//     myacinfo,
//     validUser,
//     ip
//   } = request[APPLE_CONNECT_MIDDLEWARE_NAME];

//   response.status(200).send(validUser);
//   // ...

// });

// function authenticate(request, response) {
//   const {
//     myacinfo,
//     details,
//     ip
//   } = request[APPLE_CONNECT_MIDDLEWARE_NAME];
//   response.status(200).send(details);

// }



// Switch to use the correct DB for each environment
//Set these in the rio.yml AND the apps.yml
var baseURL = '';
var dbName = '';
if (process.env.NODE_ENV == 'prod') {
  baseURL = 'https://ivendor-ivendor-prod.usspk05.app.apple.com/'
  dbName = 'ivendor';
  dbUrl = "mongodb://port--27017.wun--usmsc01.port.ww-field-eng-qa-s01-fdb-doc-layer.pie-fdb.pie-fdb-prod.sdr.apple:27017";
} else if (process.env.NODE_ENV == 'dev') {
  baseURL = 'https://ivendor-ivendor-dev.usspk05.app.apple.com/'
  dbName = 'ivendor_dev';
  dbUrl = "mongodb://port--27017.wun--usmsc01.port.ww-field-eng-qa-s01-fdb-doc-layer.pie-fdb.pie-fdb-prod.sdr.apple:27017";
} else if (process.env.NODE_ENV == 'local') {
  dbName = 'ivendor';
  var dbUrl = "mongodb://localhost:27017";
  baseURL = 'https://ivendor-ivendor-dev.usspk05.app.apple.com/';

} else {
  dbName = 'ivendor';
  var dbUrl = "mongodb://localhost:27017";
  baseURL = 'http://localhost:8080'
}


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

// Health check for PIE COMPUTE
app.get('/__health', function (request, reply) {
  reply.status(200).send('OK');
});

var port = Number(process.env.PORT_PUBLIC) || 8080;
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