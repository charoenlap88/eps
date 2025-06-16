import { connectDb } from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const connection = await connectDb();
  try {
    
    const [user] = await connection.query(
      'SELECT * FROM ep_users WHERE username = ? AND password = ? LIMIT 1',
      [username, password]
    );

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const currentTime = new Date().getTime();
    const randomNumber = Math.floor(Math.random() * 10000);
    const tokenData = `${user[0]['username']}${currentTime}${randomNumber}`;
    const token = Buffer.from(tokenData).toString('base64');

    return res.status(200).json({ message: 'Login successful', token: token });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }finally {
     ; // Release the connection back to the pool
  }
}
