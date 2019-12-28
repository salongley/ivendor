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
* Resource Types Routes
*
*/
router.route('/')
.get(function(request, reply) {

    MongoClient.connect(dbUrl,{ useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection("resourceTypes").find({}).toArray(function(err, result) {
      if (err) throw err;
        reply.status(200).send(result);
    db.close();
  });
});
})

.post(function(request, reply) {

  MongoClient.connect(dbUrl, { useNewUrlParser: true },function(err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);


    var myobj = request.body;
    var myquery = { _id: myobj._id };
   
     
      dbo.collection("resourceTypes").insertOne(myobj, function(err, res) {
        if (err) throw err;
        reply.status(201).send(myobj);
        db.close();
      });
    
  });
});



router.route('/:resourceType')

.get(function(request, reply) {
var index = request.params.resourceType;
MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(dbName);
  var myquery = { _id : new ObjectId(index)};
  dbo.collection("resourceTypes").find(myquery).toArray(function(err, result) {
    if (err) throw err;
     reply.status(200).send(result[0]);
    db.close();
  });
});

})

.put(function(request, reply) {
    var index = request.params.resourceType;

    MongoClient.connect(dbUrl, { useNewUrlParser: true },function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = { _id : new ObjectId(index)};
      var myobj = request.body;

        dbo.collection("resourceTypes").updateOne(myquery, {$set: {resourceTypeName: myobj.resourceTypeName, isMultipleDay : myobj.isMultipleDay,  resourceElements: myobj.resourceElements}}, function(err, res) {
          if (err) throw err;
          reply.status(201).send("record updated");
          db.close();
        });
    });
})

.delete(function(request, reply) {
    var index = request.params.resourceType;

    MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = { _id : new ObjectId(index)};
      dbo.collection("resourceTypes").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
         reply.status(204).send("Record deleted");

        db.close();
      });
    });
});






module.exports = router