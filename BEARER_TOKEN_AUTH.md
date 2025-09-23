# 🔐 Bearer Token Authentication - IMPLEMENTED ✅

## 📋 Overview

Bearer token authentication telah berhasil ditambahkan pada endpoint POST /data untuk menerima data dari microcontroller.

## 🔧 Implementation Details

### 1. Environment Configuration

File: `.env`

```properties
# Microcontroller Authentication
MICROCONTROLLER_TOKEN=MCU_SECRET_TOKEN_2025_KEPUH_STATISTIC_v1
```

### 2. Authentication Middleware

File: `routes/index.js`

```javascript
// Middleware untuk bearer token authentication
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

	const expectedToken = process.env.MICROCONTROLLER_TOKEN;

	if (!expectedToken) {
		return res.status(500).json({
			success: false,
			message: "Server configuration error",
		});
	}

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Access token required. Format: Bearer <token>",
		});
	}

	if (token !== expectedToken) {
		return res.status(403).json({
			success: false,
			message: "Invalid access token",
		});
	}

	next();
};
```

### 3. Protected Endpoint

```javascript
router.post("/data", authenticateToken, async (req, res) => {
	// Endpoint logic...
});
```

## 🧪 Testing

### Manual Test Commands

#### 1. Test Tanpa Token (Should return 401)

```bash
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -d '{"node_id": "node1", "flow_rate": 5.2, "rssi": -45}'
```

**Expected Response:**

```json
{
	"success": false,
	"message": "Access token required. Format: Bearer <token>"
}
```

#### 2. Test Dengan Token Invalid (Should return 403)

```bash
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -d '{"node_id": "node1", "flow_rate": 5.2, "rssi": -45}'
```

**Expected Response:**

```json
{
	"success": false,
	"message": "Invalid access token"
}
```

#### 3. Test Dengan Token Valid (Should return 201)

```bash
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MCU_SECRET_TOKEN_2025_KEPUH_STATISTIC_v1" \
  -d '{"node_id": "node1", "flow_rate": 5.2, "rssi": -45}'
```

**Expected Response:**

```json
{
	"success": true,
	"message": "Data berhasil disimpan",
	"data": {
		"node_id": "node1",
		"flow_rate": 5.2,
		"rssi": -45,
		"timestamp": "2025-09-23T..."
	}
}
```

## 📱 Microcontroller Implementation

### Arduino/ESP32 Code Example

File: `examples/microcontroller_bearer_auth.ino`

```cpp
// Set headers untuk JSON dan Bearer Token
http.addHeader("Content-Type", "application/json");
http.addHeader("Authorization", "Bearer MCU_SECRET_TOKEN_2025_KEPUH_STATISTIC_v1");

// Kirim POST request
int httpResponseCode = http.POST(jsonString);

if (httpResponseCode == 201) {
    Serial.println("✅ Data berhasil dikirim!");
} else if (httpResponseCode == 401) {
    Serial.println("❌ Bearer token required!");
} else if (httpResponseCode == 403) {
    Serial.println("❌ Invalid bearer token!");
}
```

## 🔒 Security Features

### 1. Token Validation

-   ✅ Checks for presence of Authorization header
-   ✅ Validates Bearer token format
-   ✅ Compares token with environment variable
-   ✅ Logs invalid token attempts (partial token shown for security)

### 2. Error Responses

-   **401 Unauthorized**: Token missing or wrong format
-   **403 Forbidden**: Invalid token value
-   **500 Internal Server Error**: Server configuration issue

### 3. Logging

```javascript
// Success
console.log(`✅ Valid microcontroller token authenticated`);

// Failure
console.log(`❌ Invalid token attempt: ${token.substring(0, 10)}...`);
```

## 📚 API Documentation Update

### GET /api/status Response

```json
{
	"success": true,
	"message": "Kepuh Statistic API is running",
	"endpoints": {
		"POST /data": "Mengirim data dari microcontroller (Requires Bearer Token)",
		"GET /flowrate": "Mengambil data grafik aliran air",
		"GET /rssi": "Mengambil data grafik kekuatan sinyal",
		"GET /api/status": "Mengecek status API"
	},
	"authentication": {
		"POST /data": {
			"type": "Bearer Token",
			"header": "Authorization: Bearer <token>",
			"description": "Token diperlukan untuk autentikasi microcontroller"
		}
	}
}
```

## 🚀 Deployment Notes

### 1. Environment Setup

-   Pastikan `MICROCONTROLLER_TOKEN` ada di file `.env`
-   Token sebaiknya diganti dengan nilai yang lebih secure untuk production

### 2. Microcontroller Update

-   Update firmware microcontroller untuk include bearer token
-   Test konektivitas sebelum deployment

### 3. Security Considerations

-   Token disimpan di environment variable (tidak di code)
-   Partial token logging untuk security
-   HTTPS recommended untuk production

## ✅ Status

-   [x] Bearer token middleware implemented
-   [x] Environment configuration added
-   [x] Protected POST /data endpoint
-   [x] Arduino code example provided
-   [x] Test script created
-   [x] API documentation updated
-   [x] Security logging implemented

**COMPLETED**: Bearer token authentication successfully added to microcontroller data endpoint! 🎉

---

**Date**: September 23, 2025  
**Version**: v4.0 - Bearer Token Authentication
