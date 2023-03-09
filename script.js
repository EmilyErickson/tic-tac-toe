function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }
  const getBoard = () => board;

  const dropToken = (index, player) => {
    let column = index % 3;
    let row = (index - column) / 3;

    const targetCell = board[row][column];
    targetCell.addToken(player);
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    return boardWithCellValues;
  };

  const printNewBoard = () => {
    const boardWithEmptyCells = board.map((row) =>
      row.map((cell) => cell.resetValue())
    );
    return boardWithEmptyCells;
  };

  return { getBoard, dropToken, printBoard, printNewBoard };
}

function Cell() {
  let value = 0;

  const addToken = (player) => {
    value = player;
  };
  const getValue = () => value;

  const resetValue = () => {
    value = 0;
    return value;
  };

  return {
    resetValue,
    addToken,
    getValue,
  };
}

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  console.log(playerOneName);
  const board = Gameboard();
  const players = [
    {
      name: playerOneName,
      token: 1,
      marker: "X",
    },
    {
      name: playerTwoName,
      token: -1,
      marker: "O",
    },
  ];

  let activePlayer = players[0];
  let otherPlayer = players[1];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
    otherPlayer = otherPlayer === players[0] ? players[1] : players[0];
  };

  const getOtherPlayer = () => otherPlayer;

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    if (gameOver === false) {
      console.log(`${getActivePlayer().name}'s turn.`);
    } else if (gameOver === true) {
      console.log(`${getActivePlayer().name} won`);
    }
    console.log(board.printBoard());
  };

  let gameOver = false;
  let tie = false;

  const playRound = (index) => {
    if (gameOver === true) {
      return;
    }
    let column = index % 3;
    let row = (index - column) / 3;
    let targetValue = board.printBoard()[row][column];
    if (targetValue !== 0) {
      console.log("Invalid Move");
      return;
    }

    board.dropToken(index, getActivePlayer().token);

    const checkScore = () => {
      let field = board.printBoard();
      for (let i = 0; i < 3; i++) {
        let fullRow = field[i][0] + field[i][1] + field[i][2];
        let fullColumn = field[0][i] + field[1][i] + field[2][i];
        if (fullRow === 3 || fullColumn === 3) {
          getWinner();
        }
        if (fullRow === -3 || fullColumn === -3) {
          getWinner();
        }
      }
      let fullDiagonal1 = field[0][0] + field[1][1] + field[2][2];
      let fullDiagonal2 = field[0][2] + field[1][1] + field[2][0];
      if (fullDiagonal1 === 3 || fullDiagonal2 === 3) {
        getWinner();
        console.log(activePlayer.name);
      }
      if (fullDiagonal1 === -3 || fullDiagonal2 === -3) {
        getWinner();
        console.log(activePlayer.name);
      }
      if (
        field[0].indexOf(0) === -1 &&
        field[1].indexOf(0) === -1 &&
        field[2].indexOf(0) === -1
      ) {
        checkTie();
      }
    };

    checkScore();
    printNewRound();
    switchPlayerTurn();
    console.log(otherPlayer.name);
  };

  const resetGame = () => {
    gameOver = false;
    tie = false;
    board.board = board.getBoard();
    activePlayer = players[0];
    otherPlayer = players[1];
    console.log(board.printNewBoard());
    return { gameOver, board: board.printNewBoard };
  };

  const checkTie = () => {
    tie = true;
    return tie;
  };

  const getTie = () => tie;

  const getWinner = () => {
    gameOver = true;
    return gameOver;
  };

  const gameStatus = () => gameOver;

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getOtherPlayer,
    resetGame,
    getWinner,
    getTie,
    gameStatus,
    getBoard: board.getBoard,
  };
}

function ScreenController() {
  const container = document.querySelector(".container");
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const reset = document.querySelector(".reset");
  const intro = document.querySelector(".intro");

  const playerOne = document.querySelector("#playerOne");
  const playerTwo = document.querySelector("#playerTwo");
  const submit = document.querySelector("#start");

  submit.addEventListener("click", startGame);

  function startGame() {
    let playerOneName = playerOne.value;
    let playerTwoName = playerTwo.value;
    intro.classList.add("hidden");
    container.classList.remove("hidden");

    const game = GameController(playerOneName, playerTwoName);

    const updateScreen = () => {
      boardDiv.textContent = "";
      const board = game.getBoard();

      const activePlayer = game.getActivePlayer();
      const otherPlayer = game.getOtherPlayer();

      console.log(otherPlayer.name);

      if (game.gameStatus() === true) {
        playerTurnDiv.textContent = `${otherPlayer.name} Wins!`;
      } else if (game.getTie() === true) {
        playerTurnDiv.textContent = "It's a Tie!";
      } else {
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
      }

      board.forEach((row, index) => {
        let indexA = index;
        row.forEach((cell, indexB) => {
          let index = indexA + indexB;
          let column = index + (indexA % 3);

          const cellButton = document.createElement("button");
          cellButton.dataset.index = indexA + column;
          cellButton.classList.add("cell");
          boardDiv.appendChild(cellButton);
          if (cell.getValue() === 1) {
            cellButton.textContent = "X";
          } else if (cell.getValue() === -1) {
            cellButton.textContent = "O";
          } else {
            cellButton.textContent = "";
          }
        });
      });
    };

    function resetGame() {
      game.resetGame();
      updateScreen();
    }

    function clickHandlerBoard(e) {
      const selectedIndex = e.target.dataset.index;

      if (!selectedIndex) return;
      game.playRound(selectedIndex);
      updateScreen();
    }
    reset.addEventListener("click", resetGame);

    boardDiv.addEventListener("click", clickHandlerBoard);
    updateScreen();
  }
}

ScreenController();
