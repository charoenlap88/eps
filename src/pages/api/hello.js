import { connectDb } from '../../utils/db'; // We'll define this utility later

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const connection = await connectDb();
    const [user] = await connection.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Login successful', user: user[0] });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
