# Prompt-Engineering

This repository contains two examples of the prompt engineering I've done. The "GPT RPG" is more visibly extensive, but both were substantial (the code for Meed is proprietary and so cannot be shown).

## "GPT RPG" ##

All (~>99.5%) of the code in the folder was generated by ChatGPT (usually 4, though some was from 3.5). This includes: main.js, combat.js, and index.html. The game is a simple one modeled off of a much-reduced version of tabletop RPGs (like Dungeons & Dragons). When given a setting and a quest, it generates a text-based story that allows users to interact using open-field input (e.g. "I climb a tree to look for my target"). ChatGPT classifies player input according to game logic (input -> action/other -> if action: skill check required Y/N -> etc.), generates responses, and checks to see if the quest has been completed. 

Barring a few changes to the ChatGPT messages used to handle prompts, all of the code was written by ChatGPT over the course of a long conversation.

The game works but the combat.js file has not been implemented (though that was also all generated by ChatGPT) due to a break to reevaluate project goals. When a combat event occurs in "main.js", determined by "isInCombat()", the program will send the relevant information (units involved in combat, based on story context) to "combat.js". The remaining tasks are to improve the prompt quality relative to game goals (the storytelling AI struggles with proper pacing and it's easy to "game" the system and instantly complete the quest, though the quest complete function, "getQuestStatus", seems to work as intended.)

To run the game, you'll need to get your own OpenAI API key and put it in a .env file. After installing the program (npm install), you should be able to run it with "node server.js" and then going to localhost:3000 where you'll need to hit "Start Game".

Main game loop:
![image](https://user-images.githubusercontent.com/38039634/230953944-21202f98-585c-4ab2-803f-779471224798.png)

## Meed ##

This repository only shows the part of the Meed Discord bot that exposes AI functionality to the public, but ChatGPT was used to completely refactor the code base. 

The prompt engineering [shown](https://github.com/Arcamped/Prompt-Engineering/blob/main/Meed.js) displays how AI is used in the "/meed-gpt" on Discord. When given an input, like "basketball", it creates a challenge (e.g. "Shoot ten freethrows in a row and do a pull-up for each miss" and returns it to the user on Discord. To see this in action, please visit the Meed Discord server and challenge away!

The refactor cannot be shown as I'm still using that code for the operation of the bot, but I can sketch the outline. When I wrote the code in JavaScript (my first time using JS) over the course of several months I approached the task like I was still doing a data analysis project in Python. As a result, much of the code did not follow best practices (particularly around async/await), it was hard to maintain, and debugging was challenging. I explained the concept of Meed to GPT over several prompts (shown below) and then showed it the code (~8k lines). Once the refactor was finished, the code was noticeably cleaner, better optimized, more robust, and far easier to read -- with expanded functionality and fewer lines (~6k lines).

### Initial Context Prompts ###

MC 1: 

Good morning! Today I would like to work on debugging and improving the JavaScript code I've written for a Discord Bot application. The bot is primarily built around "discord.js" and we use Firestore for our servers. We also have a website that displays information about the challenges and users, but the experience on Discord is self-contained. The core premise of the application is as follows: users can make challenges for other users. These challenges are tasks that users want to see accomplished, for example I might issue a challenge to my friend like, "Do 10 push-ups". When creating a challenge the creating user specifies other criteria like: is any money involved, how long does the user have to complete the challenge, and who gets to vote on whether or not the challenge was completed. Voting is used so that we, the company providing the service, do not have to manually review every entry. If a challenge passes, the user completing the challenge gets all the money. Otherwise, the money is returned. Anyone on Discord in a channel with the bot may use the program. When they interact with the bot we check to see if they have an account on Meed. If they do, we use that information to identify their interactions. If they do not, we make them a "pseudo account" that offers the same functionality and allows us to handle their interactions.

Do you understand the core concept? Do you have any questions about how Meed operates before we dive into the code?

GPT4 1: 

I understand the core concept of your Discord bot application. It's a platform where users can create and accept challenges, vote on the completion of challenges, and possibly win money based on the outcomes. It is integrated with Discord using the "discord.js" library and Firestore for data storage. There is also a website to display information about the challenges and users, but the main interaction happens within Discord.

I have a few clarifying questions before we dive into the code:

How are the funds for the challenges handled? 

Is there a wallet system in place where users deposit money to be used for challenges?

What happens in case of a tie in voting? Is there a default mechanism to resolve such situations?

How does the pseudo account work? Is there a way for users to upgrade it to a regular account if they decide to join the platform officially?

Are there any restrictions or rules for creating challenges or voting on them? For example, can someone create a challenge that might be against Discord's terms of service, or can users vote multiple times?

Please feel free to provide any additional information that you think is relevant to understanding the application better.

MC 2: 

1. There is a wallet system and we primarily use Stripe. We are currently exploring allowing users to make payments without an account. Crucially, money is refunded to the user account if the challenge is not completed. We only make money when Challenges are completed.

2. It depends on the voting type. However, in most cases a tie assumes the challenge passes. There are multiple types of voting: 'default', 'all', 'custom', 'both', 'creator', 'boost'. In 'default', only the user receiving the challenge gets a qualified vote (all users may vote for engagement purposes, but only qualified votes count). In 'all', all users that vote are qualified. In 'creator', only the user that created the challege gets a qualified vote. In 'custom', only the users selected by the challenge creator get a qualified vote. In 'boost', only the users that spent money on the Challenge (via "boosting") get to vote on completion. When 'both' is selected, both the creator and recipient need to agree the challenge was completed, so a tie in "both" means the challenge is failed.

3. Yes, but we're still working on the implementation of that.

4. Users can ban other users from making challenges for them. Users may also set minimum price thresholds on challenge creation (e.g. can only make a challenge if $x is attached). Additionally, users may limit the number of challenges other users can make for them (for example, no more than 10 open at once).

GPT4 2: <Says it's ready to start work>

(I realized I forgot an important part of the needed context)

MC 3:

Of course. One more point should be clairifed: challenges can be in one of several states, "open", "accepted", "voting", "completed", "failed", and "closed" (I think that's the name). A challenge is "open" when it has been created but not accepted. A challenge is "accepted" when it has been accepted by the user it was created for. A challenge enters its voting stage when the user that accepted the challenge marks it as complete. A challenge is "complete" when it has finished the voting stage and determined to have been passed (qualified pass votes >= qualified fail votes; the code might call these official votes). A challenge is "failed" when it has finished the voting stage and has fewer pass votes than fail votes.
