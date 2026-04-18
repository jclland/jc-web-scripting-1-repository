//words
var WORDS = [
    "ABYSS", "ALGAE", "ATOLL", "BEACH", "BRINE", "BROOK", "CANAL", "CANOE", 
    "COAST", "CORAL", "CREEK", "DELTA", "DEPTH", "DIVER", "DOCKS", "DRIFT", 
    "DUNES", "FERRY", "FJORD", "FLOAT", "FLOOD", "FOAMY", "GILLS", "GULCH", 
    "GULLS", "INLET", "ISLET", "JELLY", "KAYAK", "KELPS", "LAKES", "LINER", 
    "MARSH", "MISTY", "MOIST", "NAVAL", "OCEAN", "OTTER", "PEARL", "PIERS", 
    "POOLS", "PRAWN", "REEFS", "RIVER", "SANDS", "SCUBA", "SEALS", "SHARK", 
    "SHELL", "SHIPS", "SHORE", "SNAIL", "SPRAY", "SQUID", "STERN", "SWAMP", 
    "SWELL", "SWIMS", "TIDAL", "TIDES", "TOWEL", "WATER", "WAVES", "WHALE", 
    "WHARF", "WRECK", "YACHT", "SLOOP", "BARGE", "KRILL", "SNOOK", "PERCH", 
    "GUPPY", "BASIN", "SALTY", "FRESH", "BOATS", "FIZZY", "AZURE", "STORM",
    "GLAZE", "ZONAL", "DROWN", "ANOXI", "DRINK", "FLUID", "VAPOR", "FISHY"
];

//creates a game object for state
var game = {
    targetWord: "",
    currentRow: 0,
    currentCol: 0,
    guesses: ["", "", "", "", "", ""],
    state: "playing"
};

var board = document.getElementById("game-board");
var messageArea = document.getElementById("message-area");
var restartBtn = document.getElementById("restart-btn");

//picks a random word
function pickRandomWord() {
    var randomIndex = Math.floor(Math.random() * WORDS.length);
    game.targetWord = WORDS[randomIndex];
}

//generates the grid
function initBoard() {
    board.innerHTML = ""; 
    for (var i = 0; i < 30; i++) {
        var tile = document.createElement("div");
        tile.className = "tile";
        tile.id = "tile-" + i;
        board.appendChild(tile);
    }
}

//listen for keyboard input
document.addEventListener("keydown", function(event) {
    //ignore input if the game is not in the playing state
    if (game.state !== "playing") {
        return;
    }

    var key = event.key.toUpperCase();

    if (key === "ENTER") {
        submitGuess();
    } else if (key === "BACKSPACE") {
        removeLetter();
    } else if (key.length === 1 && key >= "A" && key <= "Z") {
        addLetter(key);
    }

    
    renderGame();
});

//handle letters
function addLetter(letter) {
    if (game.currentCol < 5) {
        game.guesses[game.currentRow] = game.guesses[game.currentRow] + letter;
        game.currentCol = game.currentCol + 1;
    }
}

//handle backspace
function removeLetter() {
    if (game.currentCol > 0) {
        var currentString = game.guesses[game.currentRow];
        game.guesses[game.currentRow] = currentString.substring(0, currentString.length - 1);
        game.currentCol = game.currentCol - 1;
    }
}

//check guess and update state
function submitGuess() {
    var currentGuess = game.guesses[game.currentRow];

    if (currentGuess.length < 5) {
        messageArea.textContent = "not enough letters!";
        return;
    }

    if (currentGuess === game.targetWord) {
        game.state = "win";
    } else if (game.currentRow === 5) {
        game.state = "lose";
    } else {
        game.currentRow = game.currentRow + 1;
        game.currentCol = 0;
        messageArea.textContent = "keep diving...";
    }
}

//renders the board
function renderGame() {
    for (var row = 0; row < 6; row++) {
        for (var col = 0; col < 5; col++) {
            var index = (row * 5) + col;
            var tile = document.getElementById("tile-" + index);
            var guessText = game.guesses[row];
            var letter = guessText[col] || "";

            tile.textContent = letter;

            //apply feedback colors
            if (row < game.currentRow || game.state !== "playing") {
                if (letter !== "") {
                    if (game.targetWord[col] === letter) {
                        tile.className = "tile correct";
                    } else if (game.targetWord.indexOf(letter) !== -1) {
                        tile.className = "tile present";
                    } else {
                        tile.className = "tile absent";
                    }
                }
            }
        }
    }

    if (game.state === "win") {
        messageArea.textContent = "you win!";
        restartBtn.className = "";
    } else if (game.state === "lose") {
        messageArea.textContent = "lost at sea! the word was " + game.targetWord;
        restartBtn.className = "";
    }
}

//restart logic
restartBtn.addEventListener("click", function() {
    game.currentRow = 0;
    game.currentCol = 0;
    game.guesses = ["", "", "", "", "", ""];
    game.state = "playing";
    messageArea.textContent = "type a word to begin.";
    restartBtn.className = "hidden";
    pickRandomWord();
    initBoard();
    renderGame();
});

//inital call
pickRandomWord();
initBoard();
renderGame();