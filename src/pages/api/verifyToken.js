// api/verifyToken.js
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const text = req.body;
  try {
    let json = '';
    try {
      json = JSON.parse(text);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
    if (json.token) {
      const decoded = jwt.verify(json.token, process.env.NEXTAUTH_SECRET);  
      res.status(200).json(decoded);
    } else {
      res.status(400).json({ error: 'Token not found' });
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(400).json({ error: 'Token verification failed' });
  }
}