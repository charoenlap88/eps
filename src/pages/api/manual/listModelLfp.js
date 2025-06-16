import { connectDb } from '../../../utils/db';

export default async function handler(req, res) {
  const { subtype } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }


  // Use parameterized query to prevent SQL injection
  const sql = `
    SELECT
      model_name, manual, diagram, nvram, type, subtype
    FROM
      es_pt_model
    WHERE
      type = 'LFP'
    ORDER BY
      model_name
  `;

  const connection = await connectDb();

  try {
    const [logData] = await connection.query(sql, [subtype]);
    return res.status(200).json(logData);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    // Release the connection back to the pool
     
  }
}
