const Game = require('../models/Game');
const { boardSpaces } = require('../config/boardData');

// Initialize a new game
exports.createGame = async (req, res) => {
  try {
    const gameId = 'game_' + Date.now();
    
    const newGame = new Game({
      gameId,
      player: {
        id: 'player',
        name: 'Player',
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0
      },
      computer: {
        id: 'computer',
        name: 'Computer',
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0
      },
      properties: boardSpaces.map(space => ({
        position: space.position,
        name: space.name,
        type: space.type,
        color: space.color,
        price: space.price || 0,
        owner: null,
        houses: 0,
        mortgaged: false
      })),
      currentTurn: 'player',
      gameStatus: 'active',
      messageLog: ['Game started! Player goes first.']
    });

    await newGame.save();
    res.json(newGame);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get game state
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Roll dice and move
exports.rollDice = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.gameStatus !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }

    const currentPlayer = game.currentTurn === 'player' ? game.player : game.computer;
    
    // Roll two dice
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const diceTotal = dice1 + dice2;
    
    game.lastDiceRoll = [dice1, dice2];
    
    // Move player
    const newPosition = (currentPlayer.position + diceTotal) % 40;
    const passedGo = newPosition < currentPlayer.position;
    
    currentPlayer.position = newPosition;
    
    // Collect $200 for passing GO
    if (passedGo) {
      currentPlayer.money += 200;
      game.messageLog.push(`${currentPlayer.name} passed GO and collected $200!`);
    }
    
    game.messageLog.push(`${currentPlayer.name} rolled ${dice1} and ${dice2} (total: ${diceTotal})`);
    
    const landedSpace = boardSpaces.find(s => s.position === newPosition);
    game.messageLog.push(`${currentPlayer.name} landed on ${landedSpace.name}`);
    
    // Handle landing on property
    const property = game.properties.find(p => p.position === newPosition);
    if (property && property.type === 'property' && !property.owner) {
      game.messageLog.push(`${landedSpace.name} is available for $${property.price}`);
    } else if (property && property.owner && property.owner !== game.currentTurn) {
      // Pay rent
      const rentAmount = calculateRent(property, game);
      if (rentAmount > 0) {
        currentPlayer.money -= rentAmount;
        const owner = property.owner === 'player' ? game.player : game.computer;
        owner.money += rentAmount;
        game.messageLog.push(`${currentPlayer.name} paid $${rentAmount} rent to ${owner.name}`);
      }
    }
    
    // Handle special spaces
    if (landedSpace.type === 'go_to_jail') {
      currentPlayer.position = 10;
      currentPlayer.inJail = true;
      currentPlayer.jailTurns = 0;
      game.messageLog.push(`${currentPlayer.name} went to jail!`);
    } else if (landedSpace.type === 'tax') {
      currentPlayer.money -= landedSpace.amount;
      game.messageLog.push(`${currentPlayer.name} paid $${landedSpace.amount} in taxes`);
    }
    
    // Check for bankruptcy
    if (currentPlayer.money < 0) {
      game.gameStatus = game.currentTurn === 'player' ? 'lost' : 'won';
      game.winner = game.currentTurn === 'player' ? 'computer' : 'player';
      game.messageLog.push(`${currentPlayer.name} is bankrupt! Game over!`);
    }
    
    game.updatedAt = Date.now();
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buy property
exports.buyProperty = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const currentPlayer = game.currentTurn === 'player' ? game.player : game.computer;
    const property = game.properties.find(p => p.position === currentPlayer.position);
    
    if (!property || (property.type !== 'property' && property.type !== 'railroad' && property.type !== 'utility')) {
      return res.status(400).json({ error: 'Not a purchasable property' });
    }
    
    if (property.owner) {
      return res.status(400).json({ error: 'Property already owned' });
    }
    
    if (currentPlayer.money < property.price) {
      return res.status(400).json({ error: 'Not enough money' });
    }
    
    currentPlayer.money -= property.price;
    property.owner = game.currentTurn;
    currentPlayer.properties.push(property.position);
    
    game.messageLog.push(`${currentPlayer.name} bought ${property.name} for $${property.price}`);
    
    game.updatedAt = Date.now();
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// End turn
exports.endTurn = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Switch turns
    game.currentTurn = game.currentTurn === 'player' ? 'computer' : 'player';
    game.messageLog.push(`${game.currentTurn === 'player' ? 'Player' : 'Computer'}'s turn`);
    
    game.updatedAt = Date.now();
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Computer AI turn
exports.computerTurn = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.currentTurn !== 'computer') {
      return res.status(400).json({ error: 'Not computer\'s turn' });
    }

    // Computer rolls dice
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const diceTotal = dice1 + dice2;
    
    game.lastDiceRoll = [dice1, dice2];
    
    const newPosition = (game.computer.position + diceTotal) % 40;
    const passedGo = newPosition < game.computer.position;
    
    game.computer.position = newPosition;
    
    if (passedGo) {
      game.computer.money += 200;
      game.messageLog.push('Computer passed GO and collected $200!');
    }
    
    game.messageLog.push(`Computer rolled ${dice1} and ${dice2} (total: ${diceTotal})`);
    
    const landedSpace = boardSpaces.find(s => s.position === newPosition);
    game.messageLog.push(`Computer landed on ${landedSpace.name}`);
    
    const property = game.properties.find(p => p.position === newPosition);
    
    // Computer AI decision making
    if (property && (property.type === 'property' || property.type === 'railroad' || property.type === 'utility') && !property.owner) {
      // Computer buys if it has enough money and the price is reasonable
      if (game.computer.money >= property.price * 1.5) {
        game.computer.money -= property.price;
        property.owner = 'computer';
        game.computer.properties.push(property.position);
        game.messageLog.push(`Computer bought ${property.name} for $${property.price}`);
      } else {
        game.messageLog.push(`Computer declined to buy ${property.name}`);
      }
    } else if (property && property.owner === 'player') {
      const rentAmount = calculateRent(property, game);
      if (rentAmount > 0) {
        game.computer.money -= rentAmount;
        game.player.money += rentAmount;
        game.messageLog.push(`Computer paid $${rentAmount} rent to Player`);
      }
    }
    
    // Handle special spaces
    if (landedSpace.type === 'go_to_jail') {
      game.computer.position = 10;
      game.computer.inJail = true;
      game.computer.jailTurns = 0;
      game.messageLog.push('Computer went to jail!');
    } else if (landedSpace.type === 'tax') {
      game.computer.money -= landedSpace.amount;
      game.messageLog.push(`Computer paid $${landedSpace.amount} in taxes`);
    }
    
    // Check for bankruptcy
    if (game.computer.money < 0) {
      game.gameStatus = 'won';
      game.winner = 'player';
      game.messageLog.push('Computer is bankrupt! Player wins!');
    }
    
    // End computer's turn
    game.currentTurn = 'player';
    game.messageLog.push("Player's turn");
    
    game.updatedAt = Date.now();
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate rent
function calculateRent(property, game) {
  if (property.mortgaged) return 0;
  
  if (property.type === 'property') {
    const boardSpace = boardSpaces.find(s => s.position === property.position);
    if (!boardSpace || !boardSpace.rent) return 0;
    return boardSpace.rent[property.houses] || boardSpace.rent[0];
  } else if (property.type === 'railroad') {
    const owner = property.owner === 'player' ? game.player : game.computer;
    const railroadCount = game.properties.filter(p => p.type === 'railroad' && p.owner === property.owner).length;
    const boardSpace = boardSpaces.find(s => s.position === property.position);
    if (!boardSpace || !boardSpace.rent) return 0;
    return boardSpace.rent[railroadCount - 1] || 25;
  } else if (property.type === 'utility') {
    const owner = property.owner === 'player' ? game.player : game.computer;
    const utilityCount = game.properties.filter(p => p.type === 'utility' && p.owner === property.owner).length;
    const lastRoll = game.lastDiceRoll[0] + game.lastDiceRoll[1];
    return utilityCount === 2 ? lastRoll * 10 : lastRoll * 4;
  }
  
  return 0;
}

module.exports = exports;
