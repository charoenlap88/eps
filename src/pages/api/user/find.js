import { encode, decode } from '../../../utils/encryption';
import { connectDb } from '../../../utils/db'; // We'll define this utility later
import _ from 'lodash';

export default async function handler(req, res) {
  const connection = await connectDb();
  try {
    const {method,data,params} = decode(req.body)
    if (method=='post') {
      let [user] = await connection.query(
        'SELECT * FROM ep_users WHERE username = ?',
        [data?.username],
        function(err, results) {
          console.error(err);
          console.log(results)
        }
      );
       

      if (user.length === 0) {
        res.status(200).json({data: encode([])})
      }

      res.status(200).json({data: encode(user)})
    } else {
      res.status(405).send('Method not allowed')
    }
  } catch (error) {
    console.error('Error:', error);
    // return res.status(500).json({ error: 'Server error' });
  }finally {
     ; // Release the connection back to the pool
  }
}
