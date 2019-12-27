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

var dbName = '';
if (process.env.NODE_ENV == 'prod') {
  dbName = 'ivendor';
  dbUrl = "mongodb://port--27017.wun--usmsc01.port.ww-field-eng-qa-s01-fdb-doc-layer.pie-fdb.pie-fdb-prod.sdr.apple:27017";
} else if (process.env.NODE_ENV == 'dev') {
  dbName = 'ivendor_dev';
  dbUrl = "mongodb://port--27017.wun--usmsc01.port.ww-field-eng-qa-s01-fdb-doc-layer.pie-fdb.pie-fdb-prod.sdr.apple:27017";
} else if (process.env.NODE_ENV == 'local') {
  dbName = 'ivendor';
  var dbUrl = "mongodb://localhost:27017";

} else {
  dbName = 'ivendor';
  var dbUrl = "mongodb://localhost:27017";
}

/*
 * Users Routes
 *
 */
router.route('/')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection("users").find({}).sort({
        full_name: 1
      }).toArray(function (err, result) {
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

      dbo.collection("users").insertOne(myobj, function (err, res) {
        if (err) throw err;
        reply.status(201).send(res);
        db.close();
      });

    });
  });



router.route('/:userID')

  .get(function (request, reply) {
    var index = request.params.userID;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        userID: index
      };
      dbo.collection("users").find(myquery).toArray(function (err, result) {
        if (err) throw err;
        reply.status(200).send(result[0]);
        db.close();
      });
    });

  })

  .put(function (request, reply) {
    var index = request.params.userID;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        _id: new ObjectId(index)
      };
      var myobj = request.body;


      var UpdatedData = {
        name: '',
        full_name: myobj.full_name,
        preferred_name: myobj.preferred_name,
        dsid: myobj.dsid,
        role: myobj.role,
        email: myobj.email,
        contact_number: myobj.contact_number,
        timezone: myobj.timezone,
        image_base_64: myobj.image_base_64,
        proxies: myobj.proxies,
      }

      dbo.collection("users").updateOne(myquery, {
        $set: UpdatedData
      }, function (err, res) {
        if (err) throw err;
        reply.status(201).send("record updated");
        db.close();
      });
    });

  })

  .delete(function (request, reply) {
    var index = request.params.userID;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        userID: index
      };
      dbo.collection("users").deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        reply.status(204).send("Record deleted");

        db.close();
      });
    });
  });



router.route('/import')
  .post(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myobj = request.body;

      dbo.collection("users").insertMany(myobj, function (err, res) {
        if (err) throw err;
        reply.status(201).send(res);
        db.close();
      });

    });
  });

router.route('login/:userID')

  .get(function (request, reply) {
    var id = request.params.userID;

    //if user is not in the database then insert a new record

    lookup.getUserById(id).then(function (res) {

      var user = {
        name: '', // LDAP name
        full_name: '',
        preferred_name: '',
        dsid: '', //apple directory personID
        role: 0, // number referring to role in the app
        email: '',
        contact_number: '',
        timezone: '',
      }

      user.dsid = res.results[0].appledsid;
      user.email = res.results[0].mail;
      user.full_name = res.results[0].cn;
      user.name = res.results[0].mail.split('@')[0];
      user.preferred_name = res.results[0].givenname;

      MongoClient.connect(dbUrl, {
        useNewUrlParser: true
      }, function (err, db) {
        if (err) throw err;
        var dbo = db.db(dbName);


        dbo.collection("users").insertOne(user, function (err, res) {
          if (err) throw err;
          MongoClient.connect(dbUrl, {
            useNewUrlParser: true
          }, function (err, db) {
            if (err) throw err;
            var dbo = db.db(dbName);
            var myobj = request.body;

            dbo.collection("users").insertOne(myobj, function (err, res) {
              if (err) throw err;
              reply.status(201).send(res);
              db.close();
            });

          });
          db.close();
        });

      });




    }).catch(function (err) {
      console.log('error: ', err);
    });


  })


module.exports = router