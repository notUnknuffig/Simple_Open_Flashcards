function selectVocabs(section) {
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
    const rows = loadedFile.split(strNewline);
    var index = 1;
    var lastSection = 0;
    var selectedVocabs = [];
    loadedFile = "";
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
