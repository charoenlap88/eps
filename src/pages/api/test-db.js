import { createConnection } from 'mysql2/promise'; // ตัวอย่างสำหรับ MySQL

export default async function handler(req, res) {
    let db_config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      };
  try {
    
    const connection = await createConnection(db_config);

    const [rows] = await connection.execute('SELECT 1'); // ตัวอย่าง query
    res.status(200).json({ success: true, data: rows, db_config: db_config});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, db_config: db_config });
  }
}
