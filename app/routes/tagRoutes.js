
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
* Tag Routes
*
*/
router.route('/')
.get(function(request, reply) {

    MongoClient.connect(dbUrl,{ useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection("tags").find({}).toArray(function(err, result) {
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

        dbo.collection("tags").insertOne(myobj, function(err, res) {
          if (err) throw err;
          reply.status(201).send(myobj);
          db.close();
        });

    });
});



router.route('/:tag')

.get(function(request, reply) {
var index = request.params.country;
MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(dbName);
  var myquery = { country: index };

  dbo.collection("tag").find(myquery).toArray(function(err, result) {
      if (err) throw err;
       reply.status(200).send(result[0]);
      db.close();
    });
});

})

.put(function(request, reply) {
    var index = request.params.country;


    MongoClient.connect(dbUrl, { useNewUrlParser: true },function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = { _id : new ObjectId(index)};
      var myobj = request.body;
        dbo.collection("tag").updateOne(myquery, {$set: {resourceTypeName : myobj.resourceTypeName,  tagName: myobj.tagName, tags: myobj.tags}}, function(err, res) {
          if (err) throw err;
          reply.status(201).send("record updated");
          db.close();
        });
    });
})

.delete(function(request, reply) {
    var index = request.params.country;

    MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = { country: index };
      dbo.collection("tag").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
         reply.status(204).send("Record deleted");

        db.close();
      });
    });
});



module.exports = router