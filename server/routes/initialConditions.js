export const checkInitialConditions = (data) => {
    let score = 0;
    
    // Basic device checks
    if (data.deviceInfo.cookiesEnabled) score += 10;
    if (data.deviceInfo.languages?.length > 0) score += 10;
    
    // Connection quality
    if (data.deviceInfo.connection?.type === '4g') score += 15;
    if (data.deviceInfo.connection?.rtt < 100) score += 15;
    
    // Browser checks
    const validBrowsers = ['chrome', 'firefox', 'safari', 'edge'];
    if (validBrowsers.includes(data.deviceInfo.browser.name.toLowerCase())) score += 20;
    
    // Request headers check
    if (data.request.headers['Accept-Language']) score += 15;
    if (data.request.headers['Referer']) score += 15;
    
    return score;
};