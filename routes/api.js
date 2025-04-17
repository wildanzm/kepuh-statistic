const express = require('express');
const router = express.Router();
const db = require('../database/db.js');


router.get('/', function(req, res, next) {
  res.render("index", { title: "Kepuh Statistic" });
});

module.exports = router;
