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
    let winIndex = null;

    // Getters and setter
    const getInPlay = () => inPlay;
    const getPlayer = () => thisTurn.getSymbol();
    const getOpponent = () => notThisTurn.getSymbol();
    const getState = (index) => state[index];
    const setInPlay = () => inPlay = !inPlay;
    const setState = (index, value) => state[index] = value;

    const resetState = () => {
        state.fill(' ');
        winIndex = null;
    }
    const togglePlayer = () => {
        thisTurn = (thisTurn == players[0]) ? players[1] : players[0];
        notThisTurn = (notThisTurn == players[1]) ? players[0] : players[1];
    }

    // End state checkers
    const tieState = () => {
        (!state.includes(' ') && winIndex == null);
    }
    const winState = (index) => {
        if (index % 2 == 0 && state[4] != ' ') {
            if (state[0] == state[4] && 
                state[0] == state[8]) { 
                    winIndex = [0, 4, 8];
                    return true;
                } 
            if (state[2] == state[4] && 
                state[2] == state[6]) { 
                    winIndex = [2, 4, 6];
                    return true;
                }
        }
        const row = Math.floor(index / 3) * 3;
        if (state[row] == state[row + 1] && 
            state[row] == state[row + 2]) {
                winIndex = [row, row + 1, row + 2];
                return true;
            }
        const column = index % 3;
        if (state[column] == state[column + 3] && 
            state[column] == state[column + 6]) {
                winIndex = [column, column + 3, column + 6];
                return true;}
        return false;
    }

    const getWin = () => winIndex;
    

    const miniMax = (depth, isMaxTurn, win) => {
        if (tieState()) {
            return 0;
        } else if (win && !isMaxTurn) {
            winIndex = null;
            return 10 - depth;
        } else if (win && isMaxTurn) {
            winIndex = null;
            return -10 + depth;
        }

        if (isMaxTurn) {
            let best = -11;
            for (let i = 0; i < state.length; i++) {
                if (getState(i) == ' ') {
                    setState(i, getPlayer());
                    best = Math.max(best, miniMax(depth + 1, !isMaxTurn, winState(i)));
                    setState(i, ' ');
                }
            }
            return best;
        }
        if (!isMaxTurn) {
            let best = 11;
            for (let i = 0; i < state.length; i++) {
                if (getState(i) == ' ') {
                    setState(i, getOpponent());
                    best = Math.min(best, miniMax(depth + 1, !isMaxTurn, winState(i)));
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
                const max = miniMax(0, false, winState(i));
                if (max > bestMove[1]) {
                    bestMove = [ i, max ];
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
        getWin,
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
    const disableDisplay = () => {
        document.getElementById('board').classList.add('no-play');
        for (const block of document.getElementById('board').children) {
            if ((gameBoard.tieState()) || !gameBoard.getWin().includes(Number(block.id.slice(-1)))) {
                block.classList.add('no-block');
            }
        }
    }

    // confirms if the game is over and sets the board accordingly
    const setWin = () => {
        disableDisplay();
        const winButton = makeButton(
            (gameBoard.tieState()) ? `NO WINNER` : `${gameBoard.getPlayer()} WINS`);
        const playAgainButton = makeButton('PLAY AGAIN?');
        bindNewGame(playAgainButton, false);
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

    const setBlock = (block, toSet) => {
        block.innerHTML = toSet;
        block.className = '';
    }

    const soloPlay = () => {
        const move = gameBoard.cpuTurn();
        setBlock(document.querySelector(
            `#board :nth-child(${move + 1})`), 
            gameBoard.getPlayer());
        console.log('them: ' + gameBoard.printState());
        return move;  
    }

    const isGameOver = (index) => {
        if (gameBoard.winState(index) || gameBoard.tieState()) return true;
        return false;
    }
    
    // Bindings for each square on the gameboard
    for (const block of document.getElementById('board').children) {
        const index = block.id.slice(-1);

        // Highlights a square when hovered over
        block.addEventListener('pointerenter', (e) => {
            if (gameBoard.getState(index) != ' ' || !gameBoard.getInPlay()) { return; }
            setBlock(e.target, gameBoard.getPlayer());
            e.target.classList.add('hover');
        });

        // Clear square highlighting
        block.addEventListener('pointerleave', (e) => {
            if (gameBoard.getState(index) != ' ' || !gameBoard.getInPlay()) { return; }
            setBlock(e.target, '');
        });

        // Sets all actions taken on a click
        block.addEventListener('click', (e) => {
            if (gameBoard.getState(index) != ' ' || !gameBoard.getInPlay()) { return; }
            console.log('you: ' + gameBoard.printState());
            e.target.classList.remove('hover');
            gameBoard.setState(index, gameBoard.getPlayer());
            if (isGameOver(index) || (onePlayer && isGameOver(soloPlay()))) { 
                setWin(); 
            } 
            gameBoard.togglePlayer();            
        })
    }
})();
