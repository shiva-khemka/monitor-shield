import React, { useEffect } from 'react';

const MobileChallenge = ({ onComplete }) => {
    useEffect(() => {
        const handleShake = (event) => {
            const { accelerationIncludingGravity } = event;
            const threshold = 15; // Customize sensitivity
            if (
                Math.abs(accelerationIncludingGravity.x) > threshold ||
                Math.abs(accelerationIncludingGravity.y) > threshold ||
                Math.abs(accelerationIncludingGravity.z) > threshold
            ) {
                alert('Shake detected! Challenge completed on mobile!');
                onComplete();
            }
        };

        window.addEventListener('devicemotion', handleShake);
        return () => window.removeEventListener('devicemotion', handleShake);
    }, [onComplete]);

    return <p>Shake your device to complete the challenge.</p>;
};

export default MobileChallenge;
