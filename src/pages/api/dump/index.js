import { connectDb } from '../../../utils/db'; // We'll define this utility later
import _ from 'lodash';

export default async function handler(req, res) {
  try {
    // const {method, data} = req.body);
    const connection = await connectDb();

    const tableName = req.body?.table;
    const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
    let col_id = 0;
    const columnNames = columns.map((column) => {
      if (column.Field.includes("id")) {
        col_id = 1;
      }
      return `${column.Field}`;
    }).join(',');

    const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
    console.log('rows'+rows);
    let csvContent = columnNames + '\n';
    _.map(rows, row => {
        const values = _.map(_.values(row), value => {
            if (_.isNull(value)) return '';
            return typeof value === 'string' ? `"${value}"` : value; 
        })
        const lastValue = values[values.length - 1];
        const otherValuesAreStrings = values.slice(0, values.length - 1).every(value => typeof value === 'string');

        if (typeof lastValue === 'number' && otherValuesAreStrings && col_id === 1) {
            // Move the last value to the first position
            values.unshift(values.pop());
        }
        csvContent += `${values.join(',')}\n`;
    })
    console.log('csvContent'+csvContent);
    const fileName = `${tableName}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/csv');

    // Send the CSV content as the response
    res.send(csvContent);
    // res.json({data: encode('ok')})
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
