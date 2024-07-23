let round = 0;
let score = 0;
let fails = 0;
let isRandom = false;
let data;

// Get Gamemodes | TODO: get gamemodes from settings.JSON File?
const gameModes = ["flashcard", "pick", "type"];

// Game Container
let gamePreloadContainer = undefined;

function startGame(data) {
	if (data == undefined) {
		data = JSON.parse(sessionStorage.getItem("loaded_stack"));
	}
	if (sessionStorage.getItem("round") != undefined) {
		round = Number(sessionStorage.getItem("round"));
		score = Number(sessionStorage.getItem("score"));
		fails = Number(sessionStorage.getItem("fails"));
	}
	gamePreloadContainer = document.getElementById("game-load-container");
	nextCard();
}

function nextCard() {
	// If no cards remain call game over
	if (round == data[0].length) {
		insertSnippet("gameover_snippet", [score, fails, round]);
		sessionStorage.setItem("loaded_stack", undefined);
		return;
	}

	// Save game Progress in session storage
	sessionStorage.setItem("round", round);
	sessionStorage.setItem("score", score);
	sessionStorage.setItem("fails", fails);

	// Process random game modes
	if (data[1] == "random" || isRandom == true) {
		isRandom = true;
		data[1] = gameModes[Math.floor(Math.random() * gameModes.length)];
	}

	// Preload new game snippet
	fetch(`./game_snippets/${data[1]}/${data[1]}_snippet.html`)
		.then((res) => {
			if (res.ok) {
				return res.text();
			}
		})
		.then((htmlSnippet) => {
			const preloadGameSnippetContainer = document.createElement("div");
			preloadGameSnippetContainer.innerHTML = htmlSnippet;
			preloadGameSnippetContainer.setAttribute("class", "game-snippet-container preload");
			preloadGameSnippetContainer.querySelector("#given-vocab").innerText = data[0][round][0];
			preloadGameSnippetContainer.querySelector("#result-vocab").innerText = data[0][round][1];
			preloadGameSnippetContainer.querySelector("#lang-info").innerText =
				stackDict[selected_stack]["languages"][data[2][round]];
			gamePreloadContainer.appendChild(preloadGameSnippetContainer);
		});
	round++;
}

// Innit the vocab game
function processVocabData(data, index) {
	const dirrection = document.getElementById("dir-select").value;
	const game = document.getElementById("game-select").value;
	let current_index = data.length - 1;
	let inverse_pos = Array.from(Array(data.length).fill(0));
	sessionStorage.setItem("round", 0);
	sessionStorage.setItem("score", 0);
	sessionStorage.setItem("fails", 0);

	while (current_index >= 0) {
		if (dirrection == 1) {
			inverse_pos[current_index] = 1;
			data[current_index].reverse();
		} else if (dirrection == 2) {
			if (Math.round(Math.random()) == 1) {
				inverse_pos[current_index] = 1;
				data[current_index].reverse();
			}
		}
		let random_index = Math.floor(Math.random() * current_index);
		if (current_index != 0) {
			current_index--;
			[data[current_index], data[random_index]] = [data[random_index], data[current_index]];
		} else {
			current_index--;
		}
	}
	sessionStorage.setItem("loaded_stack", JSON.stringify([data, game, inverse_pos]));
	sessionStorage.setItem("selected_section", index);
	insertSnippet("game_snippet", [data, game, inverse_pos]);
}
