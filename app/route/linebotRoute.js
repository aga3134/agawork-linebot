var express = require('express');
var router = express.Router();
var LinebotController = require('../controller/linebotController');

router.get('/', (req, res) => {
  Promise
    .all(req.body.events.map(LinebotController.HandleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

module.exports = router;