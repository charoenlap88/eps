const mysql = require('mysql2/promise');
const config = {
  host: 'localhost',
  user: 'root',
  password: 'LbQkw69Y097Nk4D',
  database: 'epson_db',
  port: 3306
};

async function testDB() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connected successfully!');
    
    // ทดสอบดึงข้อมูล
    const [rows] = await connection.execute('SHOW TABLES;');
    console.log('Tables:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDB();
