class Unit {
    constructor(name, stats) {
        this.name = name;
        this.stats = stats;
        this.skills = skills;
        this.position = { x: 0, y: 0 };
        this.isDefending = false;
    }

    rollInitiative() {
        return Math.floor(Math.random() * 20) + 1 + this.stats.dexterity;
    }

    moveTo(destination) {
        const distance = this.calculateDistance(destination);
        if (distance <= this.stats.movement) {
            this.position = destination;
            return true;
        }
        return false;
    }

    calculateDistance(destination) {
        return Math.abs(destination.x - this.position.x) + Math.abs(destination.y - this.position.y);
    }

    attack(target) {
        if (this.calculateDistance(target.position) <= this.stats.attackRange) {
            // ... Perform attack calculations (damage, hit chance, etc.)
            // ... Apply damage to the target
            return true;
        }
        return false;
    }

    defend() {
        this.isDefending = true;
    }

    isDefeated() {
        return this.stats.HP <= 0;
    }

    useSkill(skill, target) {
        if (this.calculateDistance(target.position) <= skill.range) {
            // ... Perform skill calculations (healing, buffing, debuffing, etc.)
            // ... Apply skill effects to the target
            return true;
        }
        return false;
    }
}

class Grid {
    constructor(size) {
        this.size = size;
        this.grid = this.initGrid(size);
    }

    initGrid(size) {
        const grid = new Array(size);
        for (let i = 0; i < size; i++) {
            grid[i] = new Array(size).fill(null);
        }
        return grid;
    }
    // Place a unit on the grid at a specified position
    placeUnit(unit, x, y) {
        if (this.isPositionValid(x, y) && !this.isSquareOccupied(x, y)) {
            this.grid[y][x] = unit;
            unit.setPosition(x, y);
        } else {
            throw new Error('Cannot place unit on an occupied square or outside the grid boundaries.');
        }
    }
    // Place a terrain object on the grid at a specified position
    placeTerrain(terrain, x, y) {
        // Check if the position is within the grid and not occupied
        if (this.isPositionValid(x, y) && !this.isSquareOccupied(x, y)) {
            this.grid[y][x] = terrain;
        } else {
            throw new Error('Cannot place terrain on an occupied square or outside the grid boundaries.');
        }
    }
    // Remove a unit from the grid
    removeUnit(unit) {
        const { x, y } = unit.getPosition();
        if (this.isPositionValid(x, y) && this.isSquareOccupied(x, y)) {
            this.grid[y][x] = null;
            unit.setPosition(null, null);
        } else {
            throw new Error('Cannot remove unit from an invalid position or unoccupied square.');
        }
    }
    // Check if a grid square is occupied by a unit or terrain object
    isSquareOccupied(x, y) {
        return this.isPositionValid(x, y) && this.grid[y][x] !== null;
    }
    // Get the unit at a specified position on the grid
    getUnitAt(x, y) {
        return this.isPositionValid(x, y) ? this.grid[y][x] : null;
    }
    // Get the terrain object at a specified position on the grid
    getTerrainAt(x, y) {
        return this.isPositionValid(x, y) ? this.grid[y][x] : null;
    }
    isPositionValid(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    render() {
        const gridContainer = document.createElement('div');
        gridContainer.id = 'grid-container';

        for (let y = 0; y < this.grid.size; y++) {
            for (let x = 0; x < this.grid.size; x++) {
                const square = document.createElement('div');
                square.className = 'grid-square';
                square.dataset.x = x;
                square.dataset.y = y;

                const squareContent = document.createElement('div');
                squareContent.className = 'square-content';

                const unit = this.grid.getUnitAt(x, y);
                const terrain = this.grid.getTerrainAt(x, y);

                if (unit) {
                    squareContent.style.backgroundColor = unit.team.color;
                    squareContent.textContent = unit.name;
                } else if (terrain) {
                    squareContent.style.backgroundColor = terrain.color;
                    squareContent.textContent = terrain.name;
                }

                square.appendChild(squareContent);
                gridContainer.appendChild(square);
            }
        }

        const existingGrid = document.querySelector('#grid-container');
        if (existingGrid) {
            existingGrid.replaceWith(gridContainer);
        } else {
            document.querySelector('#container').appendChild(gridContainer);
        }

        this.renderUnitInfo();
    }

}

class Terrain {
    constructor(name) {
        this.name = name;
    }
}

class Combat {
    // Constructor takes a grid and an array of teams as input
    constructor(grid, teams) {
        this.grid = grid;
        this.teams = teams;
        this.turnOrder = this.initTurnOrder();
        this.currentTurnIndex = 0;
    }

    // Initializes the turn order based on unit initiative
    initTurnOrder() {
        const units = this.teams.flatMap(team => team.units);
        units.sort((a, b) => b.initiative - a.initiative);
        return units;
    }

    // Returns the unit whose turn it is
    getCurrentUnit() {
        return this.turnOrder[this.currentTurnIndex];
    }

    // Advances to the next unit's turn
    nextTurn() {
        this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
    }

    handleCommand(command, target) {
        switch (command) {
            case 'move':
                // Get the destination coordinates from the user's click event
                const destination = {
                    x: parseInt(target.getAttribute('data-x')),
                    y: parseInt(target.getAttribute('data-y'))
                };

                // Check if the destination is valid
                if (this.isValidMove(destination)) {
                    // Move the unit to the destination
                    this.activeUnit.moveTo(destination);

                    // Update the game state and render the changes
                    this.changeState(GameState.UPDATE);
                    this.render();
                }
                break;
            case 'attack':
                // Get the target unit from the clicked grid square
                const targetUnit = this.getUnitAtPosition({
                    x: parseInt(target.getAttribute('data-x')),
                    y: parseInt(target.getAttribute('data-y'))
                });

                // Perform the attack if a valid target is selected
                if (targetUnit) {
                    this.activeUnit.attack(targetUnit);

                    // Update the game state and render the changes
                    this.changeState(GameState.UPDATE);
                    this.render();
                }
                break;
            case 'use skill':
                // Get the target unit from the clicked grid square
                const targetUnitForSkill = this.getUnitAtPosition({
                    x: parseInt(target.getAttribute('data-x')),
                    y: parseInt(target.getAttribute('data-y'))
                });

                // Get the selected skill from the unit's list of skills
                const selectedSkill = this.activeUnit.skills[this.selectedSkillIndex];

                // Perform the skill if a valid target is selected
                if (targetUnitForSkill) {
                    this.activeUnit.useSkill(selectedSkill, targetUnitForSkill);

                    // Update the game state and render the changes
                    this.changeState(GameState.UPDATE);
                    this.render();
                }
                break;
        }
    }

    // Helper method to check if the destination is a valid move
    isValidMove(destination) {
        // Check if the destination is within the unit's movement range
        const distance = this.activeUnit.calculateDistance(destination);
        if (distance > this.activeUnit.stats.movement) {
            return false;
        }

        // Check if the destination is occupied by another unit or an obstacle
        for (const unit of this.units) {
            if (unit.position.x === destination.x && unit.position.y === destination.y) {
                return false;
            }
        }

        // The destination is valid
        return true;
    }

    // Helper method to get a unit at a specific position
    getUnitAtPosition(position) {
        for (const unit of this.units) {
            if (unit.position.x === position.x && unit.position.y === position.y) {
                return unit;
            }
        }
        return null;
    }


    // Executes an action for the current unit, validating action type, range, and target
    async executeAction(unit, actionType, target, x, y) {
        if (unit === this.getCurrentUnit()) {
            if (actionType === 'move') {
                const destination = { x, y };
                if (unit.moveTo(destination)) {
                    this.grid.removeUnit(unit);
                    this.grid.placeUnit(unit, x, y);
                } else {
                    throw new Error('Invalid move. The target square is out of range or occupied.');
                }
            } else if (actionType === 'attack') {
                const targetUnit = this.grid.getUnitAt(x, y);
                if (targetUnit) {
                    unit.attack(targetUnit);
                } else {
                    throw new Error('Invalid target. There is no unit at the target square.');
                }
            } else if (actionType === 'defend') {
                unit.defend();
            } else if (actionType === 'useSkill') {
                const targetUnit = this.grid.getUnitAt(x, y);
                if (targetUnit) {
                    unit.useSkill(target, targetUnit);
                } else {
                    throw new Error('Invalid target. There is no unit at the target square.');
                }
            } else {
                throw new Error('Invalid action type.');
            }

            // Proceed to the next unit's turn
            this.nextTurn();
            // Render the updated grid
            this.render();
        } else {
            throw new Error('It is not this unit\'s turn.');
        }


    }

    renderUnitInfo() {
        const unitInfoContainer = document.createElement('div');
        unitInfoContainer.id = 'unit-info-container';

        for (const unit of this.turnOrder) {
            const unitCard = document.createElement('div');
            unitCard.className = 'unit-card';

            if (unit.isDefeated()) {
                unitCard.classList.add('dead');
            }

            const unitName = document.createElement('div');
            unitName.className = 'unit-name';
            unitName.textContent = unit.name;
            unitCard.appendChild(unitName);

            const unitStats = document.createElement('div');
            unitStats.className = 'unit-stats';
            for (const [statName, statValue] of Object.entries(unit.stats)) {
                const stat = document.createElement('div');
                stat.className = 'stat';
                stat.textContent = `${statName}: ${statValue}`;
                unitStats.appendChild(stat);
            }
            unitCard.appendChild(unitStats);

            const skills = document.createElement('div');
            skills.className = 'skills';
            for (const skill of unit.skills) {
                const skillElement = document.createElement('div');
                skillElement.className = 'skill';
                skillElement.textContent = skill.name;

                skillElement.addEventListener('mouseenter', () => {
                    // Display skill description on hover
                    const skillDescription = `${skill.name}: ${skill.description}`;
                    document.querySelector('#input-prompt').textContent = skillDescription;
                });

                skillElement.addEventListener('mouseleave', () => {
                    // Clear skill description when not hovering
                    document.querySelector('#input-prompt').textContent = '';
                });

                skills.appendChild(skillElement);
            }
            unitCard.appendChild(skills);

            unitInfoContainer.appendChild(unitCard);
        }

        const existingUnitInfo = document.querySelector('#unit-info-container');
        if (existingUnitInfo) {
            existingUnitInfo.replaceWith(unitInfoContainer);
        } else {
            document.querySelector('#container').appendChild(unitInfoContainer);
        }
    }

    render() {
        const gridContainer = document.createElement('div');
        gridContainer.id = 'grid-container';

        for (let y = 0; y < this.grid.size; y++) {
            for (let x = 0; x < this.grid.size; x++) {
                const square = document.createElement('div');
                square.className = 'grid-square';

                const squareContent = document.createElement('div');
                squareContent.className = 'square-content';

                const unit = this.grid.getUnitAt(x, y);
                const terrain = this.grid.getTerrainAt(x, y);

                if (unit) {
                    squareContent.style.backgroundColor = unit.team.color;
                    squareContent.textContent = unit.name;
                } else if (terrain) {
                    squareContent.style.backgroundColor = terrain.color;
                    squareContent.textContent = terrain.name;
                }

                square.appendChild(squareContent);
                gridContainer.appendChild(square);
            }
        }
        for (let y = 0; y < this.grid.size; y++) {
            for (let x = 0; x < this.grid.size; x++) {
                const square = document.createElement('div');
                square.className = 'grid-square';
                square.dataset.x = x;
                square.dataset.y = y;
            }
        }
        const existingGrid = document.querySelector('#grid-container');
        if (existingGrid) {
            existingGrid.replaceWith(gridContainer);
        } else {
            document.querySelector('#container').appendChild(gridContainer);
        }

        this.renderUnitInfo();
    }
    // Returns true if combat is finished (i.e., any team has all of its units defeated)
    isCombatFinished() {
        return this.teams.some(team => team.units.every(unit => unit.isDefeated()));
    }
}

async function handleUserTurn(combat) {
    return new Promise(async (resolve) => {
        const currentUnit = combat.getCurrentUnit();
        if (currentUnit.isDefeated()) {
            combat.nextTurn();
            resolve();
            return;
        }

        const actionsMenu = document.createElement('div');
        actionsMenu.className = 'actions-menu';

        const actions = ['move', 'attack', 'defend', 'useSkill'];
        actions.forEach((action) => {
            const actionButton = document.createElement('button');
            actionButton.textContent = action;
            actionButton.addEventListener('click', async () => {
                if (action === 'defend') {
                    currentUnit.defend();
                    combat.nextTurn();
                    combat.render();
                    resolve();
                } else if (action === 'useSkill') {
                    showSkillsMenu(currentUnit, combat, resolve);
                } else {
                    highlightActionRange(currentUnit, action, combat);
                }
            });
            actionsMenu.appendChild(actionButton);
        });

        document.querySelector('#container').appendChild(actionsMenu);
    });
}

function showSkillsMenu(currentUnit, combat, resolve) {
    // Replace the actions menu with the skills menu
    const skillsMenu = document.createElement('div');
    skillsMenu.className = 'skills-menu';

    currentUnit.skills.forEach((skill) => {
        const skillButton = document.createElement('button');
        skillButton.textContent = skill.name;
        skillButton.addEventListener('click', async () => {
            highlightActionRange(currentUnit, 'useSkill', combat, skill);
        });
        skillsMenu.appendChild(skillButton);
    });

    document.querySelector('.actions-menu').replaceWith(skillsMenu);
}

function highlightActionRange(currentUnit, actionType, combat, skill = null) {
    const range = actionType === 'move' ? currentUnit.stats.movement
        : actionType === 'attack' ? currentUnit.stats.attackRange
            : skill.range;

    const { x: unitX, y: unitY } = currentUnit.position;
    for (let y = 0; y < combat.grid.size; y++) {
        for (let x = 0; x < combat.grid.size; x++) {
            const square = document.querySelector(`.grid-square[data-x="${x}"][data-y="${y}"]`);
            if (currentUnit.calculateDistance({ x, y }) <= range) {
                square.classList.add('highlighted');
                square.addEventListener('click', async () => {
                    await combat.executeAction(currentUnit, actionType, skill, x, y);
                    clearHighlights(combat.grid.size);
                    combat.render();
                    resolve();
                });
            }
        }
    }
}

function clearHighlights(gridSize) {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const square = document.querySelector(`.grid-square[data-x="${x}"][data-y="${y}"]`);
            square.classList.remove('highlighted');
            square.removeEventListener('click');
        }
    }
}

function createCommandButtons() {
    const commandContainer = document.createElement("div");
    commandContainer.id = "command-container";

    const moveButton = document.createElement("button");
    moveButton.innerText = "Move";
    moveButton.addEventListener("click", () => {
        // Handle move command
    });

    const attackButton = document.createElement("button");
    attackButton.innerText = "Attack";
    attackButton.addEventListener("click", () => {
        // Handle attack command
    });

    const defendButton = document.createElement("button");
    defendButton.innerText = "Defend";
    defendButton.addEventListener("click", () => {
        // Handle defend command
    });

    const useSkillButton = document.createElement("button");
    useSkillButton.innerText = "Use Skill";
    useSkillButton.addEventListener("click", () => {
        // Handle use skill command
    });

    commandContainer.appendChild(moveButton);
    commandContainer.appendChild(attackButton);
    commandContainer.appendChild(defendButton);
    commandContainer.appendChild(useSkillButton);

    const container = document.getElementById("container");
    container.appendChild(commandContainer);
}


async function mainCombat(parsedCombatData) {
    const gridSize = parsedCombatData.gridSize;
    const teamsData = parsedCombatData.teams;
    const terrainData = parsedCombatData.terrain;

    const grid = new Grid(gridSize);
    createCommandButtons();

    const teams = teamsData.map(teamData => {
        const teamUnits = teamData.units.map(unitData => {
            const unit = new Unit(unitData.name, unitData.stats);
            grid.placeUnit(unit, unitData.position.x, unitData.position.y);
            return unit;
        });

        return {
            color: teamData.color,
            units: teamUnits,
        };
    });

    for (const terrainObj of terrainData) {
        const terrain = new Terrain(terrainObj.name);
        grid.placeTerrain(terrain, terrainObj.position.x, terrainObj.position.y);
    }

    setupGridListeners();
    const combat = new Combat(grid, teams);

    combat.render();

    // Main combat loop
    while (!combat.isCombatFinished()) {
        await handleUserTurn(combat);
    }
}


export { mainCombat };
