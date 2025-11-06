import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

export const validateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.uid) {
      req.user = decoded.uid;
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }

}

export const validateSubUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedJwt = jwt.verify(idToken, process.env.JWT_SECRET);
    if (decodedJwt.main) {
      const decoded = await admin.auth().verifyIdToken(idToken);
      if (decoded.uid) {
        req.user = decoded;
        next();
      }
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }

}