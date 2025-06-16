import mysql from "mysql2/promise";
import dotenv from "dotenv";
import _ from "lodash";

// Load environment-specific configuration
dotenv.config({ path: process.env.CONFIG_ENV });

let connection;

export async function connectDb() {
	const config = {
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD || "root",
		database: process.env.DB_NAME || "epson_db",
		waitForConnections: true,
		connectionLimit: 1,
		maxIdle: 1, // max idle connections, the default value is the same as `connectionLimit`
		idleTimeout: 60, // idle connections timeout, in milliseconds, the default value 60000
		queueLimit: 0,
		enableKeepAlive: true,
		keepAliveInitialDelay: 0,
		port: process.env.DB_PORT || "3306",
		debug: false
	};

	// console.log('pool closed', connection?.pool?._closed);
	if (!connection || (_.has(connection, 'pool._closed') && connection.pool._closed==true)) {
		console.log("========== Create Pool Connection ==========");
		connection = await mysql.createPool(config);
    

		// Event listener for handling connection errors
		connection.on("error", async (err) => {
			console.error("Database connection error:", err);
			if (err.code === "PROTOCOL_CONNECTION_LOST") {
				console.log("Reconnecting to the database...");
				connection = await mysql.createPool(config); // Reconnect on connection lost
			} else {
				throw err; // Throw error for other cases
			}
		});
	} else {
		console.log("========== Using Existing Connection ==========");
	}

	return connection;
}
