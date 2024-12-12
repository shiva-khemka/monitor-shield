import mongoose from 'mongoose';

const MonitoringDataSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  fingerprint: String,
  session_id: { type: String, required: true },
  user: {
    ip: String,
    session_id: String,
    user_agent: String,
    auth_token: String
  },
  ipData: {
    ip: String,
    location: {
      country: String,
      region: String,
      city: String,
      lat: Number,
      lng: Number,
      postalCode: String,
      timezone: String,
      geonameId: String
    },
    as: mongoose.Schema.Types.Mixed,
    isp: String,
    proxy: mongoose.Schema.Types.Mixed
  },
  timeSpent: Number,
  requestMetrics: {
    endpoints: mongoose.Schema.Types.Mixed,
    totalRequests: Number,
    averageResponseTime: Number
  },
  request: {
    method: String,
    url: String,
    headers: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed
  },
  response: {
    status_code: Number,
    response_time_ms: Number
  },
  interactions: {
    mouseMovements: [{
      x: Number,
      y: Number,
      timestamp: Date
    }],
    scrolls: [{
      scrollY: Number,
      timestamp: Date
    }],
    clicks: [{
      x: Number,
      y: Number,
      timestamp: Date
    }],
    keypresses: [{
      timestamp: Date
    }],
    touches: [{
      touches: Number,
      timestamp: Date
    }],
    swipes: [{
      touches: Number,
      x: Number,
      y: Number,
      timestamp: Date
    }],
    rotations: [{
      orientation: String,
      timestamp: Date
    }]
  },
  features: mongoose.Schema.Types.Mixed
});

// Export the model using default export
const MonitoringData = mongoose.model('MonitoringData', MonitoringDataSchema);
export default MonitoringData;
