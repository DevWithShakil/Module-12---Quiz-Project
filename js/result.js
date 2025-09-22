// result.js

// DOM elements
const scoreEl = document.getElementById("score");
const attemptEl = document.getElementById("attempt");
const loginEl = document.getElementById("loginInfo");

// Get data from localStorage
const score = localStorage.getItem("lastScore");
const attempts = localStorage.getItem("lastAttempt");
const name = localStorage.getItem("name");
const email = localStorage.getItem("email");

// Show login info
if (name && email) {
    loginEl.textContent = `Logged in as: ${name} (${email})`;
}

// Show score
if (score !== null) {
    scoreEl.textContent = `Your Score: ${score}/10`;
} else {
    scoreEl.textContent = "No score available.";
}

// Show attempt count
if (attempts !== null) {
    attemptEl.textContent = `Attempt: ${attempts}/10`;
} else {
    attemptEl.textContent = "Attempt: 0/10";
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}
