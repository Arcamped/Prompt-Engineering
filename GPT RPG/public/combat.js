// Define the Unit class, which represents a combat unit in the game.
class Unit {
    constructor(stats, name) {
        this.stats = stats;
        this.position = { x: 0, y: 0 };
        this.name = name;
        this.skills = [];
    }

    // New method for adding skills to the unit
    addSkill(skill) {
        this.skills.push(skill);
    }
}

// Define some example skills for the units
const fireball = {
    name: 'Fireball',
    type: 'ranged',
    cost: 5,
    range: 'ranged',
    rangeValue: 5,
    action: (attacker, target) => {
        const damage = rollDice(8);
        target.stats.HP -= damage;
        console.log(`${attacker.name} casts Fireball and deals ${damage} damage to ${target.name}. ${target.name}'s HP: ${target.stats.HP}`);
    }
};

const charge = {
    name: 'Charge',
    type: 'melee',
    cost: 0,
    range: 'melee',
    rangeValue: 1,
    action: (attacker, target) => {
        const damage = rollDice(6) + attacker.stats.Strength;
        target.stats.HP -= damage;
        console.log(`${attacker.name} charges at ${target.name} and deals ${damage} damage. ${target.name}'s HP: ${target.stats.HP}`);
    }
};

const heal = {
    name: 'Heal',
    type: 'melee',
    cost: 3,
    range: 'melee',
    rangeValue: 1,
    action: (attacker, target) => {
        const healAmount = rollDice(8) + attacker.stats.Wisdom;
        target.stats.HP += healAmount;
        console.log(`${attacker.name} heals ${target.name} for ${healAmount} HP. ${target.name}'s HP: ${target.stats.HP}`);
    }
};



// Define the Grid class, which represents the game board where combat takes place
class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // Create a 2D array of size (height x width) to represent the grid.
        this.grid = Array.from({ length: height }, () => Array(width).fill(null));
    }

    // Place a unit at the specified position on the grid
    placeUnit(unit, x, y) {
        this.grid[y][x] = unit;
        unit.position = { x, y };
    }

    // Move a unit to the specified position on the grid
    moveUnit(unit, x, y) {
        // Check if the move is valid before actually moving the unit
        if (this.isValidMove(unit, x, y)) {
            // Remove the unit from its old position on the grid
            const { x: oldX, y: oldY } = unit.position;
            this.grid[oldY][oldX] = null;
            // Add the unit to its new position on the grid
            this.placeUnit(unit, x, y);
        }
    }

    // Check if a move is valid for a given unit
    isValidMove(unit, x, y) {
        // Calculate the distance between the starting position and the target position
        const { x: startX, y: startY } = unit.position;
        const distance = Math.abs(startX - x) + Math.abs(startY - y);

        // Check if the distance is within the unit's movement range
        if (distance > unit.stats.Movement) {
            return false;
        }

        // Check if the target position is already occupied by another unit
        if (this.unitAt(x, y) !== null) {
            return false;
        }

        // Check if there are any obstacles (other units) in the path between the starting and target positions
        const steps = Math.max(Math.abs(x - startX), Math.abs(y - startY));
        for (let i = 1; i < steps; i++) {
            const ix = startX + i * stepX;
            const iy = startY + i * stepY;
            if (this.grid[iy][ix] !== null) {
                return false;
            }
        }
        // If none of the above conditions were met, then the move is valid
        return true;
    }

    unitAt(x, y) {
        return this.grid[y][x];
    }

    // Add other grid management functions
}

/*
render() {
    let table = document.createElement('table');
    table.classList.add('grid');
    
    for (let y = 0; y < this.height; y++) {
        let row = table.insertRow(y);
        for (let x = 0; x < this.width; x++) {
            let cell = row.insertCell(x);
            if (this.grid[y][x] !== null) {
                cell.textContent = this.grid[y][x].name;
            } else {
                cell.textContent = '';
            }
        }
    }
    return table;
}
*/

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}
// Calculates the initiative order for a list of units by rolling a 20-sided die and adding the unit's dexterity score. Returns an array of the units in initiative order.
function calculateInitiative(units) {
    const initiatives = units.map((unit) => ({
        unit,
        initiative: rollDice(20) + unit.stats.Dexterity,
    }));

    initiatives.sort((a, b) => b.initiative - a.initiative);
    return initiatives.map((entry) => entry.unit);
}
// Calculates the damage dealt by a melee attack, subtracts it from the target's HP, and logs the result to the console.
function meleeAttack(attacker, target) {
    const damage = rollDice(6);
    target.stats.HP -= damage;
    console.log(`${attacker.name} deals ${damage} damage to ${target.name}. ${target.name}'s HP: ${target.stats.HP}`);
}
// Calculates the damage dealt by a ranged attack, subtracts it from the target's HP, and logs the result to the console.
function rangedAttack(attacker, target) {
    const damage = rollDice(4);
    target.stats.HP -= damage;
    console.log(`${attacker.name} deals ${damage} damage to ${target.name}. ${target.name}'s HP: ${target.stats.HP}`);
}
// Returns true if two units are adjacent to each other on the grid, meaning they are within one tile of each other horizontally, vertically, or diagonally.
function isAdjacent(unit1, unit2) {
    const { x: x1, y: y1 } = unit1.position;
    const { x: x2, y: y2 } = unit2.position;
    return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
}
// Returns true if two units are adjacent to each other on the grid, meaning they are within one tile of each other horizontally, vertically, or diagonally.
function isWithinRange(unit1, unit2, range) {
    const { x: x1, y: y1 } = unit1.position;
    const { x: x2, y: y2 } = unit2.position;
    return Math.abs(x1 - x2) <= range && Math.abs(y1 - y2) <= range;
}
// Returns a promise that resolves to the user's input in response to a given prompt.
async function getInput(prompt) {
    return new Promise((resolve) => {
        const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(prompt, (input) => {
            rl.close();
            resolve(input);
        });
    });
}

// Implements a turn for a player-controlled unit, prompting the player to choose an action (move, attack, skill, or end) and executing the corresponding code.
async function playerTurn(player, enemies, grid) {
    let turnEnded = false;

    while (!turnEnded) {
        const action = await getInput(`${player.name}, choose an action (move, attack, skill, end): `);

        switch (action.toLowerCase()) {
            case 'move':
                const newX = parseInt(await getInput('Enter new X position: '), 10);
                const newY = parseInt(await getInput('Enter new Y position: '), 10);

                if (grid.isValidMove(player, newX, newY)) {
                    grid.moveUnit(player, newX, newY);
                    console.log(`${player.name} moved to (${newX}, ${newY})`);
                } else {
                    console.log('Invalid move. Please try again.');
                }
                break;

            case 'attack':
                const targetIndex = parseInt(await getInput('Choose target enemy (0-based index): '), 10);
                const target = enemies[targetIndex];

                if (!target) {
                    console.log('Invalid target. Please try again.');
                    break;
                }

                if (isAdjacent(player, target)) {
                    meleeAttack(player, target);
                } else if (isWithinRange(player, target, 5)) {
                    rangedAttack(player, target);
                } else {
                    console.log('Target is out of range. Please try again.');
                }
                break;

            case 'skill':
                const skillIndex = parseInt(await getInput('Choose a skill (0-based index) or enter "cancel" to cancel: '), 10);
                if (isNaN(skillIndex)) {
                    console.log('Invalid input. Please try again.');
                    continue;
                }

                if (skillIndex < 0 || skillIndex >= player.skills.length) {
                    console.log('Invalid skill index. Please try again.');
                    continue;
                }

                const skill = player.skills[skillIndex];

                if (skill.cost > player.stats.MP) {
                    console.log('Not enough MP. Please try again.');
                    continue;
                }

                if (skill.range === 'melee') {
                    const targetIndex = parseInt(await getInput('Choose target enemy (0-based index): '), 10);
                    const target = enemies[targetIndex];

                    if (!target) {
                        console.log('Invalid target. Please try again.');
                        continue;
                    }

                    if (isAdjacent(player, target)) {
                        skill.action(player, target);
                    } else {
                        console.log('Target is out of range. Please try again.');
                        continue;
                    }
                } else if (skill.range === 'ranged') {
                    const targetIndex = parseInt(await getInput('Choose target enemy (0-based index): '), 10);
                    const target = enemies[targetIndex];

                    if (!target) {
                        console.log('Invalid target. Please try again.');
                        continue;
                    }

                    if (isWithinRange(player, target, skill.rangeValue)) {
                        skill.action(player, target);
                    } else {
                        console.log('Target is out of range. Please try again.');
                        continue;
                    }
                } else if (skill.range === 'aoe') {
                    const targets = enemies.filter((enemy) => isWithinRange(player, enemy, skill.rangeValue));
                    skill.action(player, targets);
                }

                player.stats.MP -= skill.cost;
                console.log(`${player.name} used ${skill.name}. ${player.name}'s MP: ${player.stats.MP}`);
                break;


            case 'end':
                turnEnded = true;
                console.log(`${player.name}'s turn has ended.`);
                break;

            default:
                console.log('Invalid action. Please try again.');
        }
    }
}

// Implements a turn for a ChatGPT-controlled enemy unit, choosing an action based on the current game state and executing the corresponding code.
function chatgptTurn(enemy, allies, grid) {
    // Implement ChatGPT-controlled enemy's turn
}

// Runs a combat between two sides (allies and enemies), alternating turns between units and checking for defeat conditions (all allies defeated or all enemies defeated). Returns the name of the winning side.
async function combat(allies, enemies, grid) {
    const allUnits = allies.concat(enemies);
    while (true) {
        const initiativeOrder = calculateInitiative(allUnits);
        for (const unit of initiativeOrder) {
            if (allies.includes(unit)) {
                playerTurn(unit, enemies, grid);
            } else {
                chatgptTurn(unit, allies, grid);
            }

            // Check if one side has been defeated
            const alliesDefeated = allies.every((ally) => ally.stats.HP <= 0);
            const enemiesDefeated = enemies.every((enemy) => enemy.stats.HP <= 0);

            if (alliesDefeated || enemiesDefeated) {
                return alliesDefeated ? 'Enemies' : 'Allies';
            }
        }
    }
}

// Initializes the game elements, including the player, allies, enemies, and grid, places the units on the grid, and runs the combat loop. Logs the winner to the console at the end of the game.
async function mainCombat() {
    // Initialize game elements
    const playerStats = { Strength: 10, Dexterity: 10, Intelligence: 10, Constitution: 10, Wisdom: 10, Movement: 5, HP: 20, MP: 10 };
    const player = new Unit(playerStats, 'Player');
    const grid = new Grid(10, 10);

    // Initialize enemies and allies
    const allies = [player];
    const enemies = [new Unit({ ...playerStats, Dexterity: 8 }, 'Enemy 1'), new Unit({ ...playerStats, Dexterity: 12 }, 'Enemy 2')];

    // Add the skills to the unitscd
    player.addSkill(charge);
    player.addSkill(heal);
    enemies[0].addSkill(fireball);
    enemies[1].addSkill(charge);
    // Place units on the grid
    grid.placeUnit(player, 1, 1);
    grid.placeUnit(enemies[0], 8, 8);
    grid.placeUnit(enemies[1], 9, 9);

    // Run the combat
    const winner = combat(allies, enemies, grid);
    console.log(`The winner is: ${winner}`);
}

// combat();