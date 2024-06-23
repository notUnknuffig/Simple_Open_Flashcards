const snippetInsertionPiont = document.getElementById("snippet-insert");

function insertSnippet(fileName) {
    localStorage.setItem("current_snippet", fileName);
    fetch(`../html_snippets/${fileName}.html`)
        .then((res) => {
            if (res.ok) {
                return res.text();
            }
        })
        .then((htmlSnippet) => {
            snippetInsertionPiont.innerHTML = htmlSnippet;
            if (fileName == "import_stack_snippet") {
                innit_import();
            } else if (fileName == "hosted_stack_snippet") {
                innit_host();
            }
        });
}

insertSnippet(localStorage.getItem("current_snippet"));

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
            console.log(fil_select.value);
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

function select_file() {
    document.getElementById("file").click();
}
