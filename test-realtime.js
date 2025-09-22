// Simple script to test real-time functionality by simulating data insertion
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function insertTestData() {
    const nodes = ['node1', 'node2', 'node3'];
    const currentTime = new Date();
    
    try {
        for (const nodeId of nodes) {
            // Generate random but realistic values
            const flowRate = Math.random() * 5 + 1; // 1-6 L/min
            const rssi = Math.floor(Math.random() * 30) - 90; // -90 to -60 dBm
            
            const query = `
                INSERT INTO volume_air (Node_id, flow_rate, rssi, timestamp) 
                VALUES (?, ?, ?, ?)
            `;
            
            await pool.execute(query, [nodeId, flowRate, rssi, currentTime]);
            console.log(`Inserted data for ${nodeId}: flow_rate=${flowRate.toFixed(2)}, rssi=${rssi}`);
        }
        
        console.log(`Test data inserted at ${currentTime.toISOString()}`);
        console.log('Check your dashboard to see real-time updates!');
        
    } catch (error) {
        console.error('Error inserting test data:', error);
    }
}

// Insert test data every 10 seconds
console.log('Starting test data insertion every 10 seconds...');
console.log('Press Ctrl+C to stop');

insertTestData(); // Insert immediately
const interval = setInterval(insertTestData, 10000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nStopping test data insertion...');
    clearInterval(interval);
    pool.end();
    process.exit(0);
});