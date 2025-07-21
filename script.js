document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const state = {
        round: 1,
        maxRounds: 12,
        teams: {},
        history: [],
        gameStarted: false
    };

    // DOM elements
    const roundNumberEl = document.getElementById('round-number');
    const maxRoundsEl = document.getElementById('max-rounds');
    const calculateRoundBtn = document.getElementById('calculate-round');
    const resetGameBtn = document.getElementById('reset-game');
    const historyContainer = document.getElementById('history-container');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const teamContainer = document.getElementById('teams-container');
    const gameConfigEl = document.getElementById('game-config');
    const startGameBtn = document.getElementById('start-game');
    const teamCountInput = document.getElementById('team-count');
    const roundCountInput = document.getElementById('round-count');
    const leaderNameEl = document.getElementById('leader-name');
    
    // Event listeners
    calculateRoundBtn.addEventListener('click', calculateRound);
    resetGameBtn.addEventListener('click', resetGame);
    startGameBtn.addEventListener('click', startGame);
    
    // Hide the calculate button until game starts
    calculateRoundBtn.style.display = 'none';

    // Start a new game with the configured settings
    function startGame() {
        // Get configuration values
        const teamCount = parseInt(teamCountInput.value);
        const roundCount = parseInt(roundCountInput.value);
        
        // Validate inputs
        if (teamCount < 2 || teamCount > 8) {
            alert('Number of teams must be between 2 and 8');
            return;
        }
        
        if (roundCount < 1 || roundCount > 50) {
            alert('Number of rounds must be between 1 and 50');
            return;
        }
        
        // Update state
        state.maxRounds = roundCount;
        state.teams = {};
        state.round = 1;
        state.history = [];
        state.gameStarted = true;
        
        // Update max rounds display
        maxRoundsEl.textContent = state.maxRounds;
        
        // Generate teams
        generateTeams(teamCount);
        
        // Hide config, show game
        gameConfigEl.style.display = 'none';
        calculateRoundBtn.style.display = 'block';
        
        // Update UI
        updateUI();
    }
    
    // Generate team elements based on count
    function generateTeams(count) {
        // Clear the team container
        teamContainer.innerHTML = '';
        
        // Generate default team IDs (A, B, C, etc.)
        const teamIds = Array.from({ length: count }, (_, i) => 
            String.fromCharCode(65 + i)
        );
        
        // Create team elements
        teamIds.forEach(id => {
            // Add team to state
            state.teams[id] = { 
                score: 0, 
                choice: '',
                name: `Team ${id}`
            };
            
            // Create team element
            const teamEl = document.createElement('div');
            teamEl.className = 'team';
            teamEl.id = `team-${id}`;
            
            // Create name input
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = `Team ${id}`;
            nameInput.className = 'team-name-input';
            nameInput.placeholder = 'Enter team name';
            nameInput.id = `team-${id}-name`;
            nameInput.addEventListener('change', (e) => {
                state.teams[id].name = e.target.value;
                updateLeaderboard();
            });
            
            // Create score display
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'team-score';
            scoreDiv.innerHTML = `Score: <span class="score">0</span>`;
            
            // Create choice selection
            const selectionDiv = document.createElement('div');
            selectionDiv.className = 'selection';
            
            const label = document.createElement('label');
            label.setAttribute('for', `team-${id}-choice`);
            label.textContent = 'Choose:';
            
            const select = document.createElement('select');
            select.id = `team-${id}-choice`;
            select.className = 'choice-select';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '--Select--';
            
            const whiteOption = document.createElement('option');
            whiteOption.value = 'White';
            whiteOption.textContent = 'White';
            
            const blackOption = document.createElement('option');
            blackOption.value = 'Black';
            blackOption.textContent = 'Black';
            
            select.appendChild(defaultOption);
            select.appendChild(whiteOption);
            select.appendChild(blackOption);
            
            select.addEventListener('change', (e) => {
                state.teams[id].choice = e.target.value;
            });
            
            selectionDiv.appendChild(label);
            selectionDiv.appendChild(select);
            
            // Assemble team element
            teamEl.appendChild(nameInput);
            teamEl.appendChild(scoreDiv);
            teamEl.appendChild(selectionDiv);
            
            // Add to container
            teamContainer.appendChild(teamEl);
        });
    }

    // Calculate round scores based on team choices
    function calculateRound() {
        // Check if all teams have made a choice
        const allChoicesMade = Object.values(state.teams).every(team => team.choice !== '');
        
        if (!allChoicesMade) {
            alert('All teams must make a choice before calculating the round!');
            return;
        }
        
        // Count whites and blacks
        const whiteCount = Object.values(state.teams).filter(team => team.choice === 'White').length;
        const blackCount = Object.values(state.teams).filter(team => team.choice === 'Black').length;
        
        // Save previous scores for history
        const previousScores = {};
        Object.keys(state.teams).forEach(team => {
            previousScores[team] = state.teams[team].score;
        });
        
        // Apply scoring rules
        if (whiteCount === Object.keys(state.teams).length) {
            // All Whites → -1 point each
            Object.keys(state.teams).forEach(team => {
                state.teams[team].score -= 1;
            });
        } else if (blackCount === Object.keys(state.teams).length) {
            // All Blacks → +1 point each
            Object.keys(state.teams).forEach(team => {
                state.teams[team].score += 1;
            });
        } else if (whiteCount === Object.keys(state.teams).length - 1 && blackCount === 1) {
            // All but one White, one Black → +1 each for Whites, -3 for the Black
            Object.keys(state.teams).forEach(team => {
                if (state.teams[team].choice === 'White') {
                    state.teams[team].score += 1;
                } else {
                    state.teams[team].score -= 3;
                }
            });
        } else if (whiteCount === 1 && blackCount === Object.keys(state.teams).length - 1) {
            // 1 White, rest Blacks → +3 for the White, -1 each for the Blacks
            Object.keys(state.teams).forEach(team => {
                if (state.teams[team].choice === 'White') {
                    state.teams[team].score += 3;
                } else {
                    state.teams[team].score -= 1;
                }
            });
        } else if (whiteCount === blackCount) {
            // Equal Whites and Blacks → +2 each for Whites, -2 each for Blacks
            Object.keys(state.teams).forEach(team => {
                if (state.teams[team].choice === 'White') {
                    state.teams[team].score += 2;
                } else {
                    state.teams[team].score -= 2;
                }
            });
        } else {
            // Custom rule for other distributions
            // For any other distribution, whites get +1, blacks get -1
            Object.keys(state.teams).forEach(team => {
                if (state.teams[team].choice === 'White') {
                    state.teams[team].score += 1;
                } else {
                    state.teams[team].score -= 1;
                }
            });
        }
        
        // Save round history
        const roundHistory = {
            round: state.round,
            choices: {},
            scoreChanges: {}
        };
        
        Object.keys(state.teams).forEach(team => {
            roundHistory.choices[team] = {
                choice: state.teams[team].choice,
                name: state.teams[team].name
            };
            roundHistory.scoreChanges[team] = {
                previous: previousScores[team],
                current: state.teams[team].score,
                change: state.teams[team].score - previousScores[team]
            };
        });
        
        state.history.push(roundHistory);
        
        // Move to next round
        state.round++;
        
        // Reset choices for next round
        Object.keys(state.teams).forEach(team => {
            state.teams[team].choice = '';
            const selectEl = document.getElementById(`team-${team}-choice`);
            selectEl.value = '';
        });
        
        // Update UI
        updateUI();
        
        // Check if game is over
        if (state.round > state.maxRounds) {
            calculateRoundBtn.disabled = true;
            alert('Game over! Check the final scores and leaderboard.');
        }
    }

    // Reset the game to initial state
    function resetGame() {
        // Reset to configuration screen
        state.gameStarted = false;
        state.round = 1;
        state.history = [];
        state.teams = {};
        
        // Show config, hide teams
        gameConfigEl.style.display = 'block';
        teamContainer.innerHTML = '';
        calculateRoundBtn.style.display = 'none';
        calculateRoundBtn.disabled = false;
        
        // Reset leader
        leaderNameEl.textContent = 'None';
        
        // Update UI
        updateUI();
    }

    // Update all UI elements based on current state
    function updateUI() {
        // Update round number
        roundNumberEl.textContent = state.round;
        
        if (!state.gameStarted) {
            historyContainer.innerHTML = '<p>Configure and start a new game.</p>';
            leaderboardBody.innerHTML = '';
            return;
        }
        
        // Update team scores
        Object.keys(state.teams).forEach(team => {
            const scoreEl = document.querySelector(`#team-${team} .score`);
            if (scoreEl) {
                scoreEl.textContent = state.teams[team].score;
            }
        });
        
        // Update history
        updateHistory();
        
        // Update leaderboard
        updateLeaderboard();
        
        // Update current leader
        updateCurrentLeader();
    }

    // Update the current leader display
    function updateCurrentLeader() {
        if (Object.keys(state.teams).length === 0) {
            leaderNameEl.textContent = 'None';
            return;
        }
        
        // Find team with highest score
        const sortedTeams = Object.keys(state.teams)
            .map(team => ({
                id: team,
                name: state.teams[team].name,
                score: state.teams[team].score
            }))
            .sort((a, b) => b.score - a.score);
        
        if (sortedTeams.length > 0) {
            leaderNameEl.textContent = sortedTeams[0].name;
        }
    }

    // Update the round history display
    function updateHistory() {
        historyContainer.innerHTML = '';
        
        if (state.history.length === 0) {
            historyContainer.innerHTML = '<p>No rounds played yet.</p>';
            return;
        }
        
        state.history.forEach(roundData => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const roundHeader = document.createElement('h4');
            roundHeader.textContent = `Round ${roundData.round}`;
            
            const choicesDiv = document.createElement('div');
            choicesDiv.className = 'round-choices';
            
            Object.keys(roundData.choices).forEach(team => {
                const choiceSpan = document.createElement('span');
                choiceSpan.className = roundData.choices[team].choice === 'White' ? 'team-white' : 'team-black';
                choiceSpan.textContent = `${roundData.choices[team].name}: ${roundData.choices[team].choice} (${roundData.scoreChanges[team].change > 0 ? '+' : ''}${roundData.scoreChanges[team].change}) `;
                choicesDiv.appendChild(choiceSpan);
            });
            
            historyItem.appendChild(roundHeader);
            historyItem.appendChild(choicesDiv);
            historyContainer.appendChild(historyItem);
        });
    }

    // Update the leaderboard
    function updateLeaderboard() {
        leaderboardBody.innerHTML = '';
        
        if (Object.keys(state.teams).length === 0) {
            return;
        }
        
        // Sort teams by highest score
        const sortedTeams = Object.keys(state.teams)
            .map(team => ({
                id: team,
                name: state.teams[team].name,
                score: state.teams[team].score
            }))
            .sort((a, b) => b.score - a.score);
        
        sortedTeams.forEach(team => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = team.name;
            
            const scoreCell = document.createElement('td');
            scoreCell.textContent = team.score;
            
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            leaderboardBody.appendChild(row);
        });
    }
}); 