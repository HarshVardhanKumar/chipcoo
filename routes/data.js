var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient ;
var dotenv = require('dotenv').config() ;
var mongourl = 'mongodb://'+process.env.DBUS+":"+process.env.DWORD+"@ds153113.mlab.com:53113/"+process.env.DBNAME
var session = require('express-session');

module.exports.initializeData = function(data) {
  console.log(data);
}
var object = {
  "a":"z","b":"y","c":"x" , "d":"w", "e":"v", "f":"u", "g":"t", "h":"s", "i":"r", "j":"q", "k":"p", "l":"o", "m":"n", "n":"m","o":"l", "p":"k", "q":"j", "r":"i", "s":"h", "t":"g", "u":"f", "v":"e", "w":"d", "x":"c", "y":"b", "z":"a",
  "A":"Z", "B":"Y", "C":"X", "D":"W", "E":"V", "F":"U", "G":"T", "H":"S", "I":"R", "J":"Q", "K":"P", "L":"O", "M":"N", "N":"M", "O":"L", "P":"K", "Q":"J", "R":"I", "S":"H", "T":"G","U":"F", "V":"E", "W":"D", "X":"C", "Y":"B", "Z":"A",
  "1":"0", "2":"9", "3":"8", "4":"7", "5":"6", "6":"5", "7":"4", "8":"3", "9":"2", "0":"1"
}
function encodeDecodeCookie(string) {
  var ar = string.split("") ;
  var encodedString = "" ;
  for (var v in ar) {
    if(object.hasOwnProperty(ar[v])) {
      encodedString+=object[ar[v]] ;
    }
    else encodedString+=ar[v] ;
  }
  return encodedString ;
}
/* used to do the database related tasks */

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true}));

router.post('/create_sticky', function(req, res, next) {
  console.log(req.body) ;
  console.log(req.cookies);

  mongo.connect(mongourl,function(err, db) {
    if(err) {
      res.status(400).send("Some error occured. Please try again.") ;
    }
    else {
      var stick_details = db.collection('stick_details') ;
      var user_uploads_roomstic = db.collection('user_uploads_roomstic') ;
      var login_roomstic = db.collection('login_roomstic');

      var email_id = encodeDecodeCookie(req.cookies.nam) ;
      var password = encodeDecodeCookie(req.cookies.w) ;

      console.log("email_id is "+email_id);
      console.log("Password is "+password);
      // check if the request to create stick is from a valid user.
      console.log("in the data.js");
      console.log(req.session);

      let sticky_id = req.session._id.split("@")[0]+req.session.no_of_stickers_uploaded ;
      console.log("sticky_id is "+sticky_id);
      stick_details.insert({"_id":sticky_id, "title": req.body.title, "description": req.body.description, "link_of_the_image": req.body.image, "smile":0, "meh": 0, "frown":0}, function(err, data) {
        if(err) {
          console.log(err);
          console.log(data);
          db.close() ;
          res.status(503).send("Some error occured. Try after some time.")
        }
        else {
          // now update in the user_uploads database
          user_uploads_roomstic.insert({"email_id":req.session._id, "_id": sticky_id}, function(err, data) {
            if(err) {
              console.log(err);
              console.log(data);
              // rollback the update made to the stick_details

              stick_details.remove({"_id":sticky_id}) ;
              res.status(503).send("Some error occured. Please try again.")
            }
            else {
              // now update the no_of_stickers in the user profile
              login_roomstic.update({"_id": req.session._id}, { $inc: {"no_of_stickers_uploaded":1}} , function(err, data) {
                if(err) {
                  // now rollback both the previous database updates
                  stick_details.remove({"_id":sticky_id}) ;
                  user_uploads_roomstic({"stick_id":sticky_id}) ;
                  res.status(503).send("Some error occured. Please try again.")
                }
                else {
                  req.session.no_of_stickers_uploaded+=1 ;
                  res.status(200).send(req.session._id+(req.session.no_of_stickers_uploaded-1)) ;
                  // sticky successfully created.
                  db.close() ;
                }
              })
            }
          })
        }
      })
    }
  })
});

router.post('/get_sticky_details', function(req, res) {
  console.log(req.body);
//  res.sendStatus(200) ;
  // find the uploader email_id
  mongo.connect(mongourl, function(err, db) {
    if(err) {
      // error occured. Abort the process
      res.status(500).send("Some error occured. Please try again")
    }
    else {
      var user_uploads_roomstic = db.collection('user_uploads_roomstic') ;
      user_uploads_roomstic.find({"_id": req.body.id}).toArray(function(err, docs) {
        if(err) {
          // could not find the uploader email_id. Abort the process
          res.sendStatus(500) ;
          db.close() ;
        }
        else {
          var email_id = docs[0].email_id ;
          var login_roomstic = db.collection('login_roomstic') ;

          // find out the username of the uploader
          login_roomstic.find({"_id": email_id}, {"username":1, "db_containing_profile_picture":1}).toArray(function(err, docs) {
            if(err) {
              // username not found. Cannot proceed.
              res.sendStatus(500) ;
              db.close() ;
            }
            else {
              var uploader_username = docs[0].username ;
              var db_containing_profile_picture = docs[0].db_containing_profile_picture ;

              // now find out the profile picture of the uploader

              var profile_picture_roomstic = db.collection('profile_picture_roomstic') ;

              var urlOfProfilePicture = "undefined" ;
              var ratings = "NotAvailable" ;

              profile_picture_roomstic.find({"_id": email_id}).toArray(function(err, docs) {
                if(err) {
                  // profile picture not found. May proceed further
                }
                if(docs.length>0) {
                  // profile picture is present ;
                  urlOfProfilePicture = docs[0].urlOfProfilePicture ;
                }

                // now we find out whether the current user has already rated this sticky or not.

                var current_user = req.session._id ;
                var sticky_id = req.body.id ;

                var user_ratings_roomstic = db.collection('user_ratings_roomstic') ;

                user_ratings_roomstic.find({"_id": sticky_id, "email_id": current_user}).toArray(function(err, docs) {
                  if(err) {
                    // details about the current user rating the sticky is not available. May proceed further.
                  }
                  else {
                    if(docs.length>0) {
                      // the user has previously rated the sticky.
                      ratings = docs[0].rating ;
                    }
                  }

                  // now send the data back to the front-end.

                  var results = {} ;
                  results.uploader_name = uploader_username ;
                  results.urlOfProfilePicture = urlOfProfilePicture ;
                  results.ratings_by_this_user = ratings ;

                  res.status(200).send(results) ;
                })
              })
            }
          })
        }
      })
    }
  })
})

router.post('/submit_user_review_for_sticky', function(req, res) {
  // req.body contains sticky_id, new_rating and previous_rating for the sticky by the current user.
  // we have to find out the uploader_details for the current sticky_id and update the no. of smiles/meh/frowns for the uploader_name
  // also, we have to update the user_ratings_roomstic for the sticky_id and the session_user.

  // if the previous_rating is "NotAvailable", then the session_user has not previously rated the sticky. In this case, we need to make a new entry
  // if the previous rating is not "NotAvailable", then we have to update the user_ratings_roomstic for the sticky and the user.

  // In any case of error, we will have to abort and rollback the transaction.

  let sticky_id = req.body.sticky_id ;
  let previous_rating = req.body.previous_rating ;  // we can use this rating to know whether the user had previously rated the sticky or not. If this is not undefined simply means that the user had previously rated and so we just decease the previous rating in stick_details database.
  let new_rating = req.body.new_rating ;

  console.log(req.body);
  mongo.connect(mongourl, function(err, db) {
    if(err) {
      // it means that the database could not be connected. Simple abort the procedure
      res.sendStatus(500) ;
    }
    else {
      let user_ratings_roomstic = db.collection('user_ratings_roomstic') ;
      user_ratings_roomstic.update({"_id":sticky_id, "email_id":req.session._id}, {"email_id": req.session._id,"rating": new_rating}, {upsert: true}, function(err,da) {
        if(err) {
          // some error occured. Abort the process
          res.sendStatus(500) ;
          db.close() ;
        }
        else {
          // now the sticky has been rated. We now update the no. of smiles/meh/frowns earned by the uploader. It is optional - desired but not required.

          let user_uploads_roomstic = db.collection('user_uploads_roomstic') ;
          let uploader_email_id = "" ;
          let login_roomstic = db.collection('login_roomstic') ;

          // finding the email_id of the uploader
          user_uploads_roomstic.find({"_id": sticky_id}).toArray(function(err, docs) {
            if(err) {
              // some error occured. Notify the user that action cannot be completed, but do not abort the process.
              db.close() ;
            }
            else {
              uploader_email_id = docs[0].email_id ;
              console.log("uploader for the sticky is "+uploader_email_id); // =============================//
            }
          })

          let stick_details = db.collection('stick_details') ;
          //if(new_rating === "smile") {
            stick_details.update({"_id": sticky_id}, { $inc: {[new_rating]: 1, [previous_rating]: -1}}, function(err, data) {
              if(err) {
                // this is a desired feature. So, rollback the whole transaction
                res.sendStatus(503) ;
                db.close() ;
              }
              else {
                login_roomstic.update({"_id": uploader_email_id}, { $inc : {[new_rating]: 1}}, function(err) {
                  db.close() ;
                  res.sendStatus(200) ;
                }) ; // neglecting the error as the feature is desired - not required
              }
            })
          //}
        }
      })
    }
  })
})

router.get('/list_sticky', function(req, res) {
  mongo.connect(mongourl, function(err, db) {
    if(err) {
      res.sendStatus(500) ;
    }
    else {
      var stick_details = db.collection('stick_details')  ;
      stick_details.find().toArray(function(err, docs) {
        if(err) {
          res.sendStatus(400) ;
          db.close() ;
        }
        else {
          res.json(docs) ;
        }
      })
    }
  })
})

router.post('/delete_sticky', function(req,res) {
  console.log("sticky to be deleted is ");
  console.log(req.body);

  let sticky_id = req.body._id ;

  mongo.connect(mongourl, function(err, db) {
    if(err) {
      // cannot be connected ;
      // return error page corresponding to request cannot be completed ;

      res.sendStatus(503) ;
    }
    else {
      let stick_details = db.collection('stick_details') ;
      stick_details.remove({"_id": sticky_id}, function(err,data) {
        if(err) {
          // some error occured. The sticky cannot be deleted.
          res.sendStatus(503) ;
          console.log(data);
        }
        else {
          // The sticky has been removed. Now clear the details from user_uploads_roomstic and user_ratings_roomstic
          let user_uploads_roomstic = db.collection('user_uploads_roomstic') ;
          user_uploads_roomstic.remove({"_id": sticky_id}, function(err, data) {
            // whether the details were successfully removed or not does not matter.

            let user_ratings_roomstic = db.collection('user_ratings_roomstic') ;
            user_ratings_roomstic.remove({"_id":sticky_id}, function(err, data) {
              // whether the details were successfully removed or not does not matter. It is a desired feature, but not required.
              db.close() ;
              res.sendStatus(200) ;
            })
          })
        }
      })
    }
  })
})

module.exports = router;
