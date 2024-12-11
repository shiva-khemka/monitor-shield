import { deviceInfo } from './deviceInfo';
import { computeFeatures } from './computation';
import { setupEventListeners } from './eventListeners';
import { setupRequestMonitoring } from './requestData';
import { getIpData } from './getIpData';

const generateSessionId = () => {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};
export class CollectData {
    constructor() {
        this. sessionId = generateSessionId();
        this. startTime = Date.now();
        this. requestData =  {
            timestamp: new Date().toISOString(),
            fingerprint: null,
            session_id: sessionId,
            user: {
                ip: null,
                session_id: sessionId,
                user_agent: navigator.userAgent,
                auth_token: null // Will be set when available
            },
            ipData: null,
            timeSpent: 0,
            requestMetrics: {
                endpoints: {},
                totalRequests: 0,
                averageResponseTime: 0
            },
            request: {
                method: null,
                url: null,
                headers: {},
                body: null
            },
            response: {
                status_code: null,
                response_time_ms: null
            },
            interactions: {
                mouseMovements: [],
                scrolls: [],
                clicks: [],
                keypresses: [],
                touches: [],
                swipes: [],
                rotations: [],
            },
            features: null
        };

       
        setupEventListeners(this.monitoringData, deviceInfo);
        setupRequestMonitoring(this.monitoringData);
    }

    async getData() {
        this.monitoringData.timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
        this.monitoringData.features = computeFeatures(this.monitoringData, deviceInfo);
        this.monitoringData.timestamp = new Date().toISOString();
        this.monitoringData.ipData = await getIpData();
        
        return this.monitoringData;
    }
}