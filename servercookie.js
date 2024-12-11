app.post('/api/verify', (req, res) => {
    const verificationData = {
        hashedId: userHashedId,
        exp: Date.now() + 24 * 60 * 60 * 1000, // Expiry time (1 day)
    };

    const encryptedData = encryptData(verificationData);  // Encrypt the data

    // Set the cookie securely on the response
    res.cookie('monitor_verification', encryptedData, {
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
        path: '/',
        maxAge: 86400000  // 1 day expiry
    });

    res.status(200).send({ message: 'Verification successful' });
});
