import { connectDb } from '../../../utils/db';

export default async function handler(req, res) {
    const connection = await connectDb();
    try {
        const result = await connection.query(`
            SELECT 
                DATE_FORMAT(date_create, '%d/%m/%y') AS login_date, 
                COUNT(DISTINCT user_id) AS total_users
            FROM 
                log_event
            WHERE 
                log_status = 'Login'
            GROUP BY 
                login_date
            ORDER BY 
                login_date;
        `);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching login data' });
    }
}
