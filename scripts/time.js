document.addEventListener('DOMContentLoaded', () => {
    function updateDateTime() {
        const now = new Date();

        const timeString = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const dateString = now.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('time').textContent = timeString;
        document.getElementById('date').textContent = dateString;
    }

    updateDateTime();

    setInterval(updateDateTime, 1000);
});