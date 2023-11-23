var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/signin', function(req, res, next) {
  res.render('users/signin');
});

module.exports = router;
