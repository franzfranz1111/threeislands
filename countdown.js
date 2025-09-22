// Cheesy Marketing Countdown Script
document.addEventListener('DOMContentLoaded', function() {
    // Countdown Timer Logic
    function updateCountdown() {
        const now = new Date().getTime();
        const endTime = now + (23 * 60 * 60 * 1000) + (45 * 60 * 1000) + (32 * 1000); // Fake Ende-Zeit
        
        const countdownInterval = setInterval(function() {
            const currentTime = new Date().getTime();
            const timeLeft = endTime - currentTime;
            
            if (timeLeft <= 0) {
                // Reset countdown wenn abgelaufen (endless loop für mehr Druck!)
                const newEndTime = currentTime + (23 * 60 * 60 * 1000) + (45 * 60 * 1000) + (32 * 1000);
                updateCountdownDisplay(newEndTime - currentTime);
                return;
            }
            
            updateCountdownDisplay(timeLeft);
        }, 1000);
    }
    
    function updateCountdownDisplay(timeLeft) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // Extra Drama bei weniger als 5 Minuten
        if (hours === 0 && minutes < 5) {
            const countdownNumbers = document.querySelectorAll('.countdown-number');
            countdownNumbers.forEach(num => {
                num.style.color = '#FF0000';
                num.style.animation = 'flash 0.5s infinite';
            });
        }
    }
    
    // Fake "Andere Nutzer schauen gerade" Notification
    function showFakeActivity() {
        const activities = [
            "🔥 Max aus Bremen hat sich gerade angemeldet!",
            "⚡ Sarah aus Oldenburg sicherte sich Platz #8!",
            "🚴‍♂️ Tom aus Delmenhorst ist dabei!",
            "💨 Lisa aus Verden reservierte gerade!",
            "🎯 Kevin aus Achim schnappte sich einen Platz!"
        ];
        
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% Chance alle 10 Sekunden
                const activity = activities[Math.floor(Math.random() * activities.length)];
                showNotification(activity);
            }
        }, 10000);
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FF3366;
            color: white;
            padding: 15px;
            border: 2px solid #FF0000;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            z-index: 9999;
            animation: slideIn 0.5s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 4000);
    }
    
    // CSS für Notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        @keyframes slideOut {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
    `;
    document.head.appendChild(style);
    
    // Start the madness!
    updateCountdown();
    showFakeActivity();
    
    // Extra cheesy: Plätze "reduzieren" alle paar Minuten
    let availablePlaces = 3;
    setInterval(() => {
        if (availablePlaces > 1 && Math.random() < 0.4) {
            availablePlaces--;
            const placeElement = document.querySelector('.availability-alert strong');
            if (placeElement) {
                placeElement.textContent = `${availablePlaces} VON 10`;
                if (availablePlaces === 1) {
                    placeElement.style.color = '#FF0000';
                    placeElement.parentElement.innerHTML = placeElement.parentElement.innerHTML.replace('PLÄTZEN', 'PLATZ');
                }
            }
        }
    }, 180000); // Alle 3 Minuten
});
