import { connectDb } from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = await connectDb();
    const [logData] = await connection.query(
      "SELECT `model_name`,`manual`,`diagram`,`nvram`,`type`,`subtype` FROM `es_pt_model` WHERE `type`='Projecter' ORDER BY `model_name`"
    );
    return res.status(200).json(logData);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}