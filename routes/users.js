var express = require('express');
var router = express.Router();
var User =  require('../models/User');


/* GET users listing. */
router.get('/', function(req, res, next) {

  new User().where(function(query) {
    query.where('id > 1').orWhere('id = 1')
  }).where('name = "omer"').all(req, function(err, rows) {
    if (err) throw err;
    
    res.json(rows)
  })

});

router.get('/:id', function(req, res, next) {
  new User().find(req.params.id, function(err, rows) {
    if (err) throw err;
    
    res.json(rows)
  })

});

module.exports = router;
