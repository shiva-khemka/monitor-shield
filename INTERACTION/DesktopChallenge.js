import React from 'react';

const DesktopChallenge = ({ onComplete }) => {
    const handleDragComplete = () => {
        alert('Challenge completed on desktop!');
        onComplete();
    };

    return (
        <div>
            <p>Drag the object to the correct location to verify.</p>
            <div
                draggable="true"
                onDragEnd={handleDragComplete}
                style={{ width: 50, height: 50, backgroundColor: 'blue' }}
            >
                Drag me
            </div>
        </div>
    );
};

export default DesktopChallenge;
