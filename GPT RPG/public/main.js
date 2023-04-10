// The chatGPT function takes a prompt as input and uses the OpenAI API to generate a response. 
/// We still need to update max_tokens to take a specific parameter given the situation.
async function chatGPT(framing, prompt) {
    console.log(`framing: ${framing}`)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { 'role': 'system', 'content': framing },
                { 'role': 'user', 'content': prompt }
            ],
            max_tokens: 1024,
            n: 1,
            stop: null,
            temperature: 0.7,
        })
    });
    console.log('response before the json: ', response)
    const result = await response.json();
    console.log('result after the json: ', result)
    const resultText = result.choices[0].message.content.trim();
    console.log('resultText after we extract: ', resultText)
    return resultText;
}


async function isInCombat(response) {
    console.log(`In isInCombat function.`)
    // Frame a question for ChatGPT to determine if the response leads to combat
    const framing = 'You are a tool for a text-based RPG. Your task is to determine if the given text describes a combat situation. Respond with only "Yes" or "No" and no explanation.';
    const prompt = `Based on the following text, does it lead to a combat situation?\n\n${response}`;

    // Get the answer from ChatGPT
    const chatGPTResponse = await chatGPT(framing, prompt);

    // Check if the answer is "Yes" (combat) or "No" (non-combat)
    const isCombat = chatGPTResponse.trim().toLowerCase() === 'yes' || chatGPTResponse.trim().toLowerCase() === 'yes.';

    return isCombat;
}
// Remove the readline module and replace getInput function with a new function that gets user input
// using event listeners on buttons and input fields. The new function is called waitForInput.

function waitForInput(prompt) {
    return new Promise((resolve) => {
        const promptElement = document.querySelector('#input-prompt');
        promptElement.textContent = prompt;

        const submitAction = () => {
            const inputField = document.querySelector('#inputField');
            const userInput = inputField.value;
            inputField.value = '';
            promptElement.textContent = '';
            resolve(userInput);
        };

        // Add event listener for Enter key
        const inputField = document.querySelector('#inputField');
        const handleKeyDown = (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                inputField.removeEventListener('keydown', handleKeyDown); // Remove the keydown event listener
                submitAction();
            }
        };

        inputField.addEventListener('keydown', handleKeyDown);

        const handleClick = () => {
            inputField.removeEventListener('keydown', handleKeyDown); // Remove the keydown event listener
            submitAction();
        };

        document.querySelector('#submit-action').addEventListener('click', handleClick, { once: true });
    });
}


// Update the console.log function to display the text in the browser by appending
// the message to the combat log (ul element with id "id").
function updateActivityLog(message) {
    const logContainer = document.querySelector('#activity-text');
    const newMessage = document.createElement('li');
    newMessage.textContent = message;
    logContainer.appendChild(newMessage);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function updateStoryLog(message) {
    const logContainer = document.querySelector('#story-text');
    const newMessage = document.createElement('li');
    newMessage.textContent = message;
    logContainer.appendChild(newMessage);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// The classifyAction function prompts the player to classify an action as requiring a skill check or not. getContext is called to provide more information.
async function classifyAction(action, storyLog) {
    console.log('In classifyAction')
    const context = getContext(storyLog);
    framing = 'You are a tool to classify actions in a text-based RPG as either, "Action" or "Other". You will be shown part of the story to provide context to your decision. You may only respond with "Action" or "Other".'
    return await chatGPT(framing, `Story: ${context} Classify the action: ${action}.`);
}
/**
 * Processes a skill check for a given action based on context.
 * @param {string} action - The action for which a skill check is being processed.
 * @param {string[]} storyLog - The log of the current story context.
 * @returns {Object} An object with the results of the skill check.
 */
async function processSkillCheck(action, storyLog) {
    console.log('In processSkillCheck')
    // Step 0: Get context and framing for the question prompt
    const context = getContext(storyLog);
    const framing = 'You are a tool to process skill checks in a text-based RPG. Read the provided context and then answer the question by picking from the provided answers.';

    // Step 1: Ask the user whether the action requires a skill check
    /*
    const prompt = `Context: ${context} \n Answer the following questions for the action '${action}'. Base your response on the expected difficulty given the context specified. Do not provide explanations. For questions 1 and 2, only respond with the letter of your chosen answer. For question 3 only respond with an integer. A proper respond is: A \n C \n 8` +
        `1) Does the action require a skill check? Choose an option: A) Yes, B) No.\n` +
        `2) If a skill check is required, classify the action into one of the following categories by choosing the corresponding letter: A) Strength, B) Dexterity, C) Intelligence, D) Charisma, E) Constitution, F) Wisdom.\n` +
        `3) If a skill check is required, determine the difficulty of the skill check as an integer between 1 and 20.`;
    */
    const prompt = `Context: ${context} \n Answer the following questions for the action '${action}'. Base your response on the expected difficulty given the context specified. Do not provide explanations. For questions 1 and 2, only respond with the letter of your chosen answer. For question 3 only respond with an integer. A proper respond is: A \n C \n 8 \n Please put each answer on a new line and do not include any other text or characters.` +
        `1) Does the action require a skill check? Choose an option: A) Yes, B) No.\n` +
        `2) If a skill check is required, classify the action into one of the following categories by choosing the corresponding letter: A) Strength, B) Dexterity, C) Intelligence, D) Charisma, E) Constitution, F) Wisdom.\n` +
        `3) If a skill check is required, determine the difficulty of the skill check as an integer between 1 and 20.`;


    const response = await chatGPT(framing, prompt);
    console.log(`processSkillCheck response: ${response}`)
    // Step 2: Initialize the result object and parse the response
    const result = { requiresSkillCheck: false, skillCategory: null, difficulty: null };
    const lines = response.split('\n');

    // Step 3: Check if the action requires a skill check
    if (lines.length > 0 && lines[0].trim().toUpperCase() === 'A') {
        result.requiresSkillCheck = true;
    } else {
        return result;
    }

    // Step 4: Classify the action into a skill category
    const skillCategories = ['Strength', 'Dexterity', 'Intelligence', 'Charisma', 'Constitution', 'Wisdom'];
    if (lines.length > 1) {
        const categoryIndex = 'ABCDEF'.indexOf(lines[1].trim().toUpperCase());
        if (categoryIndex >= 0 && categoryIndex < skillCategories.length) {
            result.skillCategory = skillCategories[categoryIndex].toLowerCase();
        }
    }

    // Step 5: Determine the difficulty of the skill check
    if (lines.length > 2) {
        const difficultyText = lines[2].match(/\d+/);
        if (difficultyText) {
            let difficulty = parseInt(difficultyText[0], 10);
            if (!isNaN(difficulty)) {
                difficulty = Math.max(1, Math.min(20, difficulty));
                result.difficulty = difficulty;
            }
        }
    }
    // Step 6: Return the result object
    return result;
}

// The getContext function takes a storyLog array and returns the last few items in the array concatenated as a string
function getContext(storyLog, maxLength = 2048) {
    const story = storyLog.join(' ');
    if (story.length <= maxLength) {
        return story;
    }

    let context = '';
    let index = storyLog.length - 1;

    while (index >= 0 && context.length + storyLog[index].length + 1 <= maxLength) {
        context = storyLog[index] + ' ' + context;
        index--;
    }

    return context.trim();
}

// The getQuestStatus function prompts the player to determine the status of the current quest
async function getQuestStatus(quest, storyLog) {
    const context = getContext(storyLog);
    framing = 'You are playing the role of game manager for a text-based RPG. Look at the original quest and a recent selection of events from the story, then determine if the player has completed the quest. Respond only with, "Complete", "Failed", or "Ongoing".'
    return await chatGPT(framing, `Original quest: '${quest}'. Story selection: ${context}`);
}

// The narrateAction function generates a narrative response to an action taken by the player
async function narrateAction(action, total, success, storyLog) {
    console.log(`In narrateAction`)
    const context = getContext(storyLog);
    if (total !== undefined && success !== undefined) {
        framing = 'You are the game master and storyteller for a text-based RPG. You will be shown the current story and then the player\'s action. Please continue the story in a small increment from that point, so that the player is involved in shaping the direction and outcome of the story.'
        return await chatGPT(framing, `Story: ${context} The player attempts to '${action}' with a total roll of ${total} and success status of ${success}.`);
    } else {
        framing = 'You are the game master and storyteller for a text-based RPG. You will be shown the current story and then the player\'s action. Please continue the story in a small increment from that point, so that the player is involved in shaping the direction and outcome of the story.'
        return await chatGPT(framing, `${context} The player attempts to '${action}'.`);
    }
}

// The rollDice function simulates the rolling of a dice with a number of sides passed as an argument
function rollDice(sides = 20) {
    return Math.floor(Math.random() * sides) + 1;
}

function parseCombatData(combatText) {
    const enemies = [];
    const allies = [];
    const terrain = [];

    const enemyRegex = /Enemies:([^]*?)Allies:/;
    const allyRegex = /Allies:([^]*?)Terrain:/;
    const terrainRegex = /Terrain:([^]*?)$/;

    const enemyMatches = combatText.match(enemyRegex);
    const allyMatches = combatText.match(allyRegex);
    const terrainMatches = combatText.match(terrainRegex);

    if (enemyMatches) {
        const enemyData = enemyMatches[1].split(',');
        for (let i = 0; i < enemyData.length; i++) {
            const enemyNamePos = enemyData[i].trim().split(' ');
            const enemyName = enemyNamePos[0];
            const enemyPos = enemyNamePos[1].match(/\d{1,2}/g).map(Number);
            enemies.push({ name: enemyName, x: enemyPos[0], y: enemyPos[1] });
        }
    }

    if (allyMatches) {
        const allyData = allyMatches[1].split(',');
        for (let i = 0; i < allyData.length; i++) {
            const allyNamePos = allyData[i].trim().split(' ');
            const allyName = allyNamePos[0];
            const allyPos = allyNamePos[1].match(/\d{1,2}/g).map(Number);
            allies.push({ name: allyName, x: allyPos[0], y: allyPos[1] });
        }
    }

    if (terrainMatches) {
        const terrainData = terrainMatches[1].split(',');
        for (let i = 0; i < terrainData.length; i++) {
            const terrainNamePos = terrainData[i].trim().split(' ');
            const terrainName = terrainNamePos[0];
            const terrainPos = terrainNamePos[1].match(/\d{1,2}/g).map(Number);
            terrain.push({ name: terrainName, x: terrainPos[0], y: terrainPos[1] });
        }
    }

    return { enemies, allies, terrain };
}

async function generateCombatData(storyText) {
    const framing = 'You are a tool to generate combat data for a text-based RPG. Read the provided story text and determine the positions of enemies, allies (including the player), and terrain for a 10x10 grid. Assume (0, 0) is the bottom-left corner and (9, 9) is the top-right corner. Enemies and allies occupy a single grid location, and will usually be clustered near their side unless the story dictates otherwise. Terrain can occupy multiple locations, but should cover no more, at most, than 1/3rd of the map. The information should be reflective of their place in the story.';

    const prompt = `Story text: ${storyText}\n` +
        'Identify the names and positions of enemies, allies, and terrain on a 10x10 grid based on the provided story text. Assume (0, 0) is the bottom-left corner and (9, 9) is the top-right corner. Provide the data in the following format:\n' +
        'Enemies: enemy1_name (x1, y1), enemy2_name (x2, y2), ...\n' +
        'Allies: ally1_name (x3, y3), ally2_name (x4, y4), ...\n' +
        'Terrain: terrain1_name (x5, y5), terrain2_name (x6, y6), ...';

    const response = await chatGPT(framing, prompt);
    console.log(`generateCombatData response: ${response}`);

    const parsedCombatData = parseCombatData(response);
    return parsedCombatData;
}


// Define enumerated values for action types, skill categories, and quest completion statuses
const ActionType = {
    ACTION: 'action',
    OTHER: 'other',
};

const Skill = {
    STRENGTH: 'strength',
    DEXTERITY: 'dexterity',
    INTELLIGENCE: 'intelligence',
    CHARISMA: 'charisma',
    CONSTITUTION: 'constitution',
    WISDOM: 'wisdom',
};

const QuestStatus = {
    COMPLETE: 'complete',
    FAILED: 'failed',
    ONGOING: 'ongoing',
};

// Define enumerated values for action types, skill categories, and quest completion statuses
class Player {
    constructor(strength, dexterity, intelligence, charisma, constitution, wisdom) {
        this.strength = strength;
        this.dexterity = dexterity;
        this.intelligence = intelligence;
        this.charisma = charisma;
        this.constitution = constitution;
        this.wisdom = wisdom;
    }
}

// The handleAction function processes an action taken by the player and generates a narrative response
async function handleAction(player, action, storyLog) {
    const actionType = await classifyAction(action, storyLog);
    console.log(`actionType is: ${actionType}`)
    if (actionType.toLowerCase() === "action" || actionType.toLowerCase() === "action.") {
        const skillCheckResult = await processSkillCheck(action, storyLog);
        console.log({ skillCheckResult })
        if (skillCheckResult.requiresSkillCheck) {
            const skill = skillCheckResult.skillCategory;
            const difficulty = skillCheckResult.difficulty;
            const response = await performSkillCheck(player, action, skill, difficulty, storyLog);
            storyLog.push(response);

            if (await isInCombat(response)) {
                updateActivityLog("Entering combat...");
                const combatData = await generateCombatData(response)
                const parsedCombatData = parseCombatData(combatData)
                const combatResult = await import('./combat.js').then((module) => module.mainCombat(parsedCombatData));
                storyLog.push(`Combat Result: ${combatResult}`);
                const response = await chatGPT(`Continue the story after combat: ${combatResult}`, storyLog);
                storyLog.push(response);
                return response;
            }

            return response;
        } else {
            const response = await narrateAction(action, null, null, storyLog);
            storyLog.push(response);

            if (await isInCombat(response)) {
                updateActivityLog("Entering combat...");
                const combatData = await generateCombatData(response)
                const parsedCombatData = parseCombatData(combatData)
                const combatResult = await import('./combat.js').then((module) => module.mainCombat(parsedCombatData));
                storyLog.push(`Combat Result: ${combatResult}`);
                const response = await chatGPT(`Continue the story after combat: ${combatResult}`, storyLog);
                storyLog.push(response);
                return response;
            }

            return response;
        }
    } else {
        const response = await chatGPT(`The player does: ${action}`, storyLog);
        storyLog.push(response);

        if (await isInCombat(response)) {
            updateActivityLog("Entering combat...");
            const combatData = await generateCombatData(response)
            const parsedCombatData = parseCombatData(combatData)
            const combatResult = await import('./combat.js').then((module) => module.mainCombat(parsedCombatData));
            storyLog.push(`Combat Result: ${combatResult}`);
            const response = await chatGPT(`Continue the story after combat: ${combatResult}`, storyLog);
            storyLog.push(response);
            return response;
        }

        return response;
    }
}
// The performSkillCheck function simulates a skill check based on the player's stats and a difficulty value
async function performSkillCheck(player, action, skill, difficulty, storyLog) {
    console.log('In performSkillCheck')
    const roll = rollDice();
    const statValue = player[skill];
    const total = roll + statValue;

    updateActivityLog(`You rolled a ${roll} and have a ${skill.toUpperCase()} of ${statValue}. Your total is ${total}. The difficulty is ${difficulty}.`);

    const success = total >= difficulty;
    const response = await narrateAction(action, total, success, storyLog);
    storyLog.push(response);

    return response;
}

// The main function initializes the game and runs the main game loop
async function main() {
    updateActivityLog(`Initializing main.js`)
    // Get the game setting and quest from the user
    const setting = await waitForInput('Enter the game setting: ');
    updateStoryLog(`Setting: ${setting}`)
    const quest = await waitForInput('Enter the quest objective: ');
    updateStoryLog(`Quest: ${quest}`)

    // Get player's stats
    const strength = parseInt(await waitForInput('Enter your strength: '));
    const dexterity = parseInt(await waitForInput('Enter your dexterity: '));
    const intelligence = parseInt(await waitForInput('Enter your intelligence: '));
    const charisma = parseInt(await waitForInput('Enter your charisma: '));
    const constitution = parseInt(await waitForInput('Enter your constitution: '));
    const wisdom = parseInt(await waitForInput('Enter your wisdom: '));
    updateActivityLog(`Strength: ${strength}, Dexterity: ${dexterity}, Intelligence: ${intelligence}, Charisma: ${charisma}, Constitution: ${constitution}, Wisdom: ${wisdom}`)

    const player = new Player(strength, dexterity, intelligence, charisma, constitution, wisdom);

    const storyLog = [];

    // Start the game
    basicNarrator = 'You are a playing the role of masterful narrator for a player-driven story. You\'ll be given a setting and a quest. From that, write an introductory scene that sets the stage. Include details about the environment and potential obstacles. Do not ask the player what they do.'
    const intro = await chatGPT(basicNarrator, `Setting: ${setting}. Quest: ${quest}.`);
    updateStoryLog(intro);
    storyLog.push(intro);

    while (true) {
        const action = await waitForInput("What do you do? ");
        const response = await handleAction(player, action, storyLog);
        updateStoryLog(response);

        const questStatus = await getQuestStatus(quest, storyLog);

        if (questStatus.toLowerCase() === "complete" || questStatus.toLowerCase() === "complete.") {
            updateStoryLog(`Congratulations! You have completed the quest: ${quest}.`);
            break;
        } else if (questStatus.toLowerCase() === "failed" || questStatus.toLowerCase() === "failed.") {
            updateStoryLog(`Unfortunately, you have failed the quest: ${quest}. Better luck next time.`);
            break;
        } else {
            updateStoryLog("The adventure continues...");
        }
    }
}

document.querySelector('#start-game').addEventListener('click', () => {
    main().catch((error) => {
        console.error(`An error occurred: ${error.message}`);
    });
});