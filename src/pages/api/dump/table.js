import { connectDb } from '../../../utils/db'; // We'll define this utility later
import { encode, decode } from '../../../utils/encryption';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = await connectDb();
    const [result] = await connection.query(
      'SHOW TABLES;',
      []
    );

    if (result.length === 0) {
        
      return res.status(401).json({data: encode({ error: 'No data' })})
    }

    return res.status(200).json({data: encode(result)});
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
