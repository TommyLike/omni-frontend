let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'OmniBuildPlatform Frontend' });
});

module.exports = router;
