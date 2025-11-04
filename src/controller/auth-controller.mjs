const createAccessToken = async(req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        if (decoded.uid) {
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid token' });
    }
}