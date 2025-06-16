import { encode, decode } from '../../utils/encryption';
import { connectDb } from '../../utils/db'; // We'll define this utility later
import _ from  'lodash';

export default async function handler(req, res) {
    try {
    // const table = 'es_cc_specification';
    const {method,data,params} = decode(req.body)

    if (method=='get') {
        let sql = 'SELECT spec.* FROM es_cc_model as m ';
        sql += 'LEFT JOIN es_cc_series as s ON s.id_model = m.id ';
        sql += 'LEFT JOIN es_cc_column as c ON c.id_model = m.id ';
        sql += 'LEFT JOIN es_cc_val as v ON c.id=v.id_column and s.id=v.id_series ';
        sql += 'LEFT JOIN es_cc_specification as spec ON v.val=spec.ordercode ';
        sql += "WHERE c.column_name LIKE ?";
        let objParam = ['%รหัสสินค้า%'];
        if (_.size(params)>0) {
            sql += ' AND '
            sql += _.join(_.map(params, (val,key) => {
                
                if (_.startsWith(val,'*') && _.endsWith(val,'*')) {
                    val = _.trim(val, '*');
                    objParam.push(val);
                    return key+' LIKE ?';
                } else {
                    objParam.push(val);
                    return key+' = ?';
                }
            }), ' AND ');
        }
        console.log('sql', sql)
        console.log('params', objParam)

        const connection = await connectDb();
        const [result] = await connection.query(sql, objParam);
        
         
        console.log(result)
        res.status(200).json({data: encode(result)})
    } else {
        res.status(405).send('Method not allowed')
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error?.message });
  }
}
