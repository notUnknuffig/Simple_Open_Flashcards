console.log("flashcard");
const showBtn = document.getElementById("flash-show-button");
const resultVocab = document.getElementById("result-vocab");
const correctBtn = document.getElementById("flash-correct-button");
const incorrectBtn = document.getElementById("flash-incorrect-button");

function correctBtnHandler() {
	incrementScore();
	nextCard();
}

function incorrectBtnHandler() {
	incrementMistake();
	nextCard();
}

function showAnswer() {
	showBtn.style.display = "none";
	correctBtn.style.display = "block";
	incorrectBtn.style.display = "block";
	resultVocab.style.display = "block";
}
