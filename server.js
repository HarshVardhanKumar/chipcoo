var express = require('express');
var router = express.Router();
var session = require('express-session');

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

router.use(function (req, res, next) {
  if (!req.session.username) {
    req.session.username="";
    req.session._id = "" ;
    req.session.usertype = "unauthorized" ; // distinguishes between the requests of an authorized and unauthorized users.
    req.session.no_of_stickers_uploaded = 0 ;
    req.session.db_containing_profile_picture = 0 ;
  }
  next()
})

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(__dirname) ;
  res.sendFile(__dirname+'/views/index.html') ;
});

/*for serving static files */
router.get('/public/stylesheets/:filename', function(req, res){
  res.sendFile(__dirname+'/public/stylesheets/'+req.params.filename) ;
})
router.get('/public/javascripts/:filename', function(req, res) {
  res.sendFile(__dirname+'/public/javascripts/'+req.params.filename) ;
})
router.get('/public/images/:filename', function(req, res) {
  res.sendFile(__dirname+'/public/images/'+req.params.filename) ;
})


module.exports = router;
