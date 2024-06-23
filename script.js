document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const turnDisplay = document.getElementById('turn');
    const scoreDisplay = document.getElementById('score');
    const resetButton = document.getElementById('reset');
    const playWithFriendButton = document.getElementById('play-with-friend');
    const playWithAIButton = document.getElementById('play-with-ai');
    const message = document.createElement('div');
    message.id = 'message';
    document.body.appendChild(message);

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let scores = { X: 0, O: 0 };
    let isGameOver = false;
    let playWithAI = false;

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    cells.forEach(cell => {
        cell.addEventListener('click', handleClick);
    });

    resetButton.addEventListener('click', resetGame);
    playWithFriendButton.addEventListener('click', startGameWithFriend);
    playWithAIButton.addEventListener('click', startGameWithAI);

    function handleClick(event) {
        const cell = event.target;
        const index = cell.getAttribute('data-index');

        if (board[index] === '' && !isGameOver) {
            board[index] = currentPlayer;
            cell.textContent = currentPlayer;
            checkWinner();
            if (!isGameOver) {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                turnDisplay.textContent = `Turn: ${currentPlayer}`;
            }

            if (playWithAI && currentPlayer === 'O' && !isGameOver) {
                setTimeout(aiMove, 50);
            }
        }
    }

    function checkWinner() {
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                isGameOver = true;
                scores[board[a]]++;
                scoreDisplay.textContent = `X Wins: ${scores.X} | O Wins: ${scores.O}`;
                turnDisplay.textContent = `${board[a]} Wins!`;
                displayMessage(`${board[a]} Wins!`);
                markWinningCells(combination);
                drawWinningLine(combination);
                toggleButtons(false);
                return;
            }
        }

        if (!board.includes('')) {
            isGameOver = true;
            turnDisplay.textContent = 'Draw!';
            displayMessage('Draw!');
            toggleButtons(false);
        }
    }

    function markWinningCells(combination) {
        const [a, b, c] = combination;
        cells[a].classList.add('strike-through');
        cells[b].classList.add('strike-through');
        cells[c].classList.add('strike-through');
    }

    function drawWinningLine(combination) {
        const line = document.querySelector('.line');
        if (line) line.remove();

        const [a, b, c] = combination;
        const gameBoard = document.getElementById('game');
        const firstCell = cells[a];
        const lastCell = cells[c];

        const rectFirst = firstCell.getBoundingClientRect();
        const rectLast = lastCell.getBoundingClientRect();
        const gameRect = gameBoard.getBoundingClientRect();

        const x1 = rectFirst.left - gameRect.left + rectFirst.width / 2;
        const y1 = rectFirst.top - gameRect.top + rectFirst.height / 2;
        const x2 = rectLast.left - gameRect.left + rectLast.width / 2;
        const y2 = rectLast.top - gameRect.top + rectLast.height / 2;

        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

        const newLine = document.createElement('div');
        newLine.classList.add('line');
        newLine.style.width = `${length}px`;
        newLine.style.transform = `rotate(${angle}deg)`;
        newLine.style.top = `${y1}px`;
        newLine.style.left = `${x1}px`;
        gameBoard.appendChild(newLine);
    }

    function displayMessage(text) {
        message.textContent = text;
        message.classList.add('show');
    }

    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('strike-through');
        });
        currentPlayer = 'X';
        isGameOver = false;
        turnDisplay.textContent = `Turn: ${currentPlayer}`;
        message.classList.remove('show');
        const line = document.querySelector('.line');
        if (line) line.remove();
        toggleButtons(true);
    }

    function aiMove() {
        const bestMove = findBestMove(board);
        board[bestMove] = 'O';
        document.querySelector(`.cell[data-index='${bestMove}']`).textContent = 'O';
        checkWinner();
        if (!isGameOver) {
            currentPlayer = 'X';
            turnDisplay.textContent = `Turn: ${currentPlayer}`;
        }
    }

    function findBestMove(board) {
        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        return move;
    }

    function minimax(board, depth, isMaximizing) {
        let result = evaluate(board);
        if (result !== null) {
            return result;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function evaluate(board) {
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a] === 'O' ? 10 : -10;
            }
        }

        if (!board.includes('')) {
            return 0;
        }

        return null;
    }

    function toggleButtons(showPlayButtons) {
        if (showPlayButtons) {
            resetButton.style.display = 'none';
            playWithFriendButton.style.display = 'inline-block';
            playWithAIButton.style.display = 'inline-block';
        } else {
            resetButton.style.display = 'inline-block';
            playWithFriendButton.style.display = 'none';
            playWithAIButton.style.display = 'none';
        }
    }

    function startGameWithFriend() {
        playWithAI = false;
        resetGame();
        resetButton.style.display = 'inline-block';
        playWithFriendButton.style.display = 'none';
        playWithAIButton.style.display = 'none';
    }

    function startGameWithAI() {
        playWithAI = true;
        resetGame();
        resetButton.style.display = 'inline-block';
        playWithFriendButton.style.display = 'none';
        playWithAIButton.style.display = 'none';
    }

    // Initialize the button visibility
    toggleButtons(true);

    cells.forEach(cell => cell.addEventListener('click', handleClick));
    resetButton.addEventListener('click', resetGame);
    playWithFriendButton.addEventListener('click', startGameWithFriend);
    playWithAIButton.addEventListener('click', startGameWithAI);
});