var fs = require('fs');
var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var ObjectId = require('mongodb').ObjectID;
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set('json spaces', 2);

//Set DB path

var  dbName = 'ivendor';
var dbUrl = 'mongodb://ivendor:watryn-bimcu8-dypgyD@ds125183.mlab.com:25183/heroku_6llkbck1';
var baseURL = 'https://ivendor.herokuapp.com/'

/*
 * Vendor Routes
 *
 */
router.route('/')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection("vendors").find({}).toArray(function (err, result) {
        if (err) throw err;
        reply.status(200).send(result);
        db.close();
      });
    });
  })
  .post(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myobj = request.body;
      dbo.collection("vendors").insertOne(myobj, function (err, res) {
        if (err) throw err;
        reply.status(201).send(res);
        db.close();
      });
    });
  });



router.route('/:vendor')

  .get(function (request, reply) {
    var index = request.params.vendor;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        'vendorName': index
      };

      dbo.collection("vendors").find(myquery).toArray(function (err, result) {
        if (err) throw err;
        reply.status(200).send(result[0]);
        db.close();
      });
    });

  })

  .put(function (request, reply) {
    var index = request.params.vendor;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        '_id': index
      };
      var myobj = request.body;
      var newCountryInfo = myobj.countries;
      dbo.collection("vendors").updateOne(myquery, {
        $set: {
          countries: newCountryInfo
        }
      }, function (err, res) {
        if (err) throw err;
        reply.status(201).send("record updated");
        db.close();
      });
    });
  })

  .delete(function (request, reply) {
    var index = request.params.vendor;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        '_id': index
      };
      //var myquery = { _id: null };
      dbo.collection("vendors").deleteOne(myquery, function (err, obj) {
        if (err) throw err;

        reply.status(200).send('deleted');

        db.close();
      });
    });
  });



router.route('/:country/:resourceType')

  .get(function (request, reply) {
    var mycountry = request.params.country;
    var myresourceType = request.params.resourceType;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var today = new Date().toISOString()
      var myquery = {
        'countries.country': mycountry,
        'countries.resources.resourceTypeName': myresourceType,
        "countries.startDate": {
          $lte: today
        },
        "countries.endDate": {
          $gte: today
        }
      };

      //, 'countries.startDate': {$gte: today }, 'countries.endDate': {$lte: today }
      dbo.collection("vendors").find(myquery).toArray(function (err, result) {
        if (err) throw err;
        reply.status(200).send(result);
        db.close();
      });
    });


  });






module.exports = router