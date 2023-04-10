/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/main.js":
/*!************************!*\
  !*** ./public/main.js ***!
  \************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("// The chatGPT function takes a prompt as input and uses the OpenAI API to generate a response. \n/// We still need to update max_tokens to take a specific parameter given the situation.\nasync function chatGPT(framing, prompt) {\n  console.log(`framing: ${framing}`);\n  const response = await fetch('https://api.openai.com/v1/chat/completions', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n      'Authorization': `Bearer ${\"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\"}`\n    },\n    body: JSON.stringify({\n      model: 'gpt-3.5-turbo',\n      messages: [{\n        'role': 'system',\n        'content': framing\n      }, {\n        'role': 'user',\n        'content': prompt\n      }],\n      max_tokens: 1024,\n      n: 1,\n      stop: null,\n      temperature: 0.7\n    })\n  });\n  console.log('response before the json: ', response);\n  const result = await response.json();\n  console.log('result after the json: ', result);\n  const resultText = result.choices[0].message.content.trim();\n  console.log('resultText after we extract: ', resultText);\n  return resultText;\n}\nasync function isInCombat(response) {\n  console.log(`In isInCombat function. parameter value: ${response}`);\n  // Frame a question for ChatGPT to determine if the response leads to combat\n  const framing = 'You are a tool for a text-based RPG. Your task is to determine if the given text describes a combat situation. Respond with either \"Yes\" or \"No\".';\n  const prompt = `Based on the following text, does it lead to a combat situation?\\n\\n${response}`;\n\n  // Get the answer from ChatGPT\n  const chatGPTResponse = await chatGPT(framing, prompt);\n\n  // Check if the answer is \"Yes\" (combat) or \"No\" (non-combat)\n  const isCombat = chatGPTResponse.trim().toLowerCase() === 'yes' || chatGPTResponse.trim().toLowerCase() === 'yes.';\n  return isCombat;\n}\n// Remove the readline module and replace getInput function with a new function that gets user input\n// using event listeners on buttons and input fields. The new function is called waitForInput.\n\nfunction waitForInput(prompt) {\n  return new Promise(resolve => {\n    const promptElement = document.querySelector('#input-prompt');\n    promptElement.textContent = prompt;\n    const submitAction = () => {\n      const inputField = document.querySelector('#inputField');\n      const userInput = inputField.value;\n      inputField.value = '';\n      promptElement.textContent = '';\n      resolve(userInput);\n    };\n\n    // Add event listener for Enter key\n    const inputField = document.querySelector('#inputField');\n    const handleKeyDown = event => {\n      if (event.keyCode === 13) {\n        event.preventDefault();\n        inputField.removeEventListener('keydown', handleKeyDown); // Remove the keydown event listener\n        submitAction();\n      }\n    };\n    inputField.addEventListener('keydown', handleKeyDown);\n    const handleClick = () => {\n      inputField.removeEventListener('keydown', handleKeyDown); // Remove the keydown event listener\n      submitAction();\n    };\n    document.querySelector('#submit-action').addEventListener('click', handleClick, {\n      once: true\n    });\n  });\n}\n\n// Update the console.log function to display the text in the browser by appending\n// the message to the combat log (ul element with id \"id\").\nfunction updateActivityLog(message) {\n  const logContainer = document.querySelector('#activity-text');\n  const newMessage = document.createElement('li');\n  newMessage.textContent = message;\n  logContainer.appendChild(newMessage);\n  logContainer.scrollTop = logContainer.scrollHeight;\n}\nfunction updateStoryLog(message) {\n  const logContainer = document.querySelector('#story-text');\n  const newMessage = document.createElement('li');\n  newMessage.textContent = message;\n  logContainer.appendChild(newMessage);\n  logContainer.scrollTop = logContainer.scrollHeight;\n}\n\n// The classifyAction function prompts the player to classify an action as requiring a skill check or not. getContext is called to provide more information.\nasync function classifyAction(action, storyLog) {\n  console.log('In classifyAction');\n  const context = getContext(storyLog);\n  framing = 'You are a tool to classify actions in a text-based RPG as either, \"Action\" or \"Other\". You will be shown part of the story to provide context to your decision. You may only respond with \"Action\" or \"Other\".';\n  return await chatGPT(framing, `Story: ${context} Classify the action: ${action}.`);\n}\n/**\r\n * Processes a skill check for a given action based on context.\r\n * @param {string} action - The action for which a skill check is being processed.\r\n * @param {string[]} storyLog - The log of the current story context.\r\n * @returns {Object} An object with the results of the skill check.\r\n */\nasync function processSkillCheck(action, storyLog) {\n  console.log('In processSkillCheck');\n  // Step 0: Get context and framing for the question prompt\n  const context = getContext(storyLog);\n  const framing = 'You are a tool to process skill checks in a text-based RPG. Read the provided context and then answer the question by picking from the provided answers.';\n\n  // Step 1: Ask the user whether the action requires a skill check\n  /*\r\n  const prompt = `Context: ${context} \\n Answer the following questions for the action '${action}'. Base your response on the expected difficulty given the context specified. Do not provide explanations. For questions 1 and 2, only respond with the letter of your chosen answer. For question 3 only respond with an integer. A proper respond is: A \\n C \\n 8` +\r\n      `1) Does the action require a skill check? Choose an option: A) Yes, B) No.\\n` +\r\n      `2) If a skill check is required, classify the action into one of the following categories by choosing the corresponding letter: A) Strength, B) Dexterity, C) Intelligence, D) Charisma, E) Constitution, F) Wisdom.\\n` +\r\n      `3) If a skill check is required, determine the difficulty of the skill check as an integer between 1 and 20.`;\r\n  */\n  const prompt = `Context: ${context} \\n Answer the following questions for the action '${action}'. Base your response on the expected difficulty given the context specified. Do not provide explanations. For questions 1 and 2, only respond with the letter of your chosen answer. For question 3 only respond with an integer. A proper respond is: A \\n C \\n 8 \\n Please put each answer on a new line and do not include any other text or characters.` + `1) Does the action require a skill check? Choose an option: A) Yes, B) No.\\n` + `2) If a skill check is required, classify the action into one of the following categories by choosing the corresponding letter: A) Strength, B) Dexterity, C) Intelligence, D) Charisma, E) Constitution, F) Wisdom.\\n` + `3) If a skill check is required, determine the difficulty of the skill check as an integer between 1 and 20.`;\n  const response = await chatGPT(framing, prompt);\n  console.log(`processSkillCheck response: ${response}`);\n  // Step 2: Initialize the result object and parse the response\n  const result = {\n    requiresSkillCheck: false,\n    skillCategory: null,\n    difficulty: null\n  };\n  const lines = response.split('\\n');\n\n  // Step 3: Check if the action requires a skill check\n  if (lines.length > 0 && lines[0].trim().toUpperCase() === 'A') {\n    result.requiresSkillCheck = true;\n  } else {\n    return result;\n  }\n\n  // Step 4: Classify the action into a skill category\n  const skillCategories = ['Strength', 'Dexterity', 'Intelligence', 'Charisma', 'Constitution', 'Wisdom'];\n  if (lines.length > 1) {\n    const categoryIndex = 'ABCDEF'.indexOf(lines[1].trim().toUpperCase());\n    if (categoryIndex >= 0 && categoryIndex < skillCategories.length) {\n      result.skillCategory = skillCategories[categoryIndex].toLowerCase();\n    }\n  }\n\n  // Step 5: Determine the difficulty of the skill check\n  if (lines.length > 2) {\n    const difficultyText = lines[2].match(/\\d+/);\n    if (difficultyText) {\n      let difficulty = parseInt(difficultyText[0], 10);\n      if (!isNaN(difficulty)) {\n        difficulty = Math.max(1, Math.min(20, difficulty));\n        result.difficulty = difficulty;\n      }\n    }\n  }\n  // Step 6: Return the result object\n  return result;\n}\n\n// The getContext function takes a storyLog array and returns the last few items in the array concatenated as a string\nfunction getContext(storyLog, maxLength = 2048) {\n  const story = storyLog.join(' ');\n  if (story.length <= maxLength) {\n    return story;\n  }\n  let context = '';\n  let index = storyLog.length - 1;\n  while (index >= 0 && context.length + storyLog[index].length + 1 <= maxLength) {\n    context = storyLog[index] + ' ' + context;\n    index--;\n  }\n  return context.trim();\n}\n\n// The getQuestStatus function prompts the player to determine the status of the current quest\nasync function getQuestStatus(quest, storyLog) {\n  const context = getContext(storyLog);\n  framing = 'You are playing the role of game manager for a text-based RPG. Look at the original quest and a recent selection of events from the story, then determine if the player has completed the quest. Respond only with, \"Complete\", \"Failed\", or \"Ongoing\".';\n  return await chatGPT(framing, `Original quest: '${quest}'. Story selection: ${context}`);\n}\n\n// The narrateAction function generates a narrative response to an action taken by the player\nasync function narrateAction(action, total, success, storyLog) {\n  console.log(`In narrateAction`);\n  const context = getContext(storyLog);\n  if (total !== undefined && success !== undefined) {\n    framing = 'You are the game master and storyteller for a text-based RPG. You will be shown the story to the current point and then the player\\'s action. Please continue the story in a small increment from that point, so that the player is involved in shaping the direction and outcome of the story.';\n    return await chatGPT(framing, `Story: ${context} The player attempts to '${action}' with a total roll of ${total} and success status of ${success}.`);\n  } else {\n    framing = 'You are the game master and storyteller for a text-based RPG. You will be shown the story to the current point and then the player\\'s action. Please continue the story in a small increment from that point, so that the player is involved in shaping the direction and outcome of the story.';\n    return await chatGPT(framing, `${context} The player attempts to '${action}'.`);\n  }\n}\n\n// The rollDice function simulates the rolling of a dice with a number of sides passed as an argument\nfunction rollDice(sides = 20) {\n  return Math.floor(Math.random() * sides) + 1;\n}\n\n// Define enumerated values for action types, skill categories, and quest completion statuses\nconst ActionType = {\n  ACTION: 'action',\n  OTHER: 'other'\n};\nconst Skill = {\n  STRENGTH: 'strength',\n  DEXTERITY: 'dexterity',\n  INTELLIGENCE: 'intelligence',\n  CHARISMA: 'charisma',\n  CONSTITUTION: 'constitution',\n  WISDOM: 'wisdom'\n};\nconst QuestStatus = {\n  COMPLETE: 'complete',\n  FAILED: 'failed',\n  ONGOING: 'ongoing'\n};\n\n// Define enumerated values for action types, skill categories, and quest completion statuses\nclass Player {\n  constructor(strength, dexterity, intelligence, charisma, constitution, wisdom) {\n    this.strength = strength;\n    this.dexterity = dexterity;\n    this.intelligence = intelligence;\n    this.charisma = charisma;\n    this.constitution = constitution;\n    this.wisdom = wisdom;\n  }\n}\n\n// The handleAction function processes an action taken by the player and generates a narrative response\nasync function handleAction(player, action, storyLog) {\n  const actionType = await classifyAction(action, storyLog);\n  console.log(`actionType is: ${actionType}`);\n  if (actionType.toLowerCase() === \"action\" || actionType.toLowerCase() === \"action.\") {\n    const skillCheckResult = await processSkillCheck(action, storyLog);\n    console.log({\n      skillCheckResult\n    });\n    if (skillCheckResult.requiresSkillCheck) {\n      const skill = skillCheckResult.skillCategory;\n      const difficulty = skillCheckResult.difficulty;\n      const response = await performSkillCheck(player, action, skill, difficulty, storyLog);\n      storyLog.push(response);\n      if (await isInCombat(response)) {\n        updateActivityLog(\"Entering combat...\");\n        const combatResult = await __webpack_require__.e(/*! import() */ \"public_combat_js\").then(__webpack_require__.t.bind(__webpack_require__, /*! ./combat.js */ \"./public/combat.js\", 23)).then(module => module.mainCombat());\n        storyLog.push(`Combat Result: ${combatResult}`);\n        const response = await chatGPT(`Continue the story after combat: ${combatResult}`, storyLog);\n        storyLog.push(response);\n        return response;\n      }\n      return response;\n    } else {\n      const response = await narrateAction(action, null, null, storyLog);\n      storyLog.push(response);\n      if (await isInCombat(response)) {\n        updateActivityLog(\"Entering combat...\");\n        const combatResult = await __webpack_require__.e(/*! import() */ \"public_combat_js\").then(__webpack_require__.t.bind(__webpack_require__, /*! ./combat.js */ \"./public/combat.js\", 23)).then(module => module.mainCombat());\n        storyLog.push(`Combat Result: ${combatResult}`);\n        const response = await chatGPT(`Continue the story after combat: ${combatResult}`, storyLog);\n        storyLog.push(response);\n        return response;\n      }\n      return response;\n    }\n  } else {\n    framing = 'You are the game master and storyteller for a text-based RPG. You will be shown the current story and then the player\\'s action. Please continue the story in a small increment from that point, so that the player is involved in shaping the direction and outcome of the story.';\n    const response = await chatGPT(framing, `Current story: ${storyLog} \\n The player does: ${action}`);\n    storyLog.push(response);\n    if (await isInCombat(response)) {\n      updateActivityLog(\"Entering combat...\");\n      const combatResult = await __webpack_require__.e(/*! import() */ \"public_combat_js\").then(__webpack_require__.t.bind(__webpack_require__, /*! ./combat.js */ \"./public/combat.js\", 23)).then(module => module.mainCombat());\n      storyLog.push(`Combat Result: ${combatResult}`);\n      const response = await chatGPT(`Continue the story after combat: ${combatResult}`, storyLog);\n      storyLog.push(response);\n      return response;\n    }\n    return response;\n  }\n}\n// The performSkillCheck function simulates a skill check based on the player's stats and a difficulty value\nasync function performSkillCheck(player, action, skill, difficulty, storyLog) {\n  console.log('In performSkillCheck');\n  const roll = rollDice();\n  const statValue = player[skill];\n  const total = roll + statValue;\n  updateActivityLog(`You rolled a ${roll} and have a ${skill.toUpperCase()} of ${statValue}. Your total is ${total}. The difficulty is ${difficulty}.`);\n  const success = total >= difficulty;\n  const response = await narrateAction(action, total, success, storyLog);\n  storyLog.push(response);\n  return response;\n}\n\n// The main function initializes the game and runs the main game loop\nasync function main() {\n  updateActivityLog(`Initializing main.js`);\n  // Get the game setting and quest from the user\n  const setting = await waitForInput('Enter the game setting: ');\n  updateStoryLog(`Setting: ${setting}`);\n  const quest = await waitForInput('Enter the quest objective: ');\n  updateStoryLog(`Quest: ${quest}`);\n\n  // Get player's stats\n  const strength = parseInt(await waitForInput('Enter your strength: '));\n  const dexterity = parseInt(await waitForInput('Enter your dexterity: '));\n  const intelligence = parseInt(await waitForInput('Enter your intelligence: '));\n  const charisma = parseInt(await waitForInput('Enter your charisma: '));\n  const constitution = parseInt(await waitForInput('Enter your constitution: '));\n  const wisdom = parseInt(await waitForInput('Enter your wisdom: '));\n  updateActivityLog(`Strength: ${strength}, Dexterity: ${dexterity}, Intelligence: ${intelligence}, Charisma: ${charisma}, Constitution: ${constitution}, Wisdom: ${wisdom}`);\n  const player = new Player(strength, dexterity, intelligence, charisma, constitution, wisdom);\n  const storyLog = [];\n\n  // Start the game\n  basicNarrator = 'You are a playing the role of masterful narrator for a player-driven story. You\\'ll be given a setting and a quest. From that, write an introductory scene that sets the stage. Include details about the environment and potential obstacles. Do not ask the player what they do.';\n  const intro = await chatGPT(basicNarrator, `Setting: ${setting}. Quest: ${quest}.`);\n  updateStoryLog(intro);\n  storyLog.push(intro);\n  while (true) {\n    const action = await waitForInput(\"What do you do? \");\n    const response = await handleAction(player, action, storyLog);\n    updateStoryLog(response);\n    const questStatus = await getQuestStatus(quest, storyLog);\n    if (questStatus.toLowerCase() === \"complete\" || questStatus.toLowerCase() === \"complete.\") {\n      updateStoryLog(`Congratulations! You have completed the quest: ${quest}.`);\n      break;\n    } else if (questStatus.toLowerCase() === \"failed\" || questStatus.toLowerCase() === \"failed.\") {\n      updateStoryLog(`Unfortunately, you have failed the quest: ${quest}. Better luck next time.`);\n      break;\n    } else {\n      updateStoryLog(\"The adventure continues...\");\n    }\n  }\n}\ndocument.querySelector('#start-game').addEventListener('click', () => {\n  main().catch(error => {\n    console.error(`An error occurred: ${error.message}`);\n  });\n});\n\n//# sourceURL=webpack://newprogram/./public/main.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "newprogram:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunknewprogram"] = self["webpackChunknewprogram"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./public/main.js");
/******/ 	
/******/ })()
;