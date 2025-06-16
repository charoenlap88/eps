import { encode, decode } from '../../../utils/encryption';
import { connectDb } from '../../../utils/db'; // We'll define this utility later
import _ from 'lodash';

export default async function handler(req, res) {
  const connection = await connectDb();
  try {
    console.log(req.method, typeof req.body, req.body);
    // const {method,data,params} = req.body
    if (req.method=='POST') {
      const data = JSON.parse(req.body)
      console.log(data)
      let col = _.join(_.keys(data), ',');
      let sql = `INSERT INTO log_event (${col}) VALUES (${_.map(_.values(data), v => '?')})`;
      console.log(sql);
      const [result] = await connection.query(
        sql,
        _.values(data),
        function(err, results) {
          console.error(err);
          console.log(results)
        }
      );
      console.log(result);
      res.status(200).json({data: result})
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
