// pages/api/upload-csv.js
import { connectDb } from '../../../utils/db'; // We'll define this utility later
import multiparty from "multiparty";
import csvParser from "csv-parser";
import _ from 'lodash';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req, res) {
	const form = new multiparty.Form();
	const tableName = req.query?.table;
	const newTableName = tableName+'_backup';

	form.parse(req, async (err, fields, files) => {
		if (err) {
			return res.status(500).json({ error: "Error parsing the form" });
		}

		const yourFile = files && files.file ? files.file[0] : null;

		if (!yourFile) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		// Access the file and read its content
		const fileStream =
			yourFile && yourFile.path
				? require("fs").createReadStream(yourFile.path)
				: null;
		const data = [];

		if (fileStream) {
			fileStream
				.pipe(csvParser())
				.on("data", (row) => {
					data.push(row);
				})
				.on("end", async () => {
					// Extracting column names from the first object in the data array
					const columns = Object.keys(data[0]);
					// Generating placeholders like (?, ?, ?) for each row
					const placeholders = data.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
					// Concatenating column names for the SQL query
					const columnNames = columns.join(', ');
					// Collecting all values from the array of objects to insert
					const values = data.flatMap((item) => Object.values(item));
					// Constructing the SQL insert statement with placeholders
					const sql = `INSERT INTO ${tableName} (${columnNames}) VALUES ${placeholders};`;
					const dropSQL = `DROP TABLE IF EXISTS ${newTableName};`;
					const createCopyTable = `CREATE TABLE ${newTableName} LIKE ${tableName};`;
					const cloneTable = `INSERT INTO ${newTableName} SELECT * FROM ${tableName};`;
					const truncateSQL = `TRUNCATE TABLE ${tableName};`;

					if (tableName) {
						const connection = await connectDb();
						await connection.query(dropSQL);
						await connection.query(createCopyTable);
						await connection.query(cloneTable);
						await connection.query(truncateSQL);
						const [result] = await connection.query(sql, values);
						console.log(result);
						res.status(200).json({ records: data, table: tableName, result: result?.insertId });
					}
					// res.status(200).json({ message: 'not found table'})
				});
		} else {
			res.status(500).json({ error: "Error reading the file" });
		}
	});
}
