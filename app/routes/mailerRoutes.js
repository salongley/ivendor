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

const nodemailer = require('nodemailer');
var newRequest = require('../NewRequest');
var updateRequest = require('../UpdateRequest');
var jobCompleteReminder = require('../JobCompleteReminder');

var cancelRequest = require('../CancelRequest');

//Set DB path

var  dbName = 'ivendor';
var dbUrl = 'mongodb://ivendor:watryn-bimcu8-dypgyD@ds125183.mlab.com:25183/heroku_6llkbck1';
var baseURL = 'https://ivendor.herokuapp.com/'

//Mail routes
//
router.route('/:job/:type')
.post(function(request, reply) {
var index = request.params.job;
var type = request.params.type;

var myobj = request.body;

var vendorEmails = myobj.vendorEmails;
var appleEmails = myobj.appleEmails;
var myquery = { "_id": new ObjectId(index) };
MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(dbName);
  
  dbo.collection("jobs").findOne(myquery, function(err, result) {
    if (err) throw err;
   
    

    if(type == 'new'){
      // setup email data with unicode symbols
      let mailOptions = {
        from: '"iVendor" <ivendor_tool@apple.com>', // sender address
        to: vendorEmails, // list of receivers
        cc: appleEmails,
        subject: 'New Request', // Subject line
        html: newRequest(result) // html body
      }
        sendMail(mailOptions);
    
    } else if (type == 'cancel'){
        // setup email data with unicode symbols
        let mailOptions = {
          from: '"iVendor" <ivendor_tool@apple.com>', // sender address
          to: vendorEmails,
          cc: appleEmails,
          subject: 'Cancel Request', // Subject line
          html: cancelRequest(result) // html body
        }
          sendMail(mailOptions);
        
    } else if (type == 'update') {
          let mailOptions = {
            from: '"iVendor" <ivendor_tool@apple.com>', // sender address
            to: vendorEmails, // list of receivers
            cc: appleEmails,
            subject: 'Updated Request', // Subject line
            html: updateRequest(result, myobj.oldJob) // html body
          }
            sendMail( mailOptions);
        
    } else if (type == 'recap') {
      let mailOptions = {
        from: '"iVendor" <ivendor_tool@apple.com>', // sender address
        to: vendorEmails, // list of receivers
        cc: appleEmails,
        subject: 'Recap Request', // Subject line
        html: newRequest(result.value) // html body
      }
        sendMail( mailOptions);
    
}
  });



    db.close();

});

});
// route for reminder
router.route('/reminder')
.post(function(req,res){

for(var i= 0;i<req.body.length;i++){
  var myobj = req.body[i];
  var emailTo = myobj.emailTo;
  var emailCC = myobj.emailCC;
  var mycomments = myobj.comments;
  var myjobID = myobj.jobID;

     // setup email data with unicode symbols
     let mailOptions = {
      from: '"iVendor" <ivendor_tool@apple.com>', // sender address
      to: emailTo, // list of receivers
      cc: emailCC,
      subject: 'Job Requires Completion', // Subject line
      html: jobCompleteReminder({comments:mycomments, jobID: myjobID }) // html body
    }
      sendMail(mailOptions);

      res.status(200).send("Email sent");
}
   

  });

  function sendMail( mailOptions){
    // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  nodemailer.createTestAccount((err) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'mail.apple.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "ivendor_tool@apple.com", // 
            pass: "EqRbkbgnFBihuE,n6wYbfCMR[KxKT6fa" // 
  
        }
    });
  
    
  
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
  
    });
  });
  }



module.exports = router