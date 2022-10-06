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

    // Getters and setter
    const getInPlay = () => inPlay;
    const getPlayer = () => thisTurn.getSymbol();
    const getState = (index) => state[index];
    const setInPlay = () => inPlay = !inPlay;
    const setState = (index, value) => state[index] = value;

    const resetState = () => state.fill(' ');
    const togglePlayer = () => {
        thisTurn = (thisTurn == players[0]) ? players[1] : players[0];
    }

    // End state checkers
    const tieState = () => !state.includes(' ');
    const winState = (index) => {
        if (index % 2 == 0 && state[4] != ' ') {
            if (state[0] == state[4] && 
                state[0] == state[8]) { return true } 
            if (state[2] == state[4] && 
                state[2] == state[6]) { return true }
        }
        const row = Math.floor(index / 3) * 3;
        if (state[row] == state[row + 1] && 
            state[row] == state[row + 2]) { return true }
        const column = index % 3;
        if (state[column] == state[column + 3] && 
            state[column] == state[column + 6]) { return true }
        return false;
    }
    const isWin = (index) => {
        if (winState(index)) { return getPlayer() }
        if (tieState()) { return 'tie' }
        return null;
    }

    // --- TO DELETE FOR BUG TRACKING ---
    const printState = () => console.log(state);

    return {
        getInPlay,
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
    const newGame = () => {
        for (const block of document.getElementById('board').children) {
            block.innerHTML = ' ';
        }
        gameBoard.resetState();
        gameBoard.setInPlay();
        document.getElementById('board').classList.remove('no-play');
    }

    const bindNewGame = (element) => {
        element.addEventListener('click', (e) => {
            newGame();
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

    // confirms if the game is over and sets the board accordingly
    const checkWin = (win) => {
        if (!win) { return }
        const winButton = makeButton(
            (win == 'tie') ? `NO WINNER` : `${win} WINS`);
        const playAgainButton = makeButton('PLAY AGAIN?');
        bindNewGame(playAgainButton);
        document.getElementById('top').appendChild(winButton);
        document.getElementById('bottom').appendChild(playAgainButton);
        gameBoard.setInPlay();
    }

    // Player selectors on initial load-in
    (() => {const p1Button = makeButton('ONE PLAYER');
        document.getElementById('top').appendChild(p1Button);
        const p2Button = makeButton('TWO PLAYER');
        bindNewGame(p2Button);
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
                checkWin(gameBoard.isWin(index));
                gameBoard.togglePlayer();
            }
        })
    }
})();
