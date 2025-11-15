const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Game routes
router.post('/game/create', gameController.createGame);
router.get('/game/:gameId', gameController.getGame);
router.post('/game/:gameId/roll', gameController.rollDice);
router.post('/game/:gameId/buy', gameController.buyProperty);
router.post('/game/:gameId/endturn', gameController.endTurn);
router.post('/game/:gameId/computer-turn', gameController.computerTurn);

module.exports = router;
