# react_hooks_typerace

## See the Deployed app here!  https://fast-tundra-10719.herokuapp.com/

**List of core dependencies:**
- React (create-react-app)
- axios (axios)
- express (express)
- mongoose (mongoose)
- cheerio (cheerio)
- passport (passport)

This project was made for me to learn Hooks.  I started with re-creating the steps taken in the following tutorial:https://medium.com/@dtkatz/react-hooks-tutorial-learn-by-building-b90ec4db2b8e.  

I made several changes/advancements to the game, as follows:
- Scraped snippets to be from quotes from (https://www.universalclass.com/articles/self-help/keyboarding-practice-sentence-repetition.htm)
- Disallowed users to paste quote snippets (i.e. cheating)
- Made game into an arcade style where users can input a name and post this into a database along with their score in milliseconds.  A "high scores" table renders the user's score in comparison to other previous scores on the same quote.
- Scores are sorted and rendered onto the screen based on the least time it took for a user to complete the snippet
- A timer and character validation are implemented and rendered on-screen.  Validation involved a function that returns a copy of the user's input with each character "checked" against each character in the snippet, with a correct character colored in green, and an incorrect character colored in red, and being an underscore. 
- User accounts can be created, where scores are saved to user account, and are posted to each quote automatically without prompting username input.
- When logged in, a user's top 5 scores are also displayed on screen.
