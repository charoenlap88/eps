import { encode, decode } from '../../../utils/encryption';
import { connectDb } from '../../../utils/db'; // We'll define this utility later

export default async function handler(req, res) {
  const connection = await connectDb();
  try {
    const {method,data,params} = decode(req.body)
  
    
    // // console.log(connection)
    const [user] = await connection.query(
      'SELECT * FROM ep_users WHERE username = ? AND password = ? AND status = "active"',
      [data?.username, data?.password],
      function(err, results) {
        // console.error(err);
        console.log('error login')
      }
    );
     

    // console.log(user)

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({data: encode(user)})
  } catch (error) {
    // console.error('Error:', error);
    // return res.status(500).json({ error: 'Server error' });
  }finally {
     ; // Release the connection back to the pool
  }
}
