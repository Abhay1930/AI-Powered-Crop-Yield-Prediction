const express = require('express');
const router = express.Router();
const { addFarmData, getFarmData } = require('../controllers/farmController');

router.post('/', addFarmData);
router.get('/:farmerId', getFarmData);

module.exports = router;
