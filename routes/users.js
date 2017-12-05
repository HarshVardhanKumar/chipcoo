var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient ;
var dotenv = require('dotenv').config() ;
var mongourl = 'mongodb://'+process.env.DBUS+":"+process.env.DWORD+"@ds153113.mlab.com:53113/"+process.env.DBNAME
var cookieParser = require('cookie-parser') ;
var dataprocess = require('./data') ;
var session = require('express-session');
var cloudinary = require('cloudinary') ;
var fs = require('fs') ;


router.use(cookieParser()) ;
router.use(bodyParser.json());

cloudinary.config({
  cloud_name: 'harshvardhankumar',
  api_key: '547286795673241',
  api_secret: 'jRCAzfQ-kdupaWKF9zk3zt5Vvxo'
});

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

// for getting the user type (previously the user had loggedin or not)
router.get('/getUserType', function(req, res) {
  let result = {} ;
  result.usertype = req.session.usertype ;
  res.send(result) ;
  console.log(req.session.usertype);
  console.log("Called for getting the usertype");
})

// for creating the user
router.post('/create', function(req, res, next) {
  // connect with the database
/*{
    "_id": "email-id",
    "username": "username",
    "password": "password",
    "db_containing_profile_picture": "db_name",
    "no_of_stickers_uploaded": 1
}*/
  mongo.connect(mongourl, function(err, db) {
    if(err) {
      res.sendStatus(400) ;
      db.close() ;
    }
    else {
      var login_roomstic = db.collection('login_roomstic') ;
      login_roomstic.insert({"_id": req.body._id, "username": req.body.username, "password": req.body.password,"db_containing_profile_picture": 1, "no_of_stickers_uploaded": 0, "smiles":0, "meh":0, "frowns":0},function(err, data) {
        if(err) {
          //console.log(JSON.stringify(data));
          var datav = JSON.parse(JSON.stringify(data)) ;
          if(datav.writeErrors[0].errmsg.indexOf('duplicate key error index')>=0) {
            // duplicate key writeErrors
            res.status(400).send("User already exists. Please continue to login.") ;
          }
          else {
            res.status(400).send("Some error occured. Please try again.")
          }
        }
        else {
          res.cookie('nam',encodeDecodeCookie(req.body._id)) ;
          res.cookie('w',encodeDecodeCookie(req.body.password)) ;

          req.session._id = req.body._id ;
          req.session.username = req.body.username ;
          req.session.usertype = "authorized" ;
          req.session.db_containing_profile_picture = "NotAvailable" ;
          req.session.no_of_stickers_uploaded = 0 ;

          res.status(200).send("User successfully created") ;
        }
        db.close() ;
      })
    }
  })
});

router.post('/login', function(req, res, next) {
  console.log(req.body);
  console.log(req.cookies);

  mongo.connect(mongourl, function(err,db) {
    if(err) {
      res.status(400).send("Some error occured. Please try again.")
    }
    else {
      var login_roomstic = db.collection('login_roomstic') ;
      login_roomstic.find({"_id":req.body._id},{"username":1,"password":1,"db_containing_profile_picture":1,"no_of_stickers_uploaded":1}).toArray(function(err,docs) {
        if(err) {
          res.status(400).send("Some error occured. Please try again.") ;
        }
        else {
          if(docs.length==0) {
            res.status(200).send("No user details found. Please signup to continue.") ;
          }
          else {
            if(docs[0]["password"]==req.body.password) {
              // login successfully
              req.session._id = req.body._id ;
              req.session.username = docs[0]["username"] ;
              req.session.usertype = "authorized" ;
              req.session.db_containing_profile_picture = docs[0].db_containing_profile_picture ;
              req.session.no_of_stickers_uploaded = docs[0].no_of_stickers_uploaded ;

              console.log("after setting the session variables ");
              console.log(req.session);

              res.cookie('nam',encodeDecodeCookie(req.body._id)) ;
              res.cookie('w',encodeDecodeCookie(req.body.password))
              res.status(200).send("done") ;
            }
            else {
              res.status(400).send("Invalid password. Please try again.") ;
            }
          }
        }
      })
    }
  })
});

router.get('/logout', function(req, res) {
  res.clearCookie('nam') ;
  res.clearCookie('w') ;

  req.session.username="";
  req.session._id = "" ;
  req.session.usertype = "unauthorized" ; // distinguishes between the requests of an authorized and unauthorized users.
  req.session.no_of_stickers_uploaded = 0 ;
  req.session.db_containing_profile_picture = 0 ;

  req.session.destroy() ;
  res.sendStatus(200) ;
})

router.post('/get_user_details', function(req, res) {
  let result = {} ;
  console.log(req.body);
  if (req.body.current_user === "current_user" && req.body.sticky_id === "undefined" && req.session.username !== "") {
    console.log("current user is called");
    result.user_name = req.session.username ;
    let email_id_current_user = req.session._id ;
    // finding out the profile_picture
    result.access_type = "authorized" ;
    mongo.connect(mongourl, function(err, db) {
      if(err) {
        res.sendStatus(503) ;
        db.close() ;
      }
      else {
        let login_roomstic = db.collection('login_roomstic') ;
        login_roomstic.find({"_id": email_id_current_user}).toArray(function(err, docs) {
          if(err) {
            res.sendStatus(503) ;
            db.close() ;
          }
          else {
            result.no_of_stickers_uploaded = docs[0].no_of_stickers_uploaded ;
            result.db_containing_profile_picture = docs[0].db_containing_profile_picture ;
            result.smile = docs[0].smile ;
            result.meh = docs[0].meh ;
            result.frown = docs[0].frown ;
            result.user_description = docs[0].description ;
            // now find the profile picture
            result.urlOfProfilePicture = "default" ;

            let profile_picture_roomstic = db.collection('profile_picture_roomstic') ;
            profile_picture_roomstic.find({"_id": email_id_current_user}).toArray(function(err, docs) {
              if(err) {
                // optional feature, display the default profile_picture ;
              }
              else {
                if(docs.length>0) {
                  result.urlOfProfilePicture = docs[0].profile_picture ;
                }
              }

              // now findout the list of all the stickys uploaded by the user.

              let user_uploads_roomstic = db.collection("user_uploads_roomstic") ;
              user_uploads_roomstic.find({"email_id": email_id_current_user}).toArray(function(err, docs) {
                result.sticky_id_s = docs ;
                res.json(result) ;
                console.log(result);
                db.close() ;
              })
            })

          }
        })
      }
    })
  }

  else if(req.body.sticky_id !== "undefined") {
    let sticky_id = req.body.sticky_id ;
    // first find out the email_id of the uploader

    mongo.connect(mongourl, function(err, db) {
      if(err) {
        res.sendStatus(503) ;
        db.close() ;
      }
      else {
        let user_uploads_roomstic = db.collection("user_uploads_roomstic") ;
        user_uploads_roomstic.find({"_id": sticky_id}).toArray(function(err, docs) {
          if(err) {
            res.sendStatus(503) ;
            db.close() ;
          }
          else {
            let email_id = docs[0].email_id ;
            // now findout the details of the uploader

            let login_roomstic = db.collection('login_roomstic') ;
            login_roomstic.find({"_id": email_id}).toArray(function(err, docs) {
              if(err) {
                res.sendStatus(503) ;
                db.close() ;
              }
              else {
                result.access_type = "unauthorized" ;
                if(email_id === req.session._id) {
                  result.access_type = "authorized" ;
                }
                result.user_name = docs[0].username ;
                result.db_containing_profile_picture = docs[0].db_containing_profile_picture ;
                result.no_of_stickers_uploaded = docs[0].no_of_stickers_uploaded ;
                result.smile = docs[0].smile ;
                result.meh = docs[0].meh ;
                result.frown = docs[0].frown ;
                result.user_description = docs[0].description ;
                result.urlOfProfilePicture = "default" ;

                let profile_picture_roomstic = db.collection('profile_picture_roomstic') ;
                profile_picture_roomstic.find({"_id": email_id}).toArray(function(err, docs) {
                  if(err) {
                    // optional feature, display the default profile_picture ;
                  }
                  else {
                    if(docs.length>0) {
                      result.urlOfProfilePicture = docs[0].profile_picture ;
                    }
                  }

                  user_uploads_roomstic.find({"email_id": email_id}).toArray(function(err, docs) {
                    if(err) {
                      console.log("some error occured");
                      console.log(err);
                    }
                    result.sticky_id_s = docs ;
                    res.json(result) ;
                    console.log(result);
                    db.close() ;
                  })

                })

              }
            })
          }
        })
      }
    })
  }

  else res.redirect('/') ;
}) ;

router.post('/update_profile', function(req, res) {
  // the cloudinary supports uploading of base64 encoded strings upto 60mb.

  // uploading the base64 image ;
  cloudinary.v2.uploader.upload(req.body.user_image, function(error, result) {
    console.log(result);
    if(error) {
      res.sendStatus(503) ;
    }
    else {
      var descriptionoftheuser = req.body.description ;

      mongo.connect(mongourl, function(err, db) {
        if(err) {
          res.sendStatus(503) ;
        }
        else {
          let urlOfTheImage = result.secure_url ;
          // now save the data to two different stores.
          let email_id = req.session._id ;

          let login_roomstic = db.collection('login_roomstic') ;
          login_roomstic.update({"_id": email_id}, { $set: {"description": descriptionoftheuser}}, function(err, data) {
            if(err){
              // some error occured.
              res.sendStatus(503) ;
              db.close() ;
            }
            else {
              // description successfully updated. Now update the profile picture information
              let profile_picture_roomstic = db.collection('profile_picture_roomstic') ;
              profile_picture_roomstic.update({"_id": email_id}, {"profile_picture": urlOfTheImage},{upsert: true}, function(err, data) {
                if(err) {
                  // error occured.
                  console.log(err);
                  console.log(data);
                  res.sendStatus(503) ;
                }
                else {
                  res.sendStatus(200) ;
                  console.log("update successfull");
                }
              })
            }
          })
        }
      })
    }
  });
})

module.exports = router;
