import React, { useState, useEffect } from 'react';
import { isMobileDevice } from '../utils/deviceDetection';
import DesktopChallenge from './DesktopChallenge';
import MobileChallenge from './MobileChallenge';

const TrustScoreChallenge = ({ onComplete }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(isMobileDevice());
    }, []);

    return (
        <div>
            <h2>Complete this Challenge</h2>
            {isMobile ? (
                <MobileChallenge onComplete={onComplete} />
            ) : (
                <DesktopChallenge onComplete={onComplete} />
            )}
        </div>
    );
};

export default TrustScoreChallenge;
