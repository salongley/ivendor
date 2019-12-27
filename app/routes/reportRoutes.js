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
const assert = require('assert');
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







router.route('/jobsByDay')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      var queryString = '';

      const collection = dbo.collection("jobs")
      collection.aggregate([{
          $unwind: {
            path: '$jobDetails',
            includeArrayIndex: '_id',
            preserveNullAndEmptyArrays: true
          }
        }, {
          $group: {
            "_id": {
              "date": "$jobDetails.Date"
            },
            "count": {
              "$sum": 1
            }
          }
        }, {
          $sort: {
            "_id.date": 1
          }
        }],
        function (err, cursor) {
          assert.equal(err, null);


          cursor.toArray(function (err, documents) {

            reply.status(200).send(documents);
          });
        });
    });
  });

router.route('/jobsByMonth')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      var queryString = '';

      const collection = dbo.collection("jobs")
      collection.aggregate([{
          "$unwind": "$jobDetails"
        }, {
          "$group": {
            "_id": {
              "month": {
                "$month": {
                  "$dateFromString": {
                    "dateString": "$jobDetails.Date"
                  }
                }
              }
            },
            "count": {
              "$sum": 1
            }
          }

        }, {
          "$sort": {
            "_id.month": 1
          }
        }],
        function (err, cursor) {
          assert.equal(err, null);


          cursor.toArray(function (err, documents) {

            reply.status(200).send(documents);
          });
        });
    });
  });


router.route('/jobsByStatus')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      var queryString = '';

      const collection = dbo.collection("jobs")
      collection.aggregate([{
          "$unwind": "$jobDetails"
        }, {
          "$group": {
            "_id": {
              "month": {
                "$month": {
                  "$dateFromString": {
                    "dateString": "$jobDetails.Date"
                  }
                }
              }
            },
            "count": {
              "$sum": 1
            }
          }

        }, {
          "$sort": {
            "_id.month": 1
          }
        }],
        function (err, cursor) {
          assert.equal(err, null);


          cursor.toArray(function (err, documents) {

            reply.status(200).send(documents);
          });
        });
    });

  });


router.route('/jobsByCountry')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      var queryString = '';

      const collection = dbo.collection("jobs")
      collection.aggregate([{
          "$unwind": "$jobDetails"
        }, {
          "$group": {
            "_id": {
              "country": "$jobDetails.country"
            },
            "count": {
              "$sum": 1
            }
          }
        }],
        function (err, cursor) {
          assert.equal(err, null);


          cursor.toArray(function (err, documents) {

            reply.status(200).send(documents);
          });
        });
    });
  });

router.route('/jobsByInvoiceStatus')
  .get(function (request, reply) {
    var total = 0;

  });


router.route('/jobsByVendor')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      var queryString = '';

      const collection = dbo.collection("jobs")
      collection.aggregate([{
          "$group": {
            "_id": {
              "vendor": "$vendor"
            },
            "count": {
              "$sum": 1
            }
          }
        }],
        function (err, cursor) {
          assert.equal(err, null);


          cursor.toArray(function (err, documents) {

            reply.status(200).send(documents);
          });
        });
    });
  });

router.route('/jobsByEngineer')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      var queryString = '';

      const collection = dbo.collection("jobs")
      collection.aggregate(
        [{
          "$group": {
            "_id": {
              "creator": "$creator.full_name"
            },
            "count": {
              "$sum": 1
            }
          }
        }],
        function (err, cursor) {
          assert.equal(err, null);


          cursor.toArray(function (err, documents) {

            reply.status(200).send(documents);
          });
        });
    });
  });


router.route('/InvoiceTotals')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      var queryString = '';

      const collection = dbo.collection("invoices")
      collection.aggregate(
        [{
          "$group": {
            "_id": {
              "month": {
                "$month": {
                  "$dateFromString": {
                    "dateString": "$date"
                  }
                }
              }
            },
            "cost": {
              "$sum": {
                "$toDouble": "$cost"
              }
            }
          }
        }],
        function (err, cursor) {
          assert.equal(err, null);


          cursor.toArray(function (err, documents) {

            reply.status(200).send(documents);
          });
        });
    });
  });



module.exports = router