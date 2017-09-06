# Battleship
A Facebook chatbot that plays a text-based version of Battleship.

# Requirements
* The bot was built using Node v6.10 and Node Package Manager v3.10. We assume you have these versions of NodeJS and Node Package Manager installed. Other versions may work correctly, but have not been tested.
* You must have a Facebook account defined in secrets.env. See the installation instructions for more details. This chatbot is highly experimental and could send messages or login too quickly. **We are not responsible if your account gets suspended, terminated, banned, or otherwise limited.**

# Installation
If you've already installed the bot, proceed to step 6

1. Clone the repository to your local machine
2. Create a file in the root directory called secrets.env
3. Define a Facebook account in secrets.env:
   >fbUser=(email)  
   >fbPass=(password)
4. Open a terminal and navigate to the root directory of the project
5. Run `npm install`
6. Run `node createDB.js` (this only needs to happen once)
7. Run `node index.js`
