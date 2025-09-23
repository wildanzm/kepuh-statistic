const axios = require("axios");

const BASE_URL = ""; // Sesuai dengan .env
const BEARER_TOKEN = ""; // Sesuai dengan .env

// Konfigurasi axios dengan bearer token untuk endpoint /data
const apiClient = axios.create({
	baseURL: BASE_URL,
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${BEARER_TOKEN}`,
	},
});

async function testAPI() {
	console.log("🧪 Testing Kepuh Statistic API Endpoints with Bearer Token Authentication");
	console.log("=======================================================================");

	try {
		// Test 1: Status endpoint (tidak perlu token)
		console.log("\n1️⃣  Testing API Status...");
		const statusResponse = await axios.get(`${BASE_URL}/api/status`);
		console.log("✅ Status:", statusResponse.data);

		// Test 2: Send data tanpa token (harus gagal)
		console.log("\n2️⃣  Testing POST /data WITHOUT bearer token (should fail)...");
		try {
			await axios.post(`${BASE_URL}/data`, {
				node_id: "node1",
				flow_rate: 25.5,
				rssi: -45,
			});
		} catch (error) {
			console.log("✅ Expected 401 error:", error.response.data);
		}

		// Test 3: Send data dengan token invalid (harus gagal)
		console.log("\n3️⃣  Testing POST /data with INVALID bearer token (should fail)...");
		try {
			await axios.post(`${BASE_URL}/data`, { node_id: "node1", flow_rate: 25.5 }, { headers: { Authorization: "Bearer INVALID_TOKEN_123" } });
		} catch (error) {
			console.log("✅ Expected 403 error:", error.response.data);
		}

		// Test 4: Send valid data dengan bearer token yang benar
		console.log("\n4️⃣  Testing POST /data with VALID bearer token...");
		const validData = {
			node_id: "node1",
			flow_rate: 25.5,
			rssi: -45,
		};
		const postResponse = await apiClient.post(`/data`, validData);
		console.log("✅ Valid data with token response:", postResponse.data);

		// Test 5: Send minimal data dengan bearer token
		console.log("\n5️⃣  Testing POST /data with minimal data + token...");
		const minimalData = { node_id: "node2" };
		const minimalResponse = await apiClient.post(`/data`, minimalData);
		console.log("✅ Minimal data with token response:", minimalResponse.data);

		// Test 6: Invalid node_id dengan bearer token yang valid
		console.log("\n6️⃣  Testing POST /data with invalid node_id + valid token...");
		try {
			await apiClient.post(`/data`, { node_id: "invalid_node" });
		} catch (error) {
			console.log("✅ Expected error for invalid node_id:", error.response.data);
		}

		// Test 7: Missing node_id dengan bearer token yang valid
		console.log("\n7️⃣  Testing POST /data with missing node_id + valid token...");
		try {
			await apiClient.post(`/data`, { flow_rate: 20.0 });
		} catch (error) {
			console.log("✅ Expected error for missing node_id:", error.response.data);
		}

		console.log("\n✅ All bearer token authentication tests completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error.message);
		if (error.code === "ECONNREFUSED") {
			console.log("💡 Make sure the server is running with: npm start");
		}
	}
}

// Fungsi untuk mengirim data secara berkala (simulasi microcontroller dengan bearer token)
async function simulateMicrocontroller() {
	console.log("\n🔄 Simulating microcontroller data sending with Bearer Token...");

	const nodes = ["node1", "node2", "node3"];

	for (let i = 0; i < 5; i++) {
		const nodeId = nodes[Math.floor(Math.random() * nodes.length)];
		const data = {
			node_id: nodeId,
			flow_rate: Math.round((Math.random() * 50 + 10) * 100) / 100, // 10-60 L/min
			rssi: Math.round(Math.random() * 40 - 80), // -80 to -40 dBm
		};

		try {
			// Menggunakan apiClient yang sudah include bearer token
			const response = await apiClient.post(`/data`, data);
			console.log(`✅ Sent from ${nodeId} with token:`, response.data.data);

			// Tunggu 2 detik sebelum mengirim data berikutnya
			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (error) {
			console.error(`❌ Failed to send from ${nodeId}:`, error.message);
			if (error.response) {
				console.log("   Error details:", error.response.data);
			}
		}
	}

	console.log("\n🎉 Microcontroller simulation completed!");
}

// Fungsi untuk testing berbagai skenario bearer token
async function testBearerTokenScenarios() {
	console.log("\n🔐 Testing Different Bearer Token Scenarios");
	console.log("============================================");

	const testData = { node_id: "node1", flow_rate: 15.0, rssi: -50 };

	// Scenario 1: No Authorization header
	console.log("\n📋 Scenario 1: No Authorization header");
	try {
		await axios.post(`${BASE_URL}/data`, testData);
	} catch (error) {
		console.log("✅ Expected 401:", error.response?.status, error.response?.data?.message);
	}

	// Scenario 2: Wrong format (no Bearer prefix)
	console.log("\n📋 Scenario 2: Wrong format (no Bearer prefix)");
	try {
		await axios.post(`${BASE_URL}/data`, testData, {
			headers: { Authorization: BEARER_TOKEN },
		});
	} catch (error) {
		console.log("✅ Expected 401:", error.response?.status, error.response?.data?.message);
	}

	// Scenario 3: Empty Bearer token
	console.log("\n📋 Scenario 3: Empty Bearer token");
	try {
		await axios.post(`${BASE_URL}/data`, testData, {
			headers: { Authorization: "Bearer " },
		});
	} catch (error) {
		console.log("✅ Expected 401:", error.response?.status, error.response?.data?.message);
	}

	// Scenario 4: Invalid token
	console.log("\n📋 Scenario 4: Invalid token");
	try {
		await axios.post(`${BASE_URL}/data`, testData, {
			headers: { Authorization: "Bearer WRONG_TOKEN_12345" },
		});
	} catch (error) {
		console.log("✅ Expected 403:", error.response?.status, error.response?.data?.message);
	}

	// Scenario 5: Valid token
	console.log("\n📋 Scenario 5: Valid token");
	try {
		const response = await apiClient.post(`/data`, testData);
		console.log("✅ Success:", response.status, response.data?.message);
	} catch (error) {
		console.log("❌ Unexpected error:", error.response?.status, error.response?.data);
	}

	console.log("\n🔐 Bearer token scenarios testing completed!");
}

// Jalankan test
if (require.main === module) {
	testAPI().then(async () => {
		console.log("\n🎯 Run additional bearer token scenarios test? (Uncomment line below)");
		// await testBearerTokenScenarios();

		console.log("\n🎯 Run microcontroller simulation? (Uncomment line below)");
		console.log("💡 This will send 5 data points with proper bearer token authentication");
		// simulateMicrocontroller();
	});
}

module.exports = { testAPI, simulateMicrocontroller, testBearerTokenScenarios };
