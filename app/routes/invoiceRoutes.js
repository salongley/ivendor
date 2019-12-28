var express = require('express')
var router = express.Router()

var ObjectId = require('mongodb').ObjectID;
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

//Set DB path

var  dbName = 'ivendor';
var dbUrl = 'mongodb://ivendor:watryn-bimcu8-dypgyD@ds125183.mlab.com:25183/heroku_6llkbck1';
var baseURL = 'https://ivendor.herokuapp.com/'


/*
* Invoice Routes
*
*/
router.route('/')
.get(function(request, reply) {

    MongoClient.connect(dbUrl,{ useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection("invoices").find({}).toArray(function(err, result) {
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

      dbo.collection("invoices").insertOne(myobj, function(err, res) {
        if (err) throw err;
        reply.status(201).send(res);
        db.close();
      });

  });
});



router.route('/:invoiceID')

.get(function(request, reply) {
var index = request.params.invoiceID;
MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(dbName);
  var myquery = { invoiceID: index };
  dbo.collection("invoices").find(myquery).toArray(function(err, result) {
    if (err) throw err;
     reply.status(200).send(result[0]);
    db.close();
  });
});

})

.put(function(request, reply) {
    var index = request.params.invoiceID;
    MongoClient.connect(dbUrl, { useNewUrlParser: true },function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = { userID : index};
      var myobj = request.body;
      var UpdatedData = {user_name: myobj.user_name, full_name: myobj.full_name, preferred_name: myobj.preferred_name, jobSdsidummary: myobj.dsid, role: myobj.role, email: myobj.email, contact_number: myobj.contact_number, timezone: myobj.timezone, image_base_64: myobj.image_base_64 }

        dbo.collection("invoices").updateOne(myquery, {$set: UpdatedData}, function(err, res) {
          if (err) throw err;
          reply.status(201).send("record updated");
          db.close();
        });
    });
})

.delete(function(request, reply) {
    var index = request.params.invoiceID;

    MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = { invoiceID: index };
      dbo.collection("invoices").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
         reply.status(204).send("Record deleted");

        db.close();
      });
    });
});



module.exports = router