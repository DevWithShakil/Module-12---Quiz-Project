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

    const QUIZ_DURATION = window.APP_CONFIG.quizDurationSec || 20 * 60;
    const maxAttempts = window.APP_CONFIG.maxAttemptsInRange || 10;
    dateRangeEl.textContent = `${window.APP_CONFIG.startDate} to ${window.APP_CONFIG.endDate}`;

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
    }

    function submitQuiz() {
        clearInterval(timerInterval);

        const key = cur.email + "_attempts";
        let attempts = JSON.parse(localStorage.getItem(key) || "[]");

        // Check attempt limit
        const inRangeCount = attempts.filter(ts => {
            const t = Number(ts);
            return t >= Date.parse(window.APP_CONFIG.startDate) && t <= Date.parse(window.APP_CONFIG.endDate);
        }).length;

        if (inRangeCount >= maxAttempts) {
            alert(`Maximum ${maxAttempts} attempts reached!`);
            return;
        }

        let score = 0;
        questions.forEach((q, i) => {
            const ans = quizForm.querySelector(`input[name="q${i}"]:checked`);
            if (ans && parseInt(ans.value) === q.answer) score++;
        });

        attempts.push(Date.now());
        localStorage.setItem(key, JSON.stringify(attempts));

        localStorage.setItem("lastScore", score);
        localStorage.setItem("lastAttempt", attempts.length);

        if (score === questions.length) {
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
