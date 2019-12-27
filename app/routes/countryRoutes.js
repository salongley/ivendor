

var express = require('express')
var router = express.Router()

var ObjectId = require('mongodb').ObjectID;
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;




var dbName ='';
if(process.env.NODE_ENV == 'prod'){
  dbName='ivendor';
  dbUrl = "mongodb://port--27017.wun--usmsc01.port.ww-field-eng-qa-s01-fdb-doc-layer.pie-fdb.pie-fdb-prod.sdr.apple:27017";
}else if (process.env.NODE_ENV == 'dev'){
  dbName = 'ivendor_dev';
  dbUrl = "mongodb://port--27017.wun--usmsc01.port.ww-field-eng-qa-s01-fdb-doc-layer.pie-fdb.pie-fdb-prod.sdr.apple:27017";
} else if(process.env.NODE_ENV == 'local') {
    dbName='ivendor';
    var dbUrl = "mongodb://localhost:27017";

} else {
  dbName='ivendor';
  var dbUrl = "mongodb://localhost:27017";
}


/*
* Countries Routes
*
*/
router.route('/')
.get(function(request, reply) {

    MongoClient.connect(dbUrl,{ useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection("countries").find({}).toArray(function(err, result) {
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

        dbo.collection("countries").insertOne(myobj, function(err, res) {
          if (err) throw err;
          reply.status(201).send(myobj);
          db.close();
        });

    });
});


router.route('/import')
.post(function(request, reply) {

  MongoClient.connect(dbUrl, { useNewUrlParser: true },function(err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);

    var myobj = request.body;

      dbo.collection("countries").insertMany(myobj, function(err, res) {
        if (err) throw err;
        reply.status(201).send(myobj);
        db.close();
      });

  });
});

router.route('/:country')

.get(function(request, reply) {
var index = request.params.country;
MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(dbName);
  var myquery = { country: index };

  dbo.collection("countries").find(myquery).toArray(function(err, result) {
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
        dbo.collection("countries").updateOne(myquery, {$set: {country : myobj.country,  timezone: myobj.timezone, gmtOffset: myobj.gmtOffset, region:  myobj.region}}, function(err, res) {
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
      dbo.collection("countries").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
         reply.status(204).send("Record deleted");

        db.close();
      });
    });
});



module.exports = router