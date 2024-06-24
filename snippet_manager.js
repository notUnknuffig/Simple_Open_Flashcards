const snippetInsertionPiont = document.getElementById("snippet-insert");
const dialogInsertionPiont = document.getElementById("dialog-insert");

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
            console.log(fileName);
            if (fileName.endsWith("dialog")) {
                dialogInsertionPiont.innerHTML = htmlSnippet;
            } else {
                snippetInsertionPiont.innerHTML = htmlSnippet;
                sessionStorage.setItem("current_snippet", fileName);
            }
            if (fileName == "import_stack_snippet") {
                innit_import();
            } else if (fileName == "hosted_stack_snippet") {
                innit_host();
            } else if (fileName == "storage_dialog") {
                innit_storage_dialog();
            } else if (fileName == "collections_snippet") {
                innit_collection();
            } else if (fileName == "sections_snippet") {
                innit_sections(data);
            } else if (fileName == "flashcard_game_snippet") {
                innit_flashcard_game(data);
            } else if (fileName == "type_game_snippet") {
                innit_type_game(data);
            } else if (fileName == "pick_game_snippet") {
                innit_pick_game(data);
            }
        });
}

function closeDialog() {
    dialogInsertionPiont.innerHTML = "";
}

if (sessionStorage.getItem("current_snippet") == undefined) {
    sessionStorage.setItem("current_snippet", "home_snippet");
}
insertSnippet(sessionStorage.getItem("current_snippet"));

function innit_import() {
    const file_input = document.getElementById("file");
    const droparea = document.getElementById("file-droparea");
    const prevents = (e) => e.preventDefault();
    const active = () => droparea.classList.add("active");
    const inactive = () => droparea.classList.remove("active");

    const handelDrop = (e) => {
        const dt = e.dataTransfer;
        const files = [...dt.files];
        processFiles(files);
    };
    const getFiles = () => {
        var files = [...file_input.files];
        processFiles(files);
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
            console.log(fil_select.value);
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
                stack_list.innerHTML = stack_list.innerHTML + htmlSnippet.replace(/__key/g, i + 1);
            }
        });
}

function innit_storage_dialog() {
    const acc_btn = document.getElementById("accept-button");
    const dcl_btn = document.getElementById("decline-button");
    const _stack_name = document.getElementById("dict-name");

    acc_btn.addEventListener("click", (e) => {
        if (_stack_name.value != "") {
            var storedFiles = {};
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
            closeDialog();
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
            closeDialog();
        } else {
            alert("Enter a name for the stack");
        }
    });
}

function select_file() {
    document.getElementById("file").click();
}
