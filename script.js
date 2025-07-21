document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const state = {
        round: 1,
        maxRounds: 12,
        teams: {},
        history: [],
        gameStarted: false,
        currentLeader: null
    };

    // DOM elements
    const roundNumberEl = document.getElementById('round-number');
    const maxRoundsEl = document.getElementById('max-rounds');
    const calculateRoundBtn = document.getElementById('calculate-round');
    const resetGameBtn = document.getElementById('reset-game');
    const resetScoresBtn = document.getElementById('reset-scores');
    const historyContainer = document.getElementById('history-container');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const teamContainer = document.getElementById('teams-container');
    const gameConfigEl = document.getElementById('game-config');
    const startGameBtn = document.getElementById('start-game');
    const roundCountInput = document.getElementById('round-count');
    const leaderNameEl = document.getElementById('leader-name');
    
    // Event listeners
    calculateRoundBtn.addEventListener('click', calculateRound);
    resetGameBtn.addEventListener('click', resetGame);
    resetScoresBtn.addEventListener('click', resetScores);
    startGameBtn.addEventListener('click', startGame);
    
    // Hide the calculate button until game starts
    calculateRoundBtn.style.display = 'none';
    resetScoresBtn.style.display = 'none';

    // Start a new game with the configured settings
    function startGame() {
        // Get configuration values
        const teamCount = 4; // Fixed to 4 teams
        const roundCount = parseInt(roundCountInput.value);
        
        // Validate inputs
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
        state.currentLeader = null;
        
        // Update max rounds display
        maxRoundsEl.textContent = state.maxRounds;
        
        // Generate teams
        generateTeams(teamCount);
        
        // Hide config, show game
        gameConfigEl.style.display = 'none';
        calculateRoundBtn.style.display = 'block';
        resetScoresBtn.style.display = 'inline-block';
        
        // Update UI
        updateUI();
        
        // Set initial leader (all teams have same score at start, so pick Team A)
        state.currentLeader = 'A';
        leaderNameEl.textContent = state.teams['A'].name;
        
        // Update leaderboard to show initial leader
        updateLeaderboard();
    }
    
    // Generate team elements based on count
    function generateTeams(count) {
        // Clear the team container
        teamContainer.innerHTML = '';
        
        // Generate default team IDs (A, B, C, D)
        const teamIds = ['A', 'B', 'C', 'D'];
        
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
            
            // Use both input and change events for immediate updates
            const updateTeamName = (e) => {
                const newName = e.target.value;
                state.teams[id].name = newName;
                
                // Update leader display immediately if this team is the current leader
                if (id === state.currentLeader) {
                    leaderNameEl.textContent = newName;
                }
                
                // Update leaderboard
                updateLeaderboard();
            };
            
            nameInput.addEventListener('input', updateTeamName);
            nameInput.addEventListener('change', updateTeamName);
            
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
        if (whiteCount === 4) {
            // 4 Whites → -1 point each
            Object.keys(state.teams).forEach(team => {
                state.teams[team].score -= 1;
            });
        } else if (blackCount === 4) {
            // 4 Blacks → +1 point each
            Object.keys(state.teams).forEach(team => {
                state.teams[team].score += 1;
            });
        } else if (whiteCount === 3 && blackCount === 1) {
            // 3 Whites, 1 Black → +1 each for Whites, -3 for the Black
            Object.keys(state.teams).forEach(team => {
                if (state.teams[team].choice === 'White') {
                    state.teams[team].score += 1;
                } else {
                    state.teams[team].score -= 3;
                }
            });
        } else if (whiteCount === 1 && blackCount === 3) {
            // 1 White, 3 Blacks → +3 for the White, -1 each for the Blacks
            Object.keys(state.teams).forEach(team => {
                if (state.teams[team].choice === 'White') {
                    state.teams[team].score += 3;
                } else {
                    state.teams[team].score -= 1;
                }
            });
        } else if (whiteCount === 2 && blackCount === 2) {
            // 2 Whites, 2 Blacks → +2 each for Whites, -2 each for Blacks
            Object.keys(state.teams).forEach(team => {
                if (state.teams[team].choice === 'White') {
                    state.teams[team].score += 2;
                } else {
                    state.teams[team].score -= 2;
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

    // Reset scores without affecting team names or round count
    function resetScores() {
        if (confirm('Reset all team scores to zero? This will keep team names and current round.')) {
            // Save team names
            const teamNames = {};
            Object.keys(state.teams).forEach(team => {
                teamNames[team] = state.teams[team].name;
            });
            
            // Reset scores
            Object.keys(state.teams).forEach(team => {
                state.teams[team].score = 0;
                state.teams[team].choice = '';
                
                // Reset choice dropdowns
                const selectEl = document.getElementById(`team-${team}-choice`);
                if (selectEl) selectEl.value = '';
            });
            
            // Add a reset marker to history
            state.history.push({
                round: state.round - 1,
                isReset: true,
                message: `Scores reset after round ${state.round - 1}`
            });
            
            // Update UI
            updateUI();
            
            // Show notification
            const leaderContainer = document.querySelector('.current-leader');
            leaderContainer.classList.add('highlight-leader');
            setTimeout(() => {
                leaderContainer.classList.remove('highlight-leader');
            }, 1000);
        }
    }

    // Reset the game to initial state
    function resetGame() {
        // Reset to configuration screen
        state.gameStarted = false;
        state.round = 1;
        state.history = [];
        state.teams = {};
        state.currentLeader = null;
        
        // Show config, hide teams
        gameConfigEl.style.display = 'block';
        teamContainer.innerHTML = '';
        calculateRoundBtn.style.display = 'none';
        resetScoresBtn.style.display = 'none';
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
        
        // First determine the current leader
        updateCurrentLeader();
        
        // Then update the leaderboard with the new leader
        updateLeaderboard();
    }

    // Update the current leader display
    function updateCurrentLeader() {
        if (Object.keys(state.teams).length === 0) {
            leaderNameEl.textContent = 'None';
            state.currentLeader = null;
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
            const previousLeader = state.currentLeader;
            const newLeader = sortedTeams[0];
            state.currentLeader = newLeader.id;
            
            // Update leader name
            leaderNameEl.textContent = newLeader.name;
            
            // Add animation if leader changed
            if (previousLeader !== state.currentLeader) {
                // Add a temporary highlight effect
                const leaderContainer = document.querySelector('.current-leader');
                if (leaderContainer) {
                    leaderContainer.classList.add('highlight-leader');
                    setTimeout(() => {
                        leaderContainer.classList.remove('highlight-leader');
                    }, 1000);
                }
            }
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
            
            // Check if this is a reset marker
            if (roundData.isReset) {
                historyItem.className = 'history-item reset-marker';
                const resetMessage = document.createElement('p');
                resetMessage.className = 'reset-message';
                resetMessage.textContent = roundData.message;
                resetMessage.style.color = '#e74c3c';
                resetMessage.style.fontWeight = 'bold';
                historyItem.appendChild(resetMessage);
                historyContainer.appendChild(historyItem);
                return;
            }
            
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
            
            // Add leader class to the current leader
            if (team.id === state.currentLeader) {
                row.className = 'current-leader-row';
            }
            
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