(function () {
    const form = document.getElementById('loginForm');
    const info = document.getElementById('info');

    function getAttempts(email) {
        return JSON.parse(localStorage.getItem(email + '_attempts') || '[]');
    }

    function countAttemptsInRange(attempts, startISO, endISO) {
        const start = new Date(startISO).getTime();
        const end = new Date(endISO).getTime();
        return attempts.filter(ts => Number(ts) >= start && Number(ts) <= end).length;
    }

    function showInfo(msg) {
        if (info) info.textContent = msg;
    }

    // If already logged in, show info
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (cur) {
        const loginCount = Number(localStorage.getItem(cur.email + '_loginCount') || 0);
        const attempts = getAttempts(cur.email);
        const inRangeCount = countAttemptsInRange(attempts, window.APP_CONFIG.startDate, window.APP_CONFIG.endDate);
        showInfo(`Logged in as ${cur.name} (${cur.email}) — loginCount: ${loginCount} — attempts in range: ${inRangeCount}`);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        if (!name || !email) { alert('Provide name and email'); return; }

        const attempts = getAttempts(email);
        const inRangeCount = countAttemptsInRange(attempts, window.APP_CONFIG.startDate, window.APP_CONFIG.endDate);

        if (inRangeCount >= window.APP_CONFIG.maxAttemptsInRange) {
            alert(`You have reached the maximum allowed attempts (${window.APP_CONFIG.maxAttemptsInRange}) within the allowed date range. You cannot take the quiz now.`);
            return;
        }

        // save current user
        const currentUser = { name, email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // increment login count
        const keyLogin = email + '_loginCount';
        const loginCount = Number(localStorage.getItem(keyLogin) || 0) + 1;
        localStorage.setItem(keyLogin, loginCount);

        // redirect to quiz
        window.location.href = 'quiz.html';
    });
})();
