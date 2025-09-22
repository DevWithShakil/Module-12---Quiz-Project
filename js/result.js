(function () {
    const loginEl = document.getElementById("loginInfo");
    const scoreEl = document.getElementById("score");
    const attemptEl = document.getElementById("attempt");
    const deductionEl = document.getElementById("deductionMsg");
    const logoutBtn = document.getElementById("logoutBtn");

    // Fetch current user
    const cur = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!cur) {
        alert("Please login first!");
        window.location.href = "index.html";
        return;
    }

    // Fetch quiz data
    const lastScore = parseInt(localStorage.getItem("lastScore") || 0);
    const attempts = JSON.parse(localStorage.getItem(cur.email + "_attempts") || "[]");
    const lastAttemptTime = attempts[attempts.length - 1] || 0;

    // Date range from config
    const start = Date.parse(window.APP_CONFIG.startDate);
    const end = Date.parse(window.APP_CONFIG.endDate);

    let deducted = false;
    if (lastAttemptTime < start || lastAttemptTime > end) {
        deducted = true;
        deductionEl.style.display = "inline-block";
        deductionEl.textContent = "Attempted outside allowed date range! 50% marks deducted";
    }

    // Show login info
    loginEl.textContent = `Logged in as ${cur.name} (${cur.email})`;

    // Show score
    const scoreBadge = document.createElement("span");
    scoreBadge.classList.add("badge");
    if (deducted) scoreBadge.classList.add("deducted");
    else if (lastScore === 0) scoreBadge.classList.add("fail");
    else if (lastScore < questions.length / 2) scoreBadge.classList.add("warning");
    else scoreBadge.classList.add("success");
    scoreBadge.textContent = `Score: ${lastScore} / ${questions.length}`;
    scoreEl.appendChild(scoreBadge);

    // Show attempts
    const attemptBadge = document.createElement("span");
    attemptBadge.classList.add("badge", "attempts");
    attemptBadge.textContent = `Attempts: ${attempts.length}`;
    attemptEl.appendChild(attemptBadge);

    // Logout
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });
})();
