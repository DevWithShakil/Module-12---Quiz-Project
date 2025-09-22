(function () {
    const cur = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!cur) {
        alert("Please login first!");
        window.location.href = "index.html";
        return;
    }

    // DOM elements
    const startScreen = document.getElementById("start-screen");
    const quizArea = document.getElementById("quiz-area");
    const startBtn = document.getElementById("startBtn");
    const timerEl = document.getElementById("timer");
    const quizForm = document.getElementById("quizForm");
    const submitBtn = document.getElementById("submitBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const dateRangeEl = document.getElementById("dateRange");
    const userLoginEl = document.getElementById("userLogin"); // total login count display
    const remainingAttemptsEl = document.getElementById("remainingAttempts"); // remaining attempts display

    const QUIZ_DURATION = window.APP_CONFIG.quizDurationSec || 20 * 60;
    const maxAttempts = window.APP_CONFIG.maxAttemptsInRange || 10;

    // Format start and end date
    const startDate = new Date(window.APP_CONFIG.startDate);
    const endDate = new Date(window.APP_CONFIG.endDate);

    function formatDate(date) {
        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        };
        return date.toLocaleString('en-US', options);
    }
    dateRangeEl.textContent = `${formatDate(startDate)} to ${formatDate(endDate)}`;

    // ---------------- LOGIN COUNT (show only) ----------------
    const loginKey = cur.email + "_loginCount";
    const loginCount = parseInt(localStorage.getItem(loginKey) || "0");
    if (userLoginEl) {
        userLoginEl.textContent = loginCount;
    }

    // ---------------- REMAINING ATTEMPTS ----------------
    const attemptKey = cur.email + "_attempts";
    let attempts = JSON.parse(localStorage.getItem(attemptKey) || "[]");

    // Count attempts inside date range
    const inRangeCount = attempts.filter(ts => {
        const t = Number(ts);
        return t >= Date.parse(window.APP_CONFIG.startDate) &&
            t <= Date.parse(window.APP_CONFIG.endDate);
    }).length;

    const remainingAttempts = Math.max(0, maxAttempts - inRangeCount);
    if (remainingAttemptsEl) {
        remainingAttemptsEl.textContent = remainingAttempts;
    }

    // ---------------- TIMER ----------------
    let timeLeft = QUIZ_DURATION;
    let timerInterval;

    if (typeof questions === "undefined" || !Array.isArray(questions) || questions.length === 0) {
        alert("Quiz questions not found! Make sure questions.js is loaded.");
        return;
    }

    function renderQuiz() {
        quizForm.innerHTML = "";
        questions.forEach((q, i) => {
            const div = document.createElement("div");
            div.classList.add("question");
            div.innerHTML = `<p>${i + 1}. ${q.q}</p>`;
            q.options.forEach((opt, j) => {
                div.innerHTML += `
                    <label>
                        <input type="radio" name="q${i}" value="${j}">
                        ${opt}
                    </label><br>`;
            });
            quizForm.appendChild(div);
        });
    }

    function startTimer() {
        updateTimer();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                autoSubmit();
            }
        }, 1000);
    }

    function updateTimer() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerEl.textContent = `${m}:${s < 10 ? "0" : ""}${s}`;
        timerEl.style.color = timeLeft <= 60 ? "red" : "#333";
    }

    // ---------------- QUIZ SUBMIT ----------------
    function submitQuiz() {
        clearInterval(timerInterval);

        let attempts = JSON.parse(localStorage.getItem(attemptKey) || "[]");

        // Count attempts inside date range
        const inRangeCount = attempts.filter(ts => {
            const t = Number(ts);
            return t >= Date.parse(window.APP_CONFIG.startDate) &&
                t <= Date.parse(window.APP_CONFIG.endDate);
        }).length;

        if (inRangeCount >= maxAttempts) {
            alert(`Maximum ${maxAttempts} attempts reached within the allowed date range!`);
            return;
        }

        // Calculate score
        let score = 0;
        questions.forEach((q, i) => {
            const ans = quizForm.querySelector(`input[name="q${i}"]:checked`);
            if (ans && parseInt(ans.value) === q.answer) score++;
        });

        // Save attempt timestamp
        const now = Date.now();
        attempts.push(now);
        localStorage.setItem(attemptKey, JSON.stringify(attempts));

        // Deduct 50% if out of date range
        let deducted = false;
        if (now < Date.parse(window.APP_CONFIG.startDate) || now > Date.parse(window.APP_CONFIG.endDate)) {
            score = Math.floor(score / 2);
            deducted = true;
        }

        localStorage.setItem("lastScore", score);
        localStorage.setItem("lastAttempt", attempts.length);

        // Show message
        if (deducted) {
            alert(`You attempted outside the allowed date range! 50% marks deducted.\nYour score: ${score}/${questions.length}`);
        } else if (score === questions.length) {
            alert("Congratulations! All answers are correct!");
        } else {
            alert(`You scored ${score}/${questions.length}. Try again!`);
        }

        window.location.href = "result.html";
    }

    function autoSubmit() {
        alert("Time is up! Submitting quiz...");
        submitQuiz();
    }

    // ---------------- EVENTS ----------------
    startBtn.addEventListener("click", () => {
        startScreen.classList.add("hidden");
        quizArea.classList.remove("hidden");
        renderQuiz();
        startTimer();
    });

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        submitQuiz();
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });

})();
