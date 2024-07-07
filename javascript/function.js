const reader = new FileReader();
let loadedFile = "";
let stackDict = [];
let selected_stack = "";
let selected_sectionized_stack = [];

const snippetInsertionPiont = document.getElementById("snippet-insert");
const dialogInsertionPiont = document.getElementById("dialog-insert");

if (localStorage.getItem("stored_stacks") != null) {
    stackDict = JSON.parse(localStorage.getItem("stored_stacks"));
}
if (sessionStorage.getItem("selected_stack") != null) {
    selected_stack = sessionStorage.getItem("selected_stack");
}
if (sessionStorage.getItem("current_snippet") == undefined) {
    sessionStorage.setItem("current_snippet", "home_snippet");
}
insertSnippet(sessionStorage.getItem("current_snippet"));

reader.addEventListener("load", function (e) {
    let fileContents = e.target.result;
    loadedFile = fileContents;
    insertSnippet("storage_dialog");
});

// insert HTML-snippets into main HTML file
function insertSnippet(fileName, data) {
    if (fileName == "random_game_snippet") {
        fileName = ["flashcard_game_snippet", "type_game_snippet", "pick_game_snippet"][Math.floor(Math.random() * 3)];
    }
    fetch(`./html_snippets/${fileName}.html`)
        .then((res) => {
            if (res.ok) {
                return res.text();
            }
        })
        .then((htmlSnippet) => {
            if (fileName.endsWith("dialog")) {
                dialogInsertionPiont.innerHTML = htmlSnippet;
            } else {
                snippetInsertionPiont.innerHTML = htmlSnippet;
                sessionStorage.setItem("current_snippet", fileName);
            }
            switch (fileName) {
                case "import_stack_snippet":
                    innit_import();
                    break;
                case "hosted_stack_snippet":
                    innit_host();
                    break;
                case "storage_dialog":
                    innit_storage_dialog();
                    break;
                case "collections_snippet":
                    innit_collection();
                    break;
                case "sections_snippet":
                    innit_sections(data);
                    break;
                case "game_snippet":
                    innit_game(data);
                    break;
                case "gameover_snippet":
                    innit_gameover(data);
                    break;
                case "search_snippet":
                    innit_search();
                    break;
                case "edit_snippet":
                    innit_edit(data);
                    break;
                default:
                    break;
            }
        });
}

//innit scripts for HTML-Snippets
function innit_import() {
    const file_input = document.getElementById("file");
    const droparea = document.getElementById("file-droparea");
    const prevents = (e) => e.preventDefault();
    const active = () => droparea.classList.add("active");
    const inactive = () => droparea.classList.remove("active");

    const handelDrop = (e) => {
        const dt = e.dataTransfer;
        const files = [...dt.files];
        processSingleFiles(files);
    };
    const getFiles = () => {
        let files = [...file_input.files];
        processSingleFiles(files);
    };

    droparea.addEventListener("drop", handelDrop);
    ["dragenter", "dragover", "dragleave", "drop"].forEach((evtName) => {
        droparea.addEventListener(evtName, prevents);
    });
    ["dragenter", "dragover"].forEach((evtName) => {
        droparea.addEventListener(evtName, active);
    });
    ["dragleave", "drop"].forEach((evtName) => {
        droparea.addEventListener(evtName, inactive);
    });

    file_input.addEventListener("change", getFiles, false);
}

function innit_host() {
    const acc_name = document.getElementById("acc-name");
    const rep_name = document.getElementById("rep-name");
    const fil_name = document.getElementById("fil-name");
    const fil_select = document.getElementById("fil-select");
    const fil_select_txt = document.getElementById("fil-select-txt");
    const gh_import = document.getElementById("gh-import");

    const web_link = document.getElementById("web-link");
    const web_import = document.getElementById("web-submit");

    const gh_submit = (e) => {
        if (acc_name.value === "" && rep_name.value === "" && fil_name.value === "" && fil_select.value !== "") {
            importFromGitHub(fil_select.value);
        } else if (acc_name.value !== "" && rep_name.value !== "" && fil_name.value !== "" && fil_select.value === "") {
            importFromGitHub(fil_name.value, acc_name.value, rep_name.value);
        }
    };

    const web_submit = (e) => {
        if (web_link.value !== "") {
            importFromWeb(web_link.value);
        }
    };

    const fill_form = (e) => {
        if (acc_name.value === "" && rep_name.value === "" && fil_name.value === "") {
            fil_select.style.display = "block";
            fil_select_txt.style.display = "block";
        } else {
            fil_select.value = "";
            fil_select.style.display = "none";
            fil_select_txt.style.display = "none";
        }
    };

    gh_import.addEventListener("click", gh_submit);

    web_import.addEventListener("click", web_submit);

    [acc_name, rep_name, fil_name].forEach((element) => {
        element.addEventListener("keyup", fill_form);
    });
}

function innit_collection() {
    const empty_text = document.getElementById("empty-txt");
    if (stackDict.length == 0) {
        empty_text.style.display = "block";
        return;
    } else {
        const stack_list = document.getElementById("stack-list");
        empty_text.style.display = "none";
        fetch(`./html_snippets/stack_element.html`)
            .then((res) => {
                if (res.ok) {
                    return res.text();
                }
            })
            .then((htmlSnippet) => {
                for (const [key, value] of Object.entries(stackDict)) {
                    stack_list.innerHTML = stack_list.innerHTML + htmlSnippet.replace(/__key/g, key);
                }
            });
    }
}

function innit_game(data) {
    let round = 0;
    let score = 0;
    let fails = 0;
    let isRandom = false;

    if (data == undefined) {
        data = JSON.parse(sessionStorage.getItem("loaded_stack"));
    }
    if (sessionStorage.getItem("round") != undefined) {
        round = Number(sessionStorage.getItem("round"));
        score = Number(sessionStorage.getItem("score"));
        fails = Number(sessionStorage.getItem("fails"));
    }

    const inputContainer = document.getElementById("input-container");
    const gameModes = [
        "<div class='flashcard-input'><button id='show-button'>Show</button>",
        "<div class='flashcard-input'><button id='button_1'>Known</button><button id='button_2'>Unknown</button></div>",
        "<div class='type-input'><input type='text' id='text-input' /><button id='button_1'>Enter</button></div>",
        "<div class='pick-input'><button id='button_1'>Enter</button><button id='button_2'>Enter</button><button id='button_3'>Enter</button><button id='button_4'>Enter</button></div>",
    ];

    const flashcardContainer = document.getElementById("flashcard-container");
    const nextCard = () => {
        if (round == data[0].length) {
            insertSnippet("gameover_snippet", [score, fails, round]);
            sessionStorage.setItem("loaded_stack", undefined);
            return;
        }
        const cardStr = `<div class="flashcard"><p id="vocab">${data[0][round][0]}</p>
        <p id="result-vocab">${data[0][round][1]}</p>
        <p class="lang-info">${stackDict[selected_stack]["languages"][data[2][round]]}</p></div>`;
        flashcardContainer.innerHTML = cardStr;
        sessionStorage.setItem("round", round);
        sessionStorage.setItem("score", score);
        sessionStorage.setItem("fails", fails);

        if (data[1] == "random" || isRandom == true) {
            isRandom = true;
            data[1] = ["flashcard", "type", "pick"][Math.floor(Math.random() * 3)];
        }
        if (data[1] == "flashcard") {
            inputContainer.innerHTML = gameModes[0];
            document.getElementById("show-button").addEventListener("click", (e) => {
                inputContainer.innerHTML = gameModes[1];
                document.getElementById("result-vocab").style.display = "block";
                document.getElementById("button_1").addEventListener("click", (e) => {
                    score++;
                    nextCard();
                });
                document.getElementById("button_2").addEventListener("click", (e) => {
                    fails++;
                    nextCard();
                });
            });
        } else if (data[1] == "type") {
            inputContainer.innerHTML = gameModes[2];
            const text_field = document.getElementById("text-input");
            text_field.select();
            text_field.focus();
            let current_fails = 0;
            let word = data[0][round][1];
            const evaluateInput = () => {
                if (text_field.value.toLowerCase() == word.split(" (")[0].toLowerCase()) {
                    if (current_fails >= 5) {
                        score++;
                    }
                    nextCard();
                } else {
                    current_fails++;
                    if (current_fails == 5) {
                        document.getElementById("result-vocab").style.display = "block";
                        fails++;
                    }
                }
            };
            text_field.addEventListener("keydown", (e) => {
                if (e.key == "Enter") {
                    evaluateInput();
                }
            });
            document.getElementById("button_1").addEventListener("click", evaluateInput);
        } else if (data[1] == "pick") {
            inputContainer.innerHTML = gameModes[3];
            const button_array = [
                document.getElementById("button_1"),
                document.getElementById("button_2"),
                document.getElementById("button_3"),
                document.getElementById("button_4"),
            ];
            let resultIndex = Math.floor(Math.random() * 4);
            let usedIndecies = [round];
            for (let i = 0; i < button_array.length; i++) {
                const element = button_array[i];
                if (i == resultIndex) {
                    element.innerHTML = data[0][round][1];
                    element.addEventListener("click", () => {
                        score++;
                        nextCard();
                    });
                } else {
                    let randomIndex = Math.floor(Math.random() * data[0].length);
                    while (usedIndecies.indexOf(randomIndex) !== -1) {
                        randomIndex = Math.floor(Math.random() * data[0].length);
                    }
                    usedIndecies.push(randomIndex);
                    element.innerHTML =
                        data[0][randomIndex][Math.abs(data[2][round] - Math.abs(data[2][randomIndex] - 1))].split(
                            " ("
                        )[0];
                    element.addEventListener("click", (e) => {
                        fails++;
                    });
                }
            }
        }
        round++;
    };

    nextCard();
}

function innit_gameover(data) {
    if (data == undefined) {
        data = [sessionStorage.getItem("score"), sessionStorage.getItem("fails"), sessionStorage.getItem("round")];
    }

    const count = document.getElementById("count");
    const fails = document.getElementById("fails");
    const points = document.getElementById("points");

    const section_index = sessionStorage.getItem("selected_section");
    const progress = data[0] / data[2];
    stackDict[selected_stack]["progress"][section_index] = progress;
    localStorage.setItem("stored_stacks", JSON.stringify(stackDict));

    count.innerHTML = data[2];
    fails.innerHTML = data[1];
    points.innerHTML = data[0];
}

function innit_sections(key) {
    if (key != undefined) {
        selected_stack = key;
        sessionStorage.setItem("selected_stack", key);
    }
    const langs = stackDict[selected_stack]["languages"];
    selected_sectionized_stack = sectionize(stackDict[selected_stack]["stack"]);
    document.getElementById("info-card").innerHTML = langs[0] + " - " + langs[1];
    document.getElementById("forwards-select").innerHTML = langs[0] + " - " + langs[1];
    document.getElementById("backwards-select").innerHTML = langs[1] + " - " + langs[0];

    const save_button = document.getElementById("save-button");
    const delete_button = document.getElementById("delete-button");

    if (JSON.parse(localStorage.getItem("stored_stacks"))[selected_stack] != undefined) {
        save_button.setAttribute("class", "cr-input");
        delete_button.setAttribute("class", "cr-input active");
        delete_button.addEventListener("click", (e) => {
            let storedFiles = {};
            if (localStorage.getItem("stored_stacks") != null) {
                storedFiles = JSON.parse(localStorage.getItem("stored_stacks"));
            }
            delete storedFiles[selected_stack];
            localStorage.setItem("stored_stacks", JSON.stringify(storedFiles));
            insertSnippet("collections_snippet");
        });
    } else {
        save_button.setAttribute("class", "cr-input active");
        save_button.addEventListener("click", (e) => {
            let storedFiles = {};
            if (localStorage.getItem("stored_stacks") != null) {
                storedFiles = JSON.parse(localStorage.getItem("stored_stacks"));
            }
            storedFiles[selected_stack] = stackDict[selected_stack];
            localStorage.setItem("stored_stacks", JSON.stringify(storedFiles));
            insertSnippet("sections_snippet");
        });
        delete_button.setAttribute("class", "cr-input");
    }

    document.getElementById("custom-range").addEventListener("keydown", (e) => {
        if (e.key == "Enter") {
            selectCustomRange();
        }
    });
    const stack_list = document.getElementById("stack-list");
    fetch(`./html_snippets/section_element.html`)
        .then((res) => {
            if (res.ok) {
                return res.text();
            }
        })
        .then((htmlSnippet) => {
            for (let i = 0; i < selected_sectionized_stack.length; i++) {
                let progress = stackDict[selected_stack]["progress"][i];
                if (progress == null || progress == undefined) {
                    progress = 0;
                }
                stack_list.innerHTML =
                    stack_list.innerHTML +
                    htmlSnippet
                        .replace(/__key/g, i + 1)
                        .replace(/__nprogress/g, Math.round(progress * 100))
                        .replace(/__progress/g, progress);
            }
        });
}

function innit_storage_dialog() {
    const acc_btn = document.getElementById("accept-button");
    const dcl_btn = document.getElementById("decline-button");
    const _stack_name = document.getElementById("dict-name");

    acc_btn.addEventListener("click", (e) => {
        if (_stack_name.value != "") {
            let storedFiles = {};
            if (localStorage.getItem("stored_stacks") != null) {
                storedFiles = JSON.parse(localStorage.getItem("stored_stacks"));
            }
            storedFiles[_stack_name.value] = {
                languages: headerLang(loadedFile),
                stack: loadedFile,
                progress: [],
            };
            localStorage.setItem("stored_stacks", JSON.stringify(storedFiles));
            stackDict[_stack_name.value] = {
                languages: headerLang(loadedFile),
                stack: loadedFile,
                progress: [],
            };
            loadedFile = "";
            dialogInsertionPiont.innerHTML = "";
        } else {
            alert("Enter a name for the stack");
        }
    });
    dcl_btn.addEventListener("click", (e) => {
        if (_stack_name.value != "") {
            stackDict[_stack_name.value] = {
                languages: headerLang(loadedFile),
                stack: loadedFile,
                progress: [],
            };
            loadedFile = "";
            dialogInsertionPiont.innerHTML = "";
        } else {
            alert("Enter a name for the stack");
        }
    });
}

function innit_search() {
    const search_input = document.getElementById("search-input");
    const search_button = document.getElementById("search-button");
    const stack_list = document.getElementById("stack-list");
    const vocab_list = document.getElementById("vocab-list");
    sessionStorage.setItem("selected_stack", "");
    for (const [key, value] of Object.entries(stackDict)) {
        stack_list.innerHTML = stack_list.innerHTML + `<button>${key}</button>`;
    }
    selected_stack = "";
    const child_list = stack_list.children;
    for (let i = 0; i < child_list.length; i++) {
        const child = child_list[i];
        child.addEventListener("click", (e) => {
            if (selected_stack != child.innerHTML) {
                for (let i = 0; i < child_list.length; i++) {
                    child_list[i].setAttribute("class", "inactive");
                }
                child.setAttribute("class", "active");
                selected_stack = child.innerHTML;
                sessionStorage.setItem("selected_stack", child.innerHTML);
            } else {
                child.setAttribute("class", "inactive");
                selected_stack = "";
                sessionStorage.setItem("selected_stack", "");
            }
        });
    }
    let itemCount = 0;
    let overflowItems = {};
    let overflow = false;
    let currentIndex = 0;
    const search = async () => {
        itemCount = 0;
        overflowItems = {};
        overflow = false;
        currentIndex = 0;
        str = search_input.value;
        vocab_list.innerHTML = "";
        // if (str.length <= 1) return;
        if (selected_stack == "") {
            for (const [key, value] of Object.entries(stackDict)) {
                header = stackDict[key]["languages"];
                overflowItems[key] = [[header[0], header[1]]];
                if (itemCount < 100) {
                    vocab_list.innerHTML += `<div class="header"><p>${header[0]}</p><p>${header[1]}</p><p>Section</p></div>`;
                }
                value_array = value["stack"].split("\n");
                for (let j = 1; j < value_array.length; j++) {
                    if (value_array[j].includes(str)) {
                        if (itemCount < 100) {
                            const split_vocab = value_array[j].split(";");
                            vocab_list.innerHTML += `<div class="vocab"><p>${split_vocab[0]}</p><p>${split_vocab[1]}</p><p>${split_vocab[3]}</p></div>`;
                            overflowItems[key].push(value_array[j].split(";"));
                        } else {
                            overflow = true;
                            overflowItems[key].push(value_array[j].split(";"));
                        }
                        itemCount++;
                    }
                }
            }
        } else {
            header = stackDict[selected_stack]["languages"];
            vocab_list.innerHTML += `<div class="header"><p>${header[0]}</p><p>${header[1]}</p><p>Section</p></div>`;
            value_array = stackDict[selected_stack]["stack"].split("\n");
            for (let j = 1; j < value_array.length; j++) {
                if (value_array[j].includes(str)) {
                    itemCount++;
                    if (itemCount <= 100) {
                        const split_vocab = value_array[j].split(";");
                        overflowItems[selected_stack].push(value_array[j].split(";"));
                        vocab_list.innerHTML += `<div class="vocab"><p>${split_vocab[0]}</p><p>${split_vocab[1]}</p><p>${split_vocab[3]}</p></div>`;
                    } else {
                        overflowItems[selected_stack].push(value_array[j].split(";"));
                    }
                }
            }
        }
        if (overflow === true) {
            document.getElementById("more-buttons").style.display = "flex";
        } else {
            document.getElementById("more-buttons").style.display = "none";
        }
    };
    search_button.addEventListener("click", search);
    search_input.addEventListener("keydown", (e) => {
        if (e.key == "Enter") {
            search();
        }
    });
    const displayCurrent = () => {
        vocab_list.innerHTML = "";
        let countedValues = 0;
        for (const [key, value] of Object.entries(overflowItems)) {
            if (currentIndex - countedValues < value.length) {
                // Display Header
                header = stackDict[key]["languages"];
                vocab_list.innerHTML += `<div class="header"><p>${header[0]}</p><p>${header[1]}</p><p>Section</p></div>`;
                // Display
                if (currentIndex + 100 - countedValues < value.length) {
                    for (
                        let i = Math.max(currentIndex - countedValues, 0) + 1;
                        i < currentIndex - countedValues + 101;
                        i++
                    ) {
                        const vocab = value[i];
                        vocab_list.innerHTML += `<div class="vocab"><p>${vocab[0]}</p><p>${vocab[1]}</p><p>${vocab[3]}</p></div>`;
                    }
                    return;
                } else {
                    for (let i = Math.max(currentIndex - countedValues, 0) + 1; i < value.length; i++) {
                        const vocab = value[i];
                        vocab_list.innerHTML += `<div class="vocab"><p>${vocab[0]}</p><p>${vocab[1]}</p><p>${vocab[3]}</p></div>`;
                    }
                }
            }
            countedValues += value.length;
        }
    };
    document.getElementById("previous-button").addEventListener("click", (e) => {
        window.scrollTo(0, 0);
        if (currentIndex >= 100) {
            currentIndex -= 100;
            displayCurrent();
        }
    });
    document.getElementById("next-button").addEventListener("click", (e) => {
        window.scrollTo(0, 0);
        if (currentIndex + 100 <= itemCount) {
            currentIndex += 100;
            displayCurrent();
        }
    });
}

function innit_edit(key) {
    if (key == undefined) {
        selected_sectionized_stack = sectionize(stackDict[selected_stack]["stack"]);
        key = sessionStorage.getItem("selected_section");
    } else {
        sessionStorage.setItem("selected_section", key);
    }
    document.getElementById("vocab-list-title").innerText = `${selected_stack} | ${Number(key) + 1}`;
    document.getElementById("first-language").innerText = stackDict[selected_stack]["languages"][0];
    document.getElementById("second-language").innerText = stackDict[selected_stack]["languages"][1];
    const list_container = document.getElementById("vocab-list");
    const selected_vocabs = selected_sectionized_stack[key];
    const edit_function = (i, list_entry) => {
        console.log(list_entry.children[0]);
        list_entry.children[0].removeAttribute("disabled");
        list_entry.children[1].removeAttribute("disabled");
        list_entry.children[2].innerText = "Save";
        list_entry.children[2].addEventListener("click", function save_button_function() {
            save_function(i, list_entry);
            list_entry.children[2].removeEventListener("click", save_button_function);
        });
    };
    const save_function = (i, list_entry) => {
        console.log(list_entry.children[0]);
        list_entry.children[0].setAttribute("disabled", true);
        list_entry.children[1].setAttribute("disabled", true);
        list_entry.children[2].innerText = "Edit";
        list_entry.children[2].addEventListener("click", function edit_button_function() {
            edit_function(i, list_entry);
            list_entry.children[2].removeEventListener("click", edit_button_function);
        });
    };
    for (let i = 0; i < selected_vocabs.length; i++) {
        const vocab = selected_vocabs[i];
        let list_entry = document.createElement("div");
        list_entry.setAttribute("class", "vocab");

        let vocab_1 = document.createElement("input");
        let vocab_2 = document.createElement("input");
        vocab_1.setAttribute("disabled", true);
        vocab_2.setAttribute("disabled", true);
        vocab_1.value = vocab[0];
        vocab_2.value = vocab[1];

        list_entry.appendChild(vocab_1);
        list_entry.appendChild(vocab_2);

        let list_entry_button = document.createElement("button");
        list_entry_button.innerText = "Edit";
        list_entry_button.addEventListener("click", function edit_button_function() {
            edit_function(i, list_entry);
            list_entry_button.removeEventListener("click", edit_button_function);
        });
        list_entry.appendChild(list_entry_button);

        list_container.appendChild(list_entry);
    }
}

// Select File Button
function select_file() {
    document.getElementById("file").click();
}

// Go from file-array to single file -> Take first item only
function processSingleFiles(file_array) {
    if (file_array.length > 1) {
        alert("Only one file allowed. Only the first item will be processed.");
    }
    if (file_array[0].name.endsWith(".csv")) {
        reader.readAsText(file_array[0]);
    } else {
        alert("File import faild. Select a file with a .csv ending.");
    }
}

// Get data from web
function importFromGitHub(fileName, acc, repName) {
    acc = acc || "notUnknuffig";
    repName = repName || "LanguageDictionaries";
    fileName = fileName || "Estonian.csv";

    const link = `https://raw.githubusercontent.com/${acc}/${repName}/main/${fileName}`;
    (async () => {
        const res = await fetch(link)
            .then((res) => {
                if (res.ok) {
                    return res.text();
                }
            })
            .then((t) => {
                if (t != undefined) {
                    loadedFile = t;
                    insertSnippet("storage_dialog");
                }
            });
    })();
}

function importFromWeb(link) {
    if (link.endsWith(".csv")) {
        (async () => {
            const res = await fetch(link)
                .then((res) => {
                    if (res.ok) {
                        return res.text();
                    }
                })
                .then((t) => {
                    if (t != undefined) {
                        loadedFile = t;
                        insertSnippet("storage_dialog");
                    }
                });
        })();
    } else {
        alert("The selected file has to be a CSV file.");
    }
}

// Single out language from CSV-file
function headerLang(file) {
    file = file.split("\n", 1)[0];
    file = file.split(";");
    return [file[0], file[1]];
}

// Sort the array by sections [Section_1,Section_2] -> [Section_1[],Section_2[]]
function sectionize(str) {
    str_array = str.split("\n");
    let section = 0;
    let sectionized_array = [[]];
    for (let i = 1; i < str_array.length - 1; i++) {
        vocab = str_array[i].split(";");
        if (section != Number(vocab[vocab.length - 1]) && vocab[vocab.length - 1] != "") {
            section = Number(vocab[vocab.length - 1]);
        }
        if (sectionized_array.length < section) {
            sectionized_array.push([]);
        }
        sectionized_array[section - 1].push([vocab[0], vocab[1]]);
    }
    return sectionized_array;
}

// Select custom range for section
function selectCustomRange() {
    const custom_range_input = document.getElementById("custom-range");
    let input_array = custom_range_input.value.split("-");
    if (input_array[0] == "") {
        alert("Select a section or enter a range between two values.");
        return;
    } else if (input_array.length == 1) {
        input_array.push(input_array[0]);
    } else if (input_array.length > 2) {
        alert("Select a range between a maximum of two values.");
        return;
    }
    let stack = [];
    for (let i = Number(input_array[0]) - 1; i < Number(input_array[1]); i++) {
        if (selected_sectionized_stack.length < i) {
            break;
        }
        stack = stack.concat(selected_sectionized_stack[i]);
    }
    startVocabGame(stack);
}

// Innit the vocab game
function startVocabGame(data, index) {
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
