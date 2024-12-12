//.client/src/eventListeners.js
export const setupEventListeners = (monitoringData, deviceInfo) => {
if (deviceInfo.isTouch) {
    document.addEventListener('touchstart', (e) => {
        monitoringData.interactions.touches.push({
            touches: e.touches.length,
            timestamp: Date.now()
        });
       
    });

    document.addEventListener('touchmove', (e) => {
        monitoringData.interactions.swipes.push({
            touches: e.touches.length,
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            timestamp: Date.now()
        });
       
    });

    window.addEventListener('orientationchange', () => {
        monitoringData.interactions.rotations.push({
            orientation: screen.orientation?.type || window.orientation,
            timestamp: Date.now()
        });
        
    });
} else {
    document.addEventListener('mousemove', (e) => {
        monitoringData.interactions.mouseMovements.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        });
        if (monitoringData.interactions.mouseMovements.length > 100) {
            monitoringData.interactions.mouseMovements.shift();
        }
       
    });

    document.addEventListener('click', (e) => {
        monitoringData.interactions.clicks.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        });
        
    });
}

document.addEventListener('scroll', () => {
    monitoringData.interactions.scrolls.push({
        scrollY: window.scrollY,
        timestamp: Date.now()
    });
    if (monitoringData.interactions.scrolls.length > 100) {
        monitoringData.interactions.scrolls.shift();
    }
   
});

document.addEventListener('keypress', (e) => {
    monitoringData.interactions.keypresses.push({
        timestamp: Date.now()
    });
    
});};