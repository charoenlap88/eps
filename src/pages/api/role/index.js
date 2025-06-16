import { encode, decode } from '../../../utils/encryption';
import { connectDb } from '../../../utils/db'; // We'll define this utility later
import _ from 'lodash';

export default async function handler(req, res) {
  const connection = await connectDb();
  try {
    const {method,data,params} = decode(req.body)
    if (method=='get') {
      let where = 'WHERE r.del = 0 ';
      if (_.size(params)>0) {
        where = 'WHERE r.del = 0 AND ';
        where += _.join(_.map(params, (v,k) => `${k}=?`), ' AND ')+' ';
      }
      let sql = 'SELECT r.*, GROUP_CONCAT(DISTINCT p.id) as permission_id, GROUP_CONCAT(DISTINCT p.permission) as permission_name FROM ep_roles r ';
      sql += 'LEFT JOIN ep_role_of_permission rp on r.id = rp.role_id ';
      sql += 'LEFT JOIN ep_permissions p on rp.permission_id = p.id ';
      sql += where
      sql += 'GROUP BY r.id ';
      console.log(sql, _.values(params))
      const [result] = await connection.query(sql, (_.size(params)>0?_.values(params):null), (err,results) => {
        console.error(err);
        console.log(results);
      })

      res.status(200).json({data:encode(result)});
    } else if (method=='post') {
      let col = _.join(_.keys(data), ',');
      console.log(_.values(data));
      let sql = `INSERT INTO ep_roles (${col}) VALUES (${_.map(_.values(data), v => '?')})`;
      console.log(sql);
      const [result] = await connection.query(
        sql,
        _.values(data),
        function(err, results) {
          console.error(err);
          console.log(results)
        }
      );
       
      res.status(200).json({data: encode(result)})
    } else if (method=='put') {
      console.log(params,data)
      let where = _.join(_.map(params, (v,k) => `${k}=?`), ' AND ');
      let setVal = _.join(_.map(data, (v,k) => `${k}=?`), ', ');
      let sql = `UPDATE ep_roles SET ${setVal} WHERE ${where}`;
      console.log(sql);
      console.log([..._.values(data), params?.id],)
      const [result] = await connection.query(
        sql,
        [..._.values(data), params?.id],
        function(err, results) {
          console.error(err);
          console.log(results)
        }
      );
       
      res.status(200).json({data: encode(result)})
    } else if (method=='delete') {
      let where = _.join(_.map(params, (v,k) => `${k}=?`), ' AND ')
      let sql = `UPDATE ep_roles SET del=1, updated_at=? WHERE ${where}`;
      console.log(sql);
      console.log([..._.values(data), params?.id])
      const [result] = await connection.query(
        sql,
        [..._.values(data), params?.id],
        function(err, results) {
          console.error(err);
          console.log(results)
        }
      );
       
      res.status(200).json({data: encode(result)})
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
