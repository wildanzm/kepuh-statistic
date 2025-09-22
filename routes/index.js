const express = require("express");
const router = express.Router();
const db = require("../database/db.js");

/* GET home page. */
router.get("/", function (req, res, next) {
	// Express will automatically serve index.html from the public folder
});

const nodeInfo = [
	{ id: "node1", label: "Masjid 1", color: "rgba(54, 162, 235, 1)" },
	{ id: "node2", label: "Masjid 2", color: "rgba(255, 99, 132, 1)" },
	{ id: "node3", label: "Masjid 3", color: "rgba(75, 192, 192, 1)" },
];

function formatDataForChart(rows, dataColumn, labels) {
	return nodeInfo.map((node) => {
		const nodeData = rows.filter((r) => r.Node_id === node.id);
		return {
			label: node.label,
			data: labels.map((label) => {
				const row = nodeData.find((d) => d.time_label === label);
				return row ? row[dataColumn] : null;
			}),
			borderColor: node.color,
			tension: 0.4, // More fluid curves like flowing water
			borderWidth: 3, // Thicker line for better flow visibility
			borderCapStyle: 'round', // Smooth line endings
			borderJoinStyle: 'round', // Smooth connections
			stepped: false, // Smooth continuous line
			spanGaps: true,
			pointBackgroundColor: function(context) {
				return context.dataset.borderColor;
			},
			pointHoverBackgroundColor: function(context) {
				return context.dataset.borderColor;
			},
			pointRadius: 1, // Smaller points for cleaner water flow
			pointHoverRadius: 4,
			pointBorderWidth: 0 // No border for smoother look
		};
	});
}

// Fungsi untuk membuat query agregasi 5 detik
const createTimeGroupQuery = (dataField) => `
    SELECT 
        Node_id,
        DATE_FORMAT(
            DATE_SUB(timestamp, INTERVAL (SECOND(timestamp) % 5) SECOND),
            '%H:%i:%s'
        ) AS time_label,
        AVG(${dataField}) AS avg_value
    FROM volume_air 
    WHERE DATE(timestamp) = CURDATE() AND ${dataField} IS NOT NULL
    GROUP BY Node_id, DATE_FORMAT(
        DATE_SUB(timestamp, INTERVAL (SECOND(timestamp) % 5) SECOND),
        '%H:%i:%s'
    )
    ORDER BY time_label;
`;

/* GET flowrate data with 5-second interval. */
router.get("/flowrate", async (req, res) => {
	try {
		const data = await getFlowrateData();
		res.json(data);
	} catch (err) {
		console.error("DB Error on /flowrate:", err.stack);
		res.status(500).json({ message: "Database error" });
	}
});

/* GET RSSI data with 5-second interval. */
router.get("/rssi", async (req, res) => {
	try {
		const data = await getRssiData();
		res.json(data);
	} catch (err) {
		console.error("DB Error on /rssi:", err.stack);
		res.status(500).json({ message: "Database error" });
	}
});

// --- Real-time data functions for Socket.io broadcasting ---

// Function to get all unique time labels from today's data
async function getUnifiedLabels() {
	const [rows] = await db.query(`
		SELECT DISTINCT
			DATE_FORMAT(
				DATE_SUB(timestamp, INTERVAL (SECOND(timestamp) % 5) SECOND),
				'%H:%i:%s'
			) AS time_label
		FROM volume_air
		WHERE DATE(timestamp) = CURDATE()
		ORDER BY time_label;
	`);
	return rows.map((r) => r.time_label);
}

// Function to get flowrate data (reusable for both HTTP and Socket.io)
async function getFlowrateData() {
	const [rows] = await db.query(createTimeGroupQuery("flow_rate"));
	const formattedRows = rows.map((r) => ({ ...r, avg_flow_rate: r.avg_value }));
	const labels = await getUnifiedLabels(); // Use unified labels
	const datasets = formatDataForChart(formattedRows, "avg_flow_rate", labels);
	
	// Ensure we always return valid data structure even if empty
	if (labels.length === 0) {
		return {
			labels: [],
			datasets: nodeInfo.map((node) => ({
				label: node.label,
				data: [],
				borderColor: node.color,
				tension: 0.4, // More fluid curves like flowing water
				borderWidth: 3, // Thicker line for better flow visibility
				borderCapStyle: 'round', // Smooth line endings
				borderJoinStyle: 'round', // Smooth connections
				stepped: false, // Smooth continuous line
				spanGaps: true,
				pointBackgroundColor: node.color,
				pointHoverBackgroundColor: node.color,
				pointRadius: 1, // Smaller points for cleaner water flow
				pointHoverRadius: 4,
				pointBorderWidth: 0 // No border for smoother look
			})),
		};
	} else {
		return { labels, datasets };
	}
}

// Function to get RSSI data (reusable for both HTTP and Socket.io)
async function getRssiData() {
	const [rows] = await db.query(createTimeGroupQuery("rssi"));
	const formattedRows = rows.map((r) => ({ ...r, avg_rssi: r.avg_value }));
	const labels = await getUnifiedLabels(); // Use unified labels
	const datasets = formatDataForChart(formattedRows, "avg_rssi", labels);

	if (labels.length === 0) {
		return {
			labels: [],
			datasets: nodeInfo.map((node) => ({
				label: node.label,
				data: [],
				borderColor: node.color,
				tension: 0.4, // More fluid curves like flowing water
				borderWidth: 3, // Thicker line for better flow visibility
				borderCapStyle: 'round', // Smooth line endings
				borderJoinStyle: 'round', // Smooth connections
				stepped: false, // Smooth continuous line
				spanGaps: true,
				pointBackgroundColor: node.color,
				pointHoverBackgroundColor: node.color,
				pointRadius: 1, // Smaller points for cleaner water flow
				pointHoverRadius: 4,
				pointBorderWidth: 0 // No border for smoother look
			})),
		};
	} else {
		return { labels, datasets };
	}
}

// Function to get daily statistics for the cards
async function getStatisticsData() {
	try {
		const query = `
			SELECT 
				Node_id,
				SUM(flow_rate * 60) as total_liters,
				COUNT(*) as data_points
			FROM volume_air 
			WHERE DATE(timestamp) = CURDATE() 
				AND flow_rate IS NOT NULL
			GROUP BY Node_id
		`;

		const [rows] = await db.query(query);

		// Calculate statistics for each node
		const stats = {
			node1: { value: 0, growth: "+0%" },
			node2: { value: 0, growth: "+0%" },
			node3: { value: 0, growth: "+0%" },
		};

		rows.forEach((row) => {
			if (stats[row.Node_id]) {
				stats[row.Node_id].value = Math.round(row.total_liters || 0);
				// For now, we'll show a simple growth calculation
				stats[row.Node_id].growth = row.data_points > 10 ? "+5%" : "+2%";
			}
		});

		return stats;
	} catch (err) {
		console.error("Error getting statistics:", err);
		return {
			node1: { value: 0, growth: "+0%" },
			node2: { value: 0, growth: "+0%" },
			node3: { value: 0, growth: "+0%" },
		};
	}
}

// Export functions for use in Socket.io
module.exports = router;
module.exports.getFlowrateData = getFlowrateData;
module.exports.getRssiData = getRssiData;
module.exports.getStatisticsData = getStatisticsData;
