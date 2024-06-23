const reader = new FileReader();
var loadedFile = "";
var stackDict = [];
var selected_stack = "";
var selected_sectionized_stack = [];
var selected_section = 0;
if (localStorage.getItem("stored_stacks") != null) {
    stackDict = JSON.parse(localStorage.getItem("stored_stacks"));
}
if (sessionStorage.getItem("selected_stack") != null) {
    selected_stack = sessionStorage.getItem("selected_stack");
}

reader.addEventListener("load", function (e) {
    var fileContents = e.target.result;
    loadedFile = fileContents;
    fileLoadSuccess();
});

function processFiles(file_array) {
    if (file_array.length > 1) {
        alert("Only one file allowed. Only the first item will be processed.");
    }
    if (file_array[0].name.endsWith(".csv")) {
        reader.readAsText(file_array[0]);
    } else {
        alert("File import faild. Select a file with a .csv ending.");
    }
}

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
                    fileLoadSuccess();
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
                        fileLoadSuccess();
                    }
                });
        })();
    } else {
        alert("The selected file has to be a CSV file.");
    }
}

function headerLang(file) {
    file = file.split("\n", 1)[0];
    file = file.split(";");
    return [file[0], file[1]];
}

function selectVocabs(section) {
    csv_txt = loadedFile;
    // Standart Cases
    if (typeof section == "number") {
        section = [section, section];
    } else if (typeof section == "undefined") {
        section = [-1, -1];
    } else if (section.length == 1) {
        section.push(section[0]);
    }

    // Split the string at newline and delimiter symbols and position of the id attribut
    var strNewline = "\n";
    var strDelimiter = ";";
    var idPos = 3;

    // Split the string at every new line and loop over all the items
    const rows = csv_txt.split(strNewline);
    var index = 1;
    var lastSection = 0;
    var selectedVocabs = [];
    while (index < rows.length - 1) {
        const element = rows[index].split(strDelimiter);

        // if the id of the element is below the selected range than go on
        // if the id of the element is above the selected range than break the
        // else the element will be added to the loaded dict
        if (section[0] == -1 && section[1] == -1) {
            selectedVocabs.push([element[0], element[1], Number(element[idPos])]);
            index++;
        } else if (element[idPos] < section[0]) {
            index++;
        } else if (section[1] != -1 && element[idPos] > section[1]) {
            break;
        } else {
            if (element[idPos] != "") {
                lastSection = Number(element[idPos]);
                selectedVocabs.push([element[0], element[1], Number(element[idPos])]);
            } else {
                selectedVocabs.push([element[0], element[1], lastSection + 1]);
            }
            index++;
        }
    }
    return selectedVocabs;
}

function sectionize(str) {
    str_array = str.split("\n");
    var section = 0;
    sectionized_array = [[]];
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

function selectCustomRange() {
    const custom_range_input = document.getElementById("custom-range");
    var input_array = custom_range_input.value.split("-");
    if (input_array[0] == "") {
        alert("Select a section or enter a range between two values.");
        return;
    } else if (input_array.length == 1) {
        input_array.push(input_array[0]);
    } else if (input_array.length > 2) {
        alert("Select a range between a maximum of two values.");
        return;
    }
    var stack = [];
    for (let i = Number(input_array[0]) - 1; i < Number(input_array[1]); i++) {
        if (selected_sectionized_stack.length < i) {
            break;
        }
        stack = stack.concat(selected_sectionized_stack[i]);
    }
    startVocabGame(stack);
}

function startVocabGame(data) {
    const dirrection = document.getElementById("dir-select").value;
    const game = document.getElementById("game-select").value;
    var current_index = data.length - 1;
    var inverse_pos = Array.from(Array(data.length).fill(0));

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
        var random_index = Math.floor(Math.random() * current_index);
        if (current_index != 0) {
            current_index--;
            [data[current_index], data[random_index]] = [data[random_index], data[current_index]];
        } else {
            current_index--;
        }
    }
    insertSnippet(game + "_game_snippet", [data, game, inverse_pos]);
}

function editVocabs(key) {}

function fileLoadSuccess() {
    insertSnippet("storage_dialog");
}
