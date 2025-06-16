import { connectDb } from '../../../utils/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const connection = await connectDb();
  try {
    const [logData] = await connection.query(
      "SELECT * FROM `es_pt_model` WHERE `type`='RIPs' ORDER BY `model_name`"
    );
    return res.status(200).json(logData);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }finally {
     ; // Release the connection back to the pool
  }
}