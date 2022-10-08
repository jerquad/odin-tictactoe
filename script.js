// Player factory
const Player = (symbol) => {
    const getSymbol = () => symbol;
    return { getSymbol }
}

// Contains the logic for the gamestate
const gameBoard = (() => {
    
    const players = [Player('X'), Player('O')];
    const state = [...Array(9)].map(x => ' ');
    let inPlay = false;
    let thisTurn = players[0];
    let notThisTurn = players[1];

    // Getters and setter
    const getInPlay = () => inPlay;
    const getPlayer = () => thisTurn.getSymbol();
    const getOpponent = () => notThisTurn.getSymbol();
    const getState = (index) => state[index];
    const setInPlay = () => inPlay = !inPlay;
    const setState = (index, value) => state[index] = value;

    const resetState = () => state.fill(' ');
    const togglePlayer = () => {
        thisTurn = (thisTurn == players[0]) ? players[1] : players[0];
        notThisTurn = (notThisTurn == players[1]) ? players[0] : players[1];
    }

    // End state checkers
    const tieState = () => !state.includes(' ');
    const winState = (index) => {
        if (index % 2 == 0 && state[4] != ' ') {
            if (state[0] == state[4] && 
                state[0] == state[8]) { return [0, 4, 8] } 
            if (state[2] == state[4] && 
                state[2] == state[6]) { return [2, 4, 6] }
        }
        const row = Math.floor(index / 3) * 3;
        if (state[row] == state[row + 1] && 
            state[row] == state[row + 2]) { return [row, row + 1, row + 2] }
        const column = index % 3;
        if (state[column] == state[column + 3] && 
            state[column] == state[column + 6]) { return [column, column + 3, column + 6] }
        return false;
    }
    const isWin = (index) => {
        const win = winState(index);
        if (win) { return win }
        if (tieState()) { return 'tie' }
        return false;
    }

    const miniMax = (depth, isMax, win) => {
        if (win && win == 'tie') {
            return 0;
        } else if (win && !isMax) {
            return 10 - depth;
        } else if (win && isMax) {
            return -10 + depth;
        }

        if (isMax) {
            let best = -11;
            for (let i = 0; i < state.length; i++) {
                if (getState(i) == ' ') {
                    setState(i, getPlayer());
                    best = Math.max(best, miniMax(depth + 1, !isMax, isWin(i)));
                    setState(i, ' ');
                }
            }
            return best;
        }
        if (!isMax) {
            let best = 11;
            for (let i = 0; i < state.length; i++) {
                if (getState(i) == ' ') {
                    setState(i, getOpponent());
                    best = Math.min(best, miniMax(depth + 1, !isMax, isWin(i)));
                    setState(i, ' ');
                }
            }
            return best;
        }
    }

    // cycle through all states and returns the optimal move
    const cpuTurn = () => {
        togglePlayer();
        let bestMove = [ -1, -11 ];
        for (let i = 0; i < state.length; i++) {
            if (getState(i) == ' ') {
                setState(i, getPlayer());
                const max = miniMax(0, false, isWin(i));
                if (max > bestMove[1]) {
                    bestMove = [ i, max ];
                    // console.log(bestMove);
                }
                setState(i, ' ');
            }
        }
        setState(bestMove[0], getPlayer());
        return bestMove[0];
    }

    // --- TO DELETE FOR BUG TRACKING ---
    const printState = () => console.log(state);

    return {
        cpuTurn,
        getInPlay,
        getOpponent,
        getPlayer,
        getState,
        isWin,
        printState,
        resetState,
        setInPlay,
        setState,
        tieState,
        togglePlayer,
        winState
    }
})();

// Controller for interacting with the DOM
const displayController = (() => {
    let onePlayer = false;
    
    const newGame = () => {
        for (const block of document.getElementById('board').children) {
            block.innerHTML = ' ';
            block.className = ' ';
        }
        gameBoard.resetState();
        gameBoard.setInPlay();
        document.getElementById('board').classList.remove('no-play');
    }

    // Binds the various buttons for new games
    const bindNewGame = (element, singlePlay) => {
        element.addEventListener('click', (e) => {
            newGame();
            if (singlePlay) { onePlayer = true; }
            document.querySelectorAll('.start-type').forEach(button => {
                button.parentNode.removeChild(button);
            })
        })
    }

    const makeButton = (text) => {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('start-type');
        button.innerHTML = text;
        return button;
    }

    // fades out the display area after game, highlighting the winning move
    const disableDisplay = (win) => {
        document.getElementById('board').classList.add('no-play');
        for (const block of document.getElementById('board').children) {
            if (win == 'tie' || !win.includes(Number(block.id.slice(-1)))) {
                block.classList.add('no-block');
            }
        }
    }

    // confirms if the game is over and sets the board accordingly
    const checkWin = (win) => {
        if (!win) { return }
        const winButton = makeButton(
            (win == 'tie') ? `NO WINNER` : `${gameBoard.getPlayer()} WINS`);
        const playAgainButton = makeButton('PLAY AGAIN?');
        bindNewGame(playAgainButton, false);
        disableDisplay(win);
        document.getElementById('top').appendChild(winButton);
        document.getElementById('bottom').appendChild(playAgainButton);
        gameBoard.setInPlay();
    }

    // Player selectors on initial load-in
    (() => {
        const p1Button = makeButton('ONE PLAYER');
        bindNewGame(p1Button, true);
        document.getElementById('top').appendChild(p1Button);
        const p2Button = makeButton('TWO PLAYER');
        bindNewGame(p2Button, false);
        document.getElementById('bottom').appendChild(p2Button);
    })();
    
    // Bindings for each square on the gameboard
    for (const block of document.getElementById('board').children) {
        const index = block.id.slice(-1);

        // Highlights a square when hovered over
        block.addEventListener('pointerenter', (e) => {
            if (gameBoard.getState(index) == ' ' && gameBoard.getInPlay()) {
                e.target.innerHTML = gameBoard.getPlayer();
                e.target.classList.add('hover');
            }
        });

        // Clear square highlighting
        block.addEventListener('pointerleave', (e) => {
            if (gameBoard.getState(index) == ' ' && gameBoard.getInPlay()) {
                e.target.innerHTML = '';
                e.target.classList.remove('hover');
            }
        });

        // Sets all actions taken on a click
        block.addEventListener('click', (e) => {
            if (gameBoard.getState(index) == ' ' && gameBoard.getInPlay()) {           
                e.target.innerHTML = gameBoard.getPlayer();
                e.target.classList.remove('hover');
                gameBoard.setState(index, gameBoard.getPlayer());
                const isWin = gameBoard.isWin(index);
                if (!isWin && onePlayer) {
                    const move = gameBoard.cpuTurn();
                    const block = document.querySelector(`#board :nth-child(${move + 1})`);
                    block.innerHTML = gameBoard.getPlayer();
                    checkWin(gameBoard.isWin(move));
                }
                checkWin(isWin);
                gameBoard.togglePlayer();
            }
        })
    }
})();
