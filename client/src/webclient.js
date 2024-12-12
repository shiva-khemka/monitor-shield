//.client/src/webclient.js
import { Encryption } from './utils/encryption';
import {collectData} from '.collectData';
//import { generateFingerprint } from './utils/fingerprint';
//import { analyzeBehavior } from './utils/features';
class WebMonitor {
    static VERSION = '1.0.0';
    static DEFAULT_INTERVAL = 30000; // 30 seconds
    static VERIFIED_INTERVAL = 120000; // 2 minutes
    
    constructor(config) {
      this.config = {
        endpoint: config.endpoint || 'https://api.monitor-service.com',
        publicKey: config.publicKey,
        domain: window.location.hostname,
        trustThreshold: config.trustThreshold || 70,
        ...config
      };
      
      this.sessionId = this.generateSessionId();
      this.hashedId = null;
      this.isVerified = false;
      this.sendInterval = WebMonitor.DEFAULT_INTERVAL;
      
      this.init();
    }
  
    async init() {
      try {
        // Generate fingerprint and hashed ID
        const fingerprint = await this.generateFingerprint();
        this.hashedId = await this.hashData(fingerprint + this.config.domain);
        const encryptedid = await this.encryptFingerprint();
        // Check for existing verification cookie
        this.checkVerification();
        
        // Initialize data collection
        this.initializeCollection();
        
        // Start sending data
        this.startMonitoring();
        
      } catch (error) {
        console.error('Monitor initialization error:', error);
      }
    }
  
    async generateFingerprint() {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
    }

    async encryptFingerprint() {
      const hashedId = await this.hashData(this.fingerprint);  // Hash fingerprint
      const encryptedId = await Encryption(hashedId);  // Encrypt the hashed ID
      return encryptedId;
  }
  
    async hashData(data) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  
    checkVerification() {
      const verificationCookie = this.getCookie('monitor_verification');
      if (verificationCookie) {
        try {
          const verification = JSON.parse(atob(verificationCookie));
          if (verification.hashedId === this.hashedId && verification.exp > Date.now()) {
            this.isVerified = true;
            this.sendInterval = WebMonitor.VERIFIED_INTERVAL;
          }
        } catch (e) {
          this.removeCookie('monitor_verification');
        }
      }
    }
  
    startMonitoring() {
      this.sendData(); // Initial send
      setInterval(() => this.sendData(), this.sendInterval);
    }
  
    async sendData() {
      try {
        const monitoringData = await this.collectData();
        const encryptedData = await this.encryptData(monitoringData);
        
        const response = await fetch(`${this.config.endpoint}/collect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            //'X-Public-Key': this.config.publicKey,
            'X-Hashed-ID': this.hashedId
          },
          body: JSON.stringify(encryptedData)
        });
  
        const result = await response.json();
        
        // Update verification status if changed
        if (result.verified && !this.isVerified) {
          this.setVerificationCookie(result.token);
          this.sendInterval = WebMonitor.VERIFIED_INTERVAL;
        }
        
        // Handle trust score updates
        if (result.trustScore !== undefined) {
          this.handleTrustScore(result.trustScore);
        }
        
      } catch (error) {
        console.error('Error sending monitoring data:', error);
      }
    }
  
    handleTrustScore(trustScore) {
      if (trustScore < this.config.trustThreshold) {
        // Emit low trust score event
        const event = new CustomEvent('monitorTrustWarning', {
          detail: { trustScore, threshold: this.config.trustThreshold }
        });
        window.dispatchEvent(event);
      }
    }
  }