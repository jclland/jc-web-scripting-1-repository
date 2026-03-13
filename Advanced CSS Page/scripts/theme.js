// find the toggle button
var themeButton = document.getElementById("theme-toggle");


//check if theme was saved before
var savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}


// when button is clicked...
themeButton.addEventListener("click", function () {
    // toggle the dark mode class
    document.body.classList.toggle("dark-mode");

    // check if dark mode is active
    if (document.body.classList.contains("dark-mode")) {
        // save dark mode pref
        localStorage.setItem("theme", "dark");
    } else {
        // save light mode pref
        localStorage.setItem("theme", "light");

    }

});