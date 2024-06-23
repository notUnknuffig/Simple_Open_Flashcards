const theme_switch = document.getElementById("theme-switch");
const htmlElement = document.documentElement;

function setTheme() {
    if (theme_switch.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
    }
}

var theme = "light";
if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme:dark)").matches
) {
    theme_switch.checked = true;
    theme = "dark";
}
if (localStorage.getItem("theme", theme) == "dark") {
    theme_switch.checked = true;
    theme = "dark";
}
localStorage.setItem("theme", theme);
document.documentElement.setAttribute("data-theme", theme);
