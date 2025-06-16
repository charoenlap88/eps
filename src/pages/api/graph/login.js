import { connectDb } from '../../../utils/db';

export default async function handler(req, res) {
    const { month, year } = req.query; // รับค่า month และ year จาก query string

    if (!month || !year) {
        return res.status(400).json({ error: 'Month and year are required' });
    }

    const connection = await connectDb();
    try {
        const result = await connection.query(
            `
            SELECT 
                DATE_FORMAT(date_create, '%Y/%m/%d') AS login_date, 
                COUNT(DISTINCT user_id) AS total_users
            FROM 
                log_event
            WHERE 
                log_status = 'Login' 
                AND MONTH(date_create) = ? 
                AND YEAR(date_create) = ?
            GROUP BY 
                login_date
            ORDER BY 
                login_date
            Limit 31;
            `,
            [month, year] // ส่งค่า month และ year เพื่อใช้ใน query
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching login data:', error);
        res.status(500).json({ error: 'Error fetching login data' });
    }
}
