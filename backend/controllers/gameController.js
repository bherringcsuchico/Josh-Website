const Game = require('../models/Game');
const { boardSpaces, chanceCards, communityChestCards } = require('../config/boardData');
const mongoose = require('mongoose');

// In-memory storage for when MongoDB is not available
const gamesStore = new Map();

// Helper to check if MongoDB is connected
const isMongoDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Helper to get game from storage
const getGameFromStorage = async (gameId) => {
  if (isMongoDBConnected()) {
    return await Game.findOne({ gameId });
  } else {
    return gamesStore.get(gameId);
  }
};

// Helper to save game to storage
const saveGameToStorage = async (game, gameId) => {
  if (isMongoDBConnected()) {
    game.updatedAt = Date.now();
    await game.save();
  } else {
    gamesStore.set(gameId, game);
  }
};

// Initialize a new game
exports.createGame = async (req, res) => {
  try {
    const gameId = 'game_' + Date.now();
    
    const gameData = {
      gameId,
      player: {
        id: 'player',
        name: 'Player',
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
        consecutiveDoubles: 0
      },
      computer: {
        id: 'computer',
        name: 'Computer',
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
        jailTurns: 0,
        consecutiveDoubles: 0
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
      messageLog: ['Game started! Player goes first.'],
      lastDiceRoll: null,
      winner: null,
      awaitingAction: false
    };

    if (isMongoDBConnected()) {
      const newGame = new Game(gameData);
      await newGame.save();
      res.json(newGame);
    } else {
      // Use in-memory storage
      gamesStore.set(gameId, gameData);
      res.json(gameData);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get game state
exports.getGame = async (req, res) => {
  try {
    const game = await getGameFromStorage(req.params.gameId);
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
    const game = await getGameFromStorage(req.params.gameId);
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
    } else if (landedSpace.type === 'chance') {
      processCard(game, 'chance', currentPlayer);
    } else if (landedSpace.type === 'community_chest') {
      processCard(game, 'community_chest', currentPlayer);
    } else if (landedSpace.type === 'jail') {
      if (!currentPlayer.inJail) {
        game.messageLog.push(`${currentPlayer.name} is just visiting jail.`);
      }
    }
    
    // Doubles & action phase logic for human player
    if (dice1 === dice2) {
      currentPlayer.consecutiveDoubles = (currentPlayer.consecutiveDoubles || 0) + 1;
      if (currentPlayer.consecutiveDoubles === 3) {
        currentPlayer.position = 10;
        currentPlayer.inJail = true;
        currentPlayer.jailTurns = 0;
        currentPlayer.consecutiveDoubles = 0;
        game.awaitingAction = false;
        game.messageLog.push(`${currentPlayer.name} rolled three doubles in a row and was sent to Jail!`);
        game.currentTurn = currentPlayer.id === 'player' ? 'computer' : 'player';
        game.messageLog.push(`Computer's turn`);
        console.log(`[DEBUG] Player rolled 3 doubles: awaitingAction=${game.awaitingAction}, currentTurn=${game.currentTurn}`);
      } else {
        game.awaitingAction = false;
        game.messageLog.push(`${currentPlayer.name} rolled doubles and gets another turn! (${currentPlayer.consecutiveDoubles} in a row)`);
        console.log(`[DEBUG] Player rolled doubles: awaitingAction=${game.awaitingAction}, currentTurn=${game.currentTurn}`);
      }
    } else {
      currentPlayer.consecutiveDoubles = 0;
      if (currentPlayer.id === 'player') {
        // Allow optional buy before auto-ending turn
        game.awaitingAction = true;
        game.messageLog.push('Awaiting player action (may buy property).');
        console.log(`[DEBUG] Player did not roll doubles: awaitingAction=${game.awaitingAction}, currentTurn=${game.currentTurn}`);
      } else {
        game.currentTurn = 'player';
        game.messageLog.push("Player's turn");
        console.log(`[DEBUG] Computer did not roll doubles: awaitingAction=${game.awaitingAction}, currentTurn=${game.currentTurn}`);
      }
    }

    // Check for bankruptcy
    if (currentPlayer.money < 0) {
      game.gameStatus = game.currentTurn === 'player' ? 'lost' : 'won';
      game.winner = game.currentTurn === 'player' ? 'computer' : 'player';
      game.messageLog.push(`${currentPlayer.name} is bankrupt! Game over!`);
    }
    
    await saveGameToStorage(game, req.params.gameId);
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buy property
exports.buyProperty = async (req, res) => {
  try {
    const game = await getGameFromStorage(req.params.gameId);
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

    // Auto-finish human action phase if present
    if (game.awaitingAction && game.currentTurn === 'player' && currentPlayer.consecutiveDoubles === 0) {
      game.awaitingAction = false;
      game.currentTurn = 'computer';
      game.messageLog.push("Computer's turn");
      console.log(`[DEBUG] buyProperty: awaitingAction=${game.awaitingAction}, currentTurn=${game.currentTurn}`);
    }
    
    await saveGameToStorage(game, req.params.gameId);
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// End turn
exports.endTurn = async (req, res) => {
  try {
    const game = await getGameFromStorage(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Switch turns
    game.currentTurn = game.currentTurn === 'player' ? 'computer' : 'player';
    game.messageLog.push(`${game.currentTurn === 'player' ? 'Player' : 'Computer'}'s turn`);
    
    await saveGameToStorage(game, req.params.gameId);
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Computer AI turn
exports.computerTurn = async (req, res) => {
  try {
    const game = await getGameFromStorage(req.params.gameId);
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
    } else if (landedSpace.type === 'chance') {
      processCard(game, 'chance', game.computer);
    } else if (landedSpace.type === 'community_chest') {
      processCard(game, 'community_chest', game.computer);
    } else if (landedSpace.type === 'jail') {
      if (!game.computer.inJail) {
        game.messageLog.push('Computer is just visiting jail.');
      }
    }
    
    // Doubles & turn logic for computer
    if (dice1 === dice2) {
      game.computer.consecutiveDoubles = (game.computer.consecutiveDoubles || 0) + 1;
      if (game.computer.consecutiveDoubles === 3) {
        game.computer.position = 10;
        game.computer.inJail = true;
        game.computer.jailTurns = 0;
        game.computer.consecutiveDoubles = 0;
        game.messageLog.push('Computer rolled three doubles in a row and was sent to Jail!');
        game.currentTurn = 'player';
        game.messageLog.push("Player's turn");
      } else {
        game.messageLog.push(`Computer rolled doubles and gets another turn! (${game.computer.consecutiveDoubles} in a row)`);
        // keep computer's turn
      }
    } else {
      game.computer.consecutiveDoubles = 0;
      game.currentTurn = 'player';
      game.messageLog.push("Player's turn");
    }

    // Check for bankruptcy
    if (game.computer.money < 0) {
      game.gameStatus = 'won';
      game.winner = 'player';
      game.messageLog.push('Computer is bankrupt! Player wins!');
    }
    
    await saveGameToStorage(game, req.params.gameId);
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

// Helper function to draw and process a card
function processCard(game, cardType, currentPlayer) {
  const cards = cardType === 'chance' ? chanceCards : communityChestCards;
  const card = cards[Math.floor(Math.random() * cards.length)];
  
  game.messageLog.push(`${currentPlayer.name} drew: ${card.description}`);
  
  switch (card.type) {
    case 'move':
      if (card.action === 'go') {
        currentPlayer.position = 0;
        currentPlayer.money += 200;
        game.messageLog.push(`${currentPlayer.name} advanced to GO and collected $200`);
      } else {
        const oldPosition = currentPlayer.position;
        currentPlayer.position = card.action;
        if (currentPlayer.position < oldPosition) {
          currentPlayer.money += 200;
          game.messageLog.push(`${currentPlayer.name} passed GO and collected $200`);
        }
        const landedSpace = boardSpaces.find(s => s.position === currentPlayer.position);
        game.messageLog.push(`${currentPlayer.name} moved to ${landedSpace.name}`);
      }
      break;
      
    case 'move_nearest':
      if (card.action === 'railroad') {
        const railroads = [5, 15, 25, 35];
        const nearest = railroads.find(r => r > currentPlayer.position) || railroads[0];
        const oldPosition = currentPlayer.position;
        currentPlayer.position = nearest;
        if (currentPlayer.position < oldPosition) {
          currentPlayer.money += 200;
          game.messageLog.push(`${currentPlayer.name} passed GO and collected $200`);
        }
        const landedSpace = boardSpaces.find(s => s.position === currentPlayer.position);
        game.messageLog.push(`${currentPlayer.name} moved to ${landedSpace.name}`);
      } else if (card.action === 'utility') {
        const utilities = [12, 28];
        const nearest = utilities.find(u => u > currentPlayer.position) || utilities[0];
        const oldPosition = currentPlayer.position;
        currentPlayer.position = nearest;
        if (currentPlayer.position < oldPosition) {
          currentPlayer.money += 200;
          game.messageLog.push(`${currentPlayer.name} passed GO and collected $200`);
        }
        const landedSpace = boardSpaces.find(s => s.position === currentPlayer.position);
        game.messageLog.push(`${currentPlayer.name} moved to ${landedSpace.name}`);
      }
      break;
      
    case 'move_back':
      currentPlayer.position = (currentPlayer.position + card.action + 40) % 40;
      const landedSpace = boardSpaces.find(s => s.position === currentPlayer.position);
      game.messageLog.push(`${currentPlayer.name} moved back to ${landedSpace.name}`);
      break;
      
    case 'go_to_jail':
      currentPlayer.position = 10;
      currentPlayer.inJail = true;
      currentPlayer.jailTurns = 0;
      game.messageLog.push(`${currentPlayer.name} went to jail!`);
      break;
      
    case 'money':
      if (card.action === 'jail_free') {
        game.messageLog.push(`${currentPlayer.name} received a Get Out of Jail Free card`);
      } else if (card.action === 'pay_players' || card.action === 'collect_players') {
        const otherPlayer = currentPlayer === game.player ? game.computer : game.player;
        const amount = 50;
        if (card.action === 'pay_players') {
          currentPlayer.money -= amount;
          otherPlayer.money += amount;
          game.messageLog.push(`${currentPlayer.name} paid $${amount} to ${otherPlayer.name}`);
        } else {
          currentPlayer.money += amount;
          otherPlayer.money -= amount;
          game.messageLog.push(`${currentPlayer.name} collected $${amount} from ${otherPlayer.name}`);
        }
      } else if (card.action === 'street_repairs') {
        let totalCost = 0;
        currentPlayer.properties.forEach(propPos => {
          const prop = game.properties.find(p => p.position === propPos);
          if (prop && prop.houses > 0) {
            if (prop.houses === 5) {
              totalCost += 115; // Hotel
            } else {
              totalCost += 40 * prop.houses;
            }
          }
        });
        currentPlayer.money -= totalCost;
        if (totalCost > 0) {
          game.messageLog.push(`${currentPlayer.name} paid $${totalCost} for repairs`);
        }
      } else {
        currentPlayer.money += card.action;
        if (card.action > 0) {
          game.messageLog.push(`${currentPlayer.name} received $${card.action}`);
        } else {
          game.messageLog.push(`${currentPlayer.name} paid $${Math.abs(card.action)}`);
        }
      }
      break;
  }
}

module.exports = exports;

// Finish action phase when player chooses to pass (auto-end if timeout on frontend)
exports.finishActionPhase = async (req, res) => {
  try {
    const game = await getGameFromStorage(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.currentTurn !== 'player') return res.status(400).json({ error: 'Not player's turn' });
    if (!game.awaitingAction) return res.status(400).json({ error: 'No pending action phase' });
    game.awaitingAction = false;
    game.currentTurn = 'computer';
    game.messageLog.push("Player chose not to act. Computer's turn");
    await saveGameToStorage(game, req.params.gameId);
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
