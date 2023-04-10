
// Given a speciifc topic, this generates a challenge related to that topic.
const openAiCall = async (topic) => {
	const response = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
            // Out of all possible challenges, we want the model to focus on ones that are appropriate for the use case (streamer-viewer interactions, and amongst friends)
			{ 'role': 'system', 'content': 'You are an assistant coming up with fun, challenging activities when given a prompt. Prioritize ideas you think an audience would enjoy watching.' },
			// This example was given because it combines an action specific to the topic ("Play Corki")
            // with a task ("apologize...") that makes sense contextually but is unusual due to social norms and context
            { 'role': 'user', 'content': 'League of Legends' },
			{ 'role': 'assistant', 'content': 'Play Corki and apologize to your team each time you die' },
            // Similar to the preceding example, this is chosen to give an example of a different time scale (i.e. 10 push-ups can be done much more quickly than a game of League of Legends)
			{ 'role': 'user', 'content': 'push-ups' },
			{ 'role': 'assistant', 'content': 'Do 10 push-ups while holding your breath' },
			// At this point we no longer see any qualitative improvements in quality by adding additional examples.
            // Further optimization seems to require data on challenges users like the most. The messages below show one of the redundant examples. 
            // { 'role': 'user', 'content': 'soccer' },
			// { 'role': 'assistant', 'content': 'Play a game of soccer and allow the use of forearms' },
			{ 'role': 'user', 'content': `${topic}` },
		],
		temperature: 0.8,
		max_tokens: 56,
	});

	return response;
};

// In the instances where a user does not input a specific topic, we use the following code to generate a topic.

// One of these is passed to "openAiCall". The results are acceptable, but feel qualitatively inferior to the custom ones
// While this is likely due partially to implicit user expectations (while the user didn't have an explicit preference, there was *something* they preferred)
// part of it is probably due to our use of "random topics". Were we to modify the prompt to "two random, but related, topics" we might see an improvement.
// (This has not been implemented because the value add doesn't justify it at the moment)
const RANDOM_PROMPTS = ['a random topic', 'two random topics', 'multiple random topics'];
const MAX_TOPIC_LENGTH = 40;

// Simple bit of code that checks for user input, then selects one of the random prompts
const getChallengeTopic = (interaction, randomPrompts) => {
	let random = 'no';
	let topic = interaction.options.getString('topic') ?? 'a random task';

	if (topic === 'a random task') {
		random = 'yes';
		const randomIndex = Math.floor(Math.random() * randomPrompts.length);
		topic = randomPrompts[randomIndex];
	}
	else {
		topic = topic.length >= MAX_TOPIC_LENGTH ? topic.substring(0, MAX_TOPIC_LENGTH - 1) : topic;
	}

	return { topic, random };
};

const { topic, random } = getChallengeTopic(interaction, RANDOM_PROMPTS);
const result = await openAiCall(topic);