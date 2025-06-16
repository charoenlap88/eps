import { encode, decode } from '../../../utils/encryption';
import { connectDb } from '../../../utils/db'; // We'll define this utility later
import _ from 'lodash';

export default async function handler(req, res) {
  const connection = await connectDb();
  try {
    const {method,data,params} = decode(req.body)
    if (method=='post') {
      console.log(params,data)
      if (data?.permission_id && _.isArray(data.permission_id)) {
        data.permission_id = _.orderBy(data.permission_id)
        let sql = 'DELETE FROM ep_role_of_permission WHERE role_id = ?;';
        let [deleted] = await connection.query(sql, [data.role_id])
        console.log('deleted',deleted);
        let tempSql = _.join(_.map(data.permission_id, role => '(?, ?)'), ', ');
        let sql2 = `INSERT INTO ep_role_of_permission (role_id, permission_id) VALUES ${tempSql};`;
        let roleArr = _.flatten(_.map(data.permission_id, arr => ([data.role_id, arr])));
        let [inserted] = await connection.query(sql2, roleArr);
        console.log('inserted',sql2,roleArr, inserted);
        res.status(200).json({data: encode(inserted)});
      } else {
        res.status(400).send('Not found role')
      }
    } else {
      res.status(405).send('Method not allowed')
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }finally {
     ; // Release the connection back to the pool
  }
}
