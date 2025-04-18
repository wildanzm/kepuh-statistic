const express = require("express");
const router = express.Router();
const db = require("../database/db.js");

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { title: "Kepuh Statistic" });
});

router.get("/flowrate", async (req, res) => {
	try {
		const [rows] = await db.query(`
            SELECT 
                Node_id,
                DATE_FORMAT(
                    DATE_SUB(
                        timestamp, 
                        INTERVAL MOD(MINUTE(timestamp), 3) MINUTE
                    ),
                    '%H:%i'
                ) AS time_label,
                AVG(flow_rate) AS avg_flow_rate
            FROM volume_air
            WHERE DATE(timestamp) = (
                SELECT DATE(timestamp)
                FROM volume_air
                ORDER BY timestamp DESC
                LIMIT 1
            )
            GROUP BY 
                Node_id, 
                DATE_FORMAT(
                    DATE_SUB(
                        timestamp, 
                        INTERVAL MOD(MINUTE(timestamp), 3) MINUTE
                    ),
                    '%H:%i'
                )
            ORDER BY time_label;
        `);

		const masjid1Map = new Map();
		const masjid2Map = new Map();
		const masjid3Map = new Map();
		const labelsSet = new Set();

		rows.forEach((row) => {
			// Pastikan time_label dan avg_flow_rate tidak null
			if (!row.time_label || row.avg_flow_rate === null) {
				console.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
				return;
			}

			labelsSet.add(row.time_label);

			// Gunakan Node_id dengan huruf kecil untuk konsistensi
			switch (row.Node_id.toLowerCase()) {
				case "node1":
					masjid1Map.set(row.time_label, row.avg_flow_rate);
					break;
				case "node2":
					masjid2Map.set(row.time_label, row.avg_flow_rate);
					break;
				case "node3":
					masjid3Map.set(row.time_label, row.avg_flow_rate);
					break;
				default:
					console.warn(`Unknown Node_id: ${row.Node_id}`);
			}
		});

		// Urutkan label waktu
		const labels = Array.from(labelsSet).sort((a, b) => {
			const [aHour, aMinute] = a.split(":").map(Number);
			const [bHour, bMinute] = b.split(":").map(Number);
			return aHour * 60 + aMinute - (bHour * 60 + bMinute);
		});

		// Isi data yang hilang dengan 0
		const fillMissing = (map) => labels.map((label) => map.get(label) ?? 0);

		// Jika tidak ada data, kirim dataset kosong
		if (labels.length === 0) {
			return res.json({
				labels: [],
				datasets: [
					{
						label: "Masjid 1",
						data: [],
						borderColor: "rgba(54, 162, 235, 1)",
						backgroundColor: "rgba(54, 162, 235, 0.2)",
						borderWidth: 2,
						tension: 0.5,
					},
					{
						label: "Masjid 2",
						data: [],
						borderColor: "rgba(255, 99, 132, 1)",
						backgroundColor: "rgba(255, 99, 132, 0.2)",
						borderWidth: 2,
						tension: 0.5,
					},
					{
						label: "Masjid 3",
						data: [],
						borderColor: "rgba(75, 192, 192, 1)",
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						borderWidth: 2,
						tension: 0.5,
					},
				],
			});
		}

		res.json({
			labels,
			datasets: [
				{
					label: "Masjid 1",
					data: fillMissing(masjid1Map),
					borderColor: "rgba(54, 162, 235, 1)",
					backgroundColor: "rgba(54, 162, 235, 0.2)",
					borderWidth: 2,
					tension: 0.5,
				},
				{
					label: "Masjid 2",
					data: fillMissing(masjid2Map),
					borderColor: "rgba(255, 99, 132, 1)",
					backgroundColor: "rgba(255, 99, 132, 0.2)",
					borderWidth: 2,
					tension: 0.5,
				},
				{
					label: "Masjid 3",
					data: fillMissing(masjid3Map),
					borderColor: "rgba(75, 192, 192, 1)",
					backgroundColor: "rgba(75, 192, 192, 0.2)",
					borderWidth: 2,
					tension: 0.5,
				},
			],
		});
	} catch (err) {
		console.error("DB Error:", err.stack);
		res.status(500).json({ message: "Database error", error: err.message });
	}
});

module.exports = router;
