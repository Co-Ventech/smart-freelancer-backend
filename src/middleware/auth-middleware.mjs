import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

export const verifyTokenFromFirebase = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.uid) {
      req.user = {
        uid: decoded.uid,
        parent_token: idToken
      };
      next();
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }

}


export const validateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedJwt = jwt.verify(idToken, process.env.JWT_SECRET);
    console.log("Decoded JWT: ", decodedJwt)
    if (decodedJwt?.main !== null) {
      const decoded = await admin.auth().verifyIdToken(decodedJwt?.main);
      if (decoded?.uid) {
        req.user = {
          main: decodedJwt.main,
          sub_users: decodedJwt?.sub_users,
          uid: decoded.uid,
        };
        next();
      }
      else {
        res.status(401).send({ message: 'Invalid token' });
      }
    }else{
      res.status(404).send({
        message: "token missing"
      })
    }

  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }

}