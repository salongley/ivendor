var fs = require('fs');
var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var ObjectId = require('mongodb').ObjectID;
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

const nodemailer = require('nodemailer');
var newRequest = require('../NewRequest');
var updateRequest = require('../UpdateRequest');
var jobCompleteReminder = require('../JobCompleteReminder');

var cancelRequest = require('../CancelRequest');

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set('json spaces', 2);

//Set DB path

var  dbName = 'ivendor';
var dbUrl = 'mongodb://ivendor:watryn-bimcu8-dypgyD@ds125183.mlab.com:25183/heroku_6llkbck1';
var baseURL = 'https://ivendor.herokuapp.com/'

/*
 * Jobs Routes
 *
 */
router.route('/')
  .get(function (request, reply) {
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection("jobs").find({}).sort({
        "jobDetails.Date": 1
      }).toArray(function (err, result) {
        if (err) throw err;
        reply.status(200).send(result);
        db.close();
      });
    });
  })

  .post(function (request, reply) {
    var myobj = request.body;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, async function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      try {

        dbo.collection("counters").findOneAndUpdate(

          {
            _id: "jobIDCounter"
          }, {
            $inc: {
              "counter": 1
            }
          }, {
            upsert: true,
            returnNewDocument: true
          }

        ).then((result) => {
          myobj.jobID = "AP" + zeropadding(result.value.counter, 4);
          // give each day an id based on jobID and a letter.
          var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
          var jobID = myobj.jobID;
          for (var i = 0; i < myobj.jobDetails.length; i++) {
            myobj.jobDetails[i].jobDetailID = jobID + alphabet.substring(i, i + 1);
          }

          dbo.collection("jobs").insertOne(myobj, function (err, res) {
            if (err) throw err;

            reply.status(201).send(res.insertedId);
            db.close();
          });
        });


      } catch (error) {
        console.log(error);
      }
    });

  });

router.route('/jobsPaging/:skip/:limit')
  .get(function (request, reply) {
    var skip = parseInt(request.params.skip);
    var limit = parseInt(request.params.limit);
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo.collection("jobs").find({}).sort({
        "jobDetails.Date": 1
      }).skip(skip).limit(limit).toArray(function (err, result) {
        if (err) throw err;
        reply.status(200).send(result);
        db.close();
      });
    });
  });

router.route('/totalJobs')
  .get(function (request, reply) {

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      let count = dbo.collection("jobs").countDocuments({});
      count.then((result) => {

        //reply.status(200).send(result);

        reply.send({
          "totalJobs": result
        });

      }).catch((err) => {
        console.log(err)
      });

      db.close().catch((err) => {
        console.log(err)
      });

    });

  });


//get incomplete jobs by users
router.route('/incomplete/:user')
  .get(function (request, reply) {
    var user = request.params.user;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var today = new Date().toISOString()
      var myquery = {
        completed: false,
        "users.dsid": user,
        "jobDetails.Date": {
          $lt: today
        }
      }
      dbo.collection("jobs").find(myquery).toArray(function (err, result) {
        if (err) throw err;
        reply.status(200).send(result);
        db.close();
      });
    });

  });

//get incomplete jobs count by users
router.route('/incompleteCount/:user')
  .get(function (request, reply) {
    var user = request.params.user;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var today = new Date().toISOString()
      var myquery = {
        completed: false,
        "users.dsid": user,
        "jobDetails.Date": {
          $lt: today
        }
      }
      dbo.collection("jobs").find(myquery).count(function (err, result) {
        if (err) throw err;
        reply.status(200).send({
          'count': result
        });
        db.close();
      });
    });

  });

router.route('/:job')

  .get(function (request, reply) {
    var index = request.params.job;
    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        "_id": new ObjectId(index)
      };
      dbo.collection("jobs").findOne(myquery, function (err, result) {
        if (err) throw err;
        reply.status(200).send(result);
        db.close();
      });
    });

  })

  .put(function (request, reply) {
    var index = request.params.job;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        "_id": new ObjectId(index)
      };
      var myobj = request.body;

      var newJobDetails = myobj.jobDetails;
      var updatedData = {
        jobID: myobj.jobID,
        invoiceID: myobj.invoiceID,
        users: myobj.users,
        creator: myobj.creator,
        status: myobj.status,
        vendor: myobj.vendor,
        finalComments: myobj.finalComments,
        creationEmailPending: myobj.creationEmailPending,
        cancelled: myobj.cancelled,
        recap: myobj.recap,
        isEdited: myobj.isEdited,
        jobDetails: myobj.jobDetails,
        finalComments: myobj.finalComments,
        vendorComments: myobj.vendorComments
      }

      dbo.collection("jobs").updateOne(myquery, {
        $set: updatedData
      }, function (err, res) {
        if (err) throw err;

        reply.status(201).send(index);
        db.close();
      });
    });

  })

  .delete(function (request, reply) {
    var index = request.params.job;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        "_id": new ObjectId(index)
      };

      dbo.collection("jobs").deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        reply.status(204).send("Record deleted");

        db.close();
      });
    });
  });

router.route('/jobsInvoice/:job')

  .get(function (request, reply) {
    var index = request.params.job;
    index.split(" ").join();
    var jobs = [];
    var myquery;

    // if there are multiple jobs separated by commas then build an or query string else search for one job.
    if (index.includes(',')) {
      jobs = index.split(',');
      var queryParams = [];
      for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].includes("AP") == false) {
          jobs[i] = "AP" + jobs[i];
        }
        queryParams.push({
          "jobID": jobs[i]
        });
      }
      myquery = {
        $or: queryParams
      };

    } else {
      if (index.includes("AP") == false) {
        index = "AP" + index;
      }
      myquery = {
        "jobID": index
      };
    }


    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      dbo.collection("jobs").find(myquery).toArray(function (err, result) {
        if (err) throw err;
        reply.status(200).send(result);
        db.close();
      });
    });

  })


router.route('/toggle/:job')
  .put(function (request, reply) {
    var job = request.params.job;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        "_id": new ObjectId(job)
      };
      var myobj = request.body;
      var updatedData;
      if ("isDraft" in myobj) {
        updatedData = {
          "isDraft": myobj.isDraft
        };

      } else if ("live" in myobj) {
        updatedData = {
          "isDraft": false,
          "emailSent": true
        };
      } else if ("completed" in myobj) {
        updatedData = {
          "completed": myobj.completed
        };
      }
      dbo.collection("jobs").updateOne(myquery, {
        $set: updatedData
      }, function (err, res) {
        if (err) throw err;
        reply.status(201).send(res);

        db.close();
      });
    });

  });

router.route('/cancel/:job')
  .put(function (request, reply) {
    var job = request.params.job;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        "_id": new ObjectId(job)
      };
      var myobj = request.body;
      var updatedData = {
        "status": "cancelled"
      };

      dbo.collection("jobs").updateOne(myquery, {
        $set: updatedData
      }, function (err, res) {
        if (err) throw err;
        reply.status(201).send(res);

        db.close();
      });
    });

  });



router.route('/complete/:job')
  .put(function (request, reply) {
    var job = request.params.job;

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        "_id": new ObjectId(job)
      };
      var myobj = request.body;
      var updatedData;

      updatedData = {
        "status": "completed",
        "final comments": myobj.finalComments,
        "jobDetails": myobj.jobDetails
      };

      dbo.collection("jobs").updateOne(myquery, {
        $set: updatedData
      }, function (err, res) {
        if (err) throw err;
        reply.status(201).send(res);

        db.close();
      });
    });

  });



router.route('/userjobs/:user')
  .get(function (request, reply) {
    var dsid = request.params.user;
    var user = null;
    // get user data so we can search for user and their proxies

    MongoClient.connect(dbUrl, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      var myquery = {
        "dsid": dsid
      };
      dbo.collection("users").findOne(myquery, function (err, result) {
        if (err) throw err;
        user = result;
        db.close();

        MongoClient.connect(dbUrl, {
          useNewUrlParser: true
        }, function (err, db) {
          if (err) throw err;
          var dbo = db.db(dbName);
          var myquery = {
            $or: [{
                "users.dsid": user.dsid
              },
              {
                "users.dsid": user.proxies[0]
              }
            ]

          };
          dbo.collection("jobs").find(myquery).toArray(function (err, result) {
            if (err) throw err;
            reply.status(200).send(result);
            db.close();
          });
        });

      });
    });






  });

// needed to add zeros to the job number
function zeropadding(num, places) {
  var zeros = places - num.toString().length - 1;
  var result = num.toString();
  for (i = 0; i <= zeros; i++) {
    result = "0" + result;
  }
  return result;
}

module.exports = router