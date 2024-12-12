//.client/src/computation.js
export const computeFeatures = () => {
    const now = Date.now();
    const features = {
        deviceType: deviceInfo.isMobile ? 'mobile' : 'desktop',
        touchCapable: deviceInfo.isTouch,
    };

    if (deviceInfo.isTouch) {
        const recentTouches = monitoringData.interactions.touches.filter(t => now - t.timestamp < 60000);
        const recentSwipes = monitoringData.interactions.swipes.filter(s => now - s.timestamp < 60000);

        features.touchMetrics = {
            touchRate: recentTouches.length / 60,
            multiTouchRatio: recentTouches.filter(t => t.touches > 1).length / recentTouches.length || 0,
            swipeSpeed: calculateSwipeSpeed(recentSwipes),
            swipePatterns: analyzeSwipePatterns(recentSwipes),
            rotationFrequency: monitoringData.interactions.rotations.length / 60
        };
    } else {
        const recentMoves = monitoringData.interactions.mouseMovements.filter(m => now - m.timestamp < 60000);
        features.mouseMetrics = {
            clickRate: monitoringData.interactions.clicks.length / 60,
            typeRate: monitoringData.interactions.keypresses.length / 60,
            mouseSpeed: calculateMouseSpeed(recentMoves),
            movementPattern: analyzeMovementPattern(recentMoves)
        };
    }

    features.scrollMetrics = analyzeScrollPattern(monitoringData.interactions.scrolls);
    return features;
};

export const calculateSwipeSpeed = (swipes) => {
    if (swipes.length < 2) return 0;
    let totalSpeed = 0;
    for (let i = 1; i < swipes.length; i++) {
        const dx = swipes[i].x - swipes[i-1].x;
        const dy = swipes[i].y - swipes[i-1].y;
        const dt = swipes[i].timestamp - swipes[i-1].timestamp;
        totalSpeed += Math.sqrt(dx*dx + dy*dy) / dt;
    }
    return totalSpeed / (swipes.length - 1);
};

export const calculateMouseSpeed = (moves) => {
    if (moves.length < 2) return 0;
    let totalSpeed = 0;
    for (let i = 1; i < moves.length; i++) {
        const dx = moves[i].x - moves[i-1].x;
        const dy = moves[i].y - moves[i-1].y;
        const dt = moves[i].timestamp - moves[i-1].timestamp;
        totalSpeed += Math.sqrt(dx*dx + dy*dy) / dt;
    }
    return totalSpeed / (moves.length - 1);
};

export const analyzeSwipePatterns = (swipes) => {
    if (swipes.length < 2) return 'insufficient_data';
    const patterns = {
        vertical: 0,
        horizontal: 0,
        diagonal: 0
    };

    for (let i = 1; i < swipes.length; i++) {
        const dx = Math.abs(swipes[i].x - swipes[i-1].x);
        const dy = Math.abs(swipes[i].y - swipes[i-1].y);
        
        if (dx > dy * 2) patterns.horizontal++;
        else if (dy > dx * 2) patterns.vertical++;
        else patterns.diagonal++;
    }

    return patterns;
};

export const analyzeScrollPattern = (scrolls) => {
    if (scrolls.length < 2) return 'insufficient_data';
    const intervals = [];
    for (let i = 1; i < scrolls.length; i++) {
        intervals.push(scrolls[i].timestamp - scrolls[i-1].timestamp);
    }
    return {
        averageInterval: intervals.reduce((a, b) => a + b, 0) / intervals.length,
        regularityScore: calculateRegularity(intervals)
    };
};

export const analyzeMovementPattern = (moves) => {
    if (moves.length < 2) return 'insufficient_data';
    const angles = moves.slice(1).map((move, i) => {
        const dx = move.x - moves[i].x;
        const dy = move.y - moves[i].y;
        return Math.atan2(dy, dx);
    });

    return {
        linearMovement: calculateLinearityScore(angles),
        averageSpeed: calculateMouseSpeed(moves)
    };
};

export const calculateRegularity = (intervals) => {
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
    return 1 / (1 + Math.sqrt(variance));
};

export const calculateLinearityScore = (angles) => {
    let consistentAngleCount = 0;
    for (let i = 1; i < angles.length; i++) {
        if (Math.abs(angles[i] - angles[i-1]) < 0.1) consistentAngleCount++;
    }
    return consistentAngleCount / (angles.length - 1);
};
