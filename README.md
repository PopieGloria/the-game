# Team Game

A simple web-based game for teams to play a strategic "White or Black" choice game.

## How to Play

1. Open `index.html` in any modern web browser.
2. Configure the game:
   - Choose the number of teams (2-8)
   - Set the number of rounds (1-50)
   - Click "Start Game"
3. Customize team names by typing in the text field for each team.
4. Each team selects either "White" or "Black" from their dropdown menu.
5. After all teams have made their selections, click the "Calculate Round" button.
6. Scores are calculated based on the following rules:
   - All Whites → -1 point each
   - All Blacks → +1 point each
   - All but one White, one Black → +1 each for Whites, -3 for the Black
   - 1 White, rest Blacks → +3 for the White, -1 each for the Blacks
   - Equal Whites and Blacks → +2 each for Whites, -2 each for Blacks
   - Other distributions → +1 for Whites, -1 for Blacks
7. The leaderboard is sorted by highest score.
8. The current leader is displayed at the top right of the screen.
9. Use the "Reset Game" button to start over with new settings.

## Files

- `index.html`: Main HTML structure
- `styles.css`: CSS styling
- `script.js`: Game logic

## Features

- Configurable number of teams (2-8)
- Configurable number of rounds (1-50)
- Custom team names
- Current leader display
- Real-time score updates
- Leaderboard sorted by highest score
- Round history tracking with score changes
- Reset functionality

## Technical Details

This is a static web application built with vanilla HTML, CSS, and JavaScript. No frameworks or backend are required.

## Author

Created by [arfanmthafseer](https://github.com/PopieGloria) 