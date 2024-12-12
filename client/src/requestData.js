 //.client/src/requestData.js
 let requestData = [];
 export const setupRequestMonitoring = (monitoringData) => {
 const originalFetch = window.fetch;
 window.fetch = async function(url, options = {}) {
     const startTime = Date.now();
     const requestHeaders = options.headers || {};
     
     // Capture request details
     monitoringData.request = {
         method: options.method || 'GET',
         url: url,
         headers: {
             'User-Agent': navigator.userAgent,
             'Referer': document.referrer,
             'Accept-Language': navigator.language,
             'Content-Type': requestHeaders['Content-Type'] || 'application/json',
             'Origin': window.location.origin,
             ...requestHeaders
         },
         body: options.body ? JSON.parse(options.body) : null
     };

     try {
         const response = await originalFetch(url, options);
         const endTime = Date.now();
         const duration = endTime - startTime;
         updateRequestMetrics(monitoringData, url, duration, options.method || 'GET', response.status);
         // Capture response details
         //monitoringData.response = {
            // status_code: response.status,
           //  response_time_ms: duration
         //};

         // Update timestamp
         //monitoringData.timestamp = new Date().toISOString();
         
         //const requestInfo = {
           //  url,
           //  method: options.method || 'GET',
           //  timestamp: startTime,
           //  duration,
           //  headers: requestHeaders,
           //  status: response.status
         //};
         
         //requestData.push(requestInfo);
         //updateRequestMetrics();
         
         return response;
     } catch (error) {
         console.error('Request error:', error);
         throw error;
     }
 };
 };
 const updateRequestMetrics = () => {
    const metrics = monitoringData.requestMetrics;
    metrics.totalRequests = requestData.length;
    
    // Calculate average response time
    const totalDuration = requestData.reduce((sum, req) => sum + req.duration, 0);
    metrics.averageResponseTime = totalDuration / requestData.length;
    
    // Track endpoints
    requestData.forEach(req => {
        const url = new URL(req.url);
        const endpoint = url.pathname;
        if (!metrics.endpoints[endpoint]) {
            metrics.endpoints[endpoint] = {
                count: 0,
                averageTime: 0
            };
        }
        metrics.endpoints[endpoint].count++;
        metrics.endpoints[endpoint].averageTime = 
            (metrics.endpoints[endpoint].averageTime * (metrics.endpoints[endpoint].count - 1) + 
            req.duration) / metrics.endpoints[endpoint].count;
    });
};
 