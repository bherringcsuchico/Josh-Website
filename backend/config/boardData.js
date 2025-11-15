// Monopoly board configuration
const boardSpaces = [
  { position: 0, name: "GO", type: "go", color: null },
  { position: 1, name: "Mediterranean Avenue", type: "property", color: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250] },
  { position: 2, name: "Community Chest", type: "community_chest", color: null },
  { position: 3, name: "Baltic Avenue", type: "property", color: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450] },
  { position: 4, name: "Income Tax", type: "tax", color: null, amount: 200 },
  { position: 5, name: "Reading Railroad", type: "railroad", color: null, price: 200, rent: [25, 50, 100, 200] },
  { position: 6, name: "Oriental Avenue", type: "property", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550] },
  { position: 7, name: "Chance", type: "chance", color: null },
  { position: 8, name: "Vermont Avenue", type: "property", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550] },
  { position: 9, name: "Connecticut Avenue", type: "property", color: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600] },
  { position: 10, name: "Just Visiting/Jail", type: "jail", color: null },
  { position: 11, name: "St. Charles Place", type: "property", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750] },
  { position: 12, name: "Electric Company", type: "utility", color: null, price: 150 },
  { position: 13, name: "States Avenue", type: "property", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750] },
  { position: 14, name: "Virginia Avenue", type: "property", color: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900] },
  { position: 15, name: "Pennsylvania Railroad", type: "railroad", color: null, price: 200, rent: [25, 50, 100, 200] },
  { position: 16, name: "St. James Place", type: "property", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950] },
  { position: 17, name: "Community Chest", type: "community_chest", color: null },
  { position: 18, name: "Tennessee Avenue", type: "property", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950] },
  { position: 19, name: "New York Avenue", type: "property", color: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000] },
  { position: 20, name: "Free Parking", type: "free_parking", color: null },
  { position: 21, name: "Kentucky Avenue", type: "property", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050] },
  { position: 22, name: "Chance", type: "chance", color: null },
  { position: 23, name: "Indiana Avenue", type: "property", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050] },
  { position: 24, name: "Illinois Avenue", type: "property", color: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100] },
  { position: 25, name: "B&O Railroad", type: "railroad", color: null, price: 200, rent: [25, 50, 100, 200] },
  { position: 26, name: "Atlantic Avenue", type: "property", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150] },
  { position: 27, name: "Ventnor Avenue", type: "property", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150] },
  { position: 28, name: "Water Works", type: "utility", color: null, price: 150 },
  { position: 29, name: "Marvin Gardens", type: "property", color: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200] },
  { position: 30, name: "Go To Jail", type: "go_to_jail", color: null },
  { position: 31, name: "Pacific Avenue", type: "property", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275] },
  { position: 32, name: "North Carolina Avenue", type: "property", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275] },
  { position: 33, name: "Community Chest", type: "community_chest", color: null },
  { position: 34, name: "Pennsylvania Avenue", type: "property", color: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400] },
  { position: 35, name: "Short Line Railroad", type: "railroad", color: null, price: 200, rent: [25, 50, 100, 200] },
  { position: 36, name: "Chance", type: "chance", color: null },
  { position: 37, name: "Park Place", type: "property", color: "darkblue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500] },
  { position: 38, name: "Luxury Tax", type: "tax", color: null, amount: 100 },
  { position: 39, name: "Boardwalk", type: "property", color: "darkblue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000] }
];

// Chance cards
const chanceCards = [
  { type: 'move', description: 'Advance to GO (Collect $200)', action: 'go' },
  { type: 'move', description: 'Advance to Illinois Avenue', action: 24 },
  { type: 'move', description: 'Advance to St. Charles Place', action: 11 },
  { type: 'move_nearest', description: 'Advance to nearest Railroad', action: 'railroad' },
  { type: 'move_nearest', description: 'Advance to nearest Utility', action: 'utility' },
  { type: 'money', description: 'Bank pays you dividend of $50', action: 50 },
  { type: 'money', description: 'Get Out of Jail Free', action: 'jail_free' },
  { type: 'move_back', description: 'Go Back 3 Spaces', action: -3 },
  { type: 'go_to_jail', description: 'Go to Jail', action: 'jail' },
  { type: 'money', description: 'Pay poor tax of $15', action: -15 },
  { type: 'move', description: 'Take a trip to Reading Railroad', action: 5 },
  { type: 'move', description: 'Advance to Boardwalk', action: 39 },
  { type: 'money', description: 'You have been elected Chairman of the Board. Pay each player $50', action: 'pay_players' },
  { type: 'money', description: 'Your building loan matures. Collect $150', action: 150 },
  { type: 'money', description: 'You have won a crossword competition. Collect $100', action: 100 }
];

// Community Chest cards
const communityChestCards = [
  { type: 'move', description: 'Advance to GO (Collect $200)', action: 'go' },
  { type: 'money', description: 'Bank error in your favor. Collect $200', action: 200 },
  { type: 'money', description: 'Doctor\'s fees. Pay $50', action: -50 },
  { type: 'money', description: 'From sale of stock you get $50', action: 50 },
  { type: 'money', description: 'Get Out of Jail Free', action: 'jail_free' },
  { type: 'go_to_jail', description: 'Go to Jail', action: 'jail' },
  { type: 'money', description: 'Grand Opera Night. Collect $50 from every player', action: 'collect_players' },
  { type: 'money', description: 'Holiday Fund matures. Receive $100', action: 100 },
  { type: 'money', description: 'Income tax refund. Collect $20', action: 20 },
  { type: 'money', description: 'Life insurance matures. Collect $100', action: 100 },
  { type: 'money', description: 'Pay hospital fees of $100', action: -100 },
  { type: 'money', description: 'Pay school fees of $150', action: -150 },
  { type: 'money', description: 'Receive $25 consultancy fee', action: 25 },
  { type: 'money', description: 'You are assessed for street repairs. $40 per house, $115 per hotel', action: 'street_repairs' },
  { type: 'money', description: 'You have won second prize in a beauty contest. Collect $10', action: 10 },
  { type: 'money', description: 'You inherit $100', action: 100 }
];

module.exports = { boardSpaces, chanceCards, communityChestCards };
