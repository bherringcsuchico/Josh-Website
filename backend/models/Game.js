const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  position: Number,
  name: String,
  type: String,
  color: String,
  price: Number,
  owner: { type: String, default: null }, // 'player' or 'computer' or null
  houses: { type: Number, default: 0 },
  mortgaged: { type: Boolean, default: false }
});

const playerSchema = new mongoose.Schema({
  id: String,
  name: String,
  position: { type: Number, default: 0 },
  money: { type: Number, default: 1500 },
  properties: [Number],
  inJail: { type: Boolean, default: false },
  jailTurns: { type: Number, default: 0 }
});

const gameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  currentTurn: { type: String, default: 'player' }, // 'player' or 'computer'
  player: playerSchema,
  computer: playerSchema,
  properties: [propertySchema],
  gameStatus: { type: String, default: 'active' }, // 'active', 'won', 'lost'
  winner: { type: String, default: null },
  lastDiceRoll: { type: Array, default: [0, 0] },
  messageLog: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);
