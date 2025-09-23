# 🌊 Kepuh Statistic - Water Flow Monitoring System

Sistem monitoring aliran air real-time menggunakan microcontroller dan web dashboard.

## 🚀 Quick Start

### Mengirim Data dari Microcontroller

Kirim data dalam format JSON ke endpoint:

```
POST http://your-server.com/data
```

**Format JSON:**

```json
{
	"node_id": "node1",
	"flow_rate": 25.5,
	"rssi": -45
}
```

**Parameter:**

-   `node_id` (wajib): "node1", "node2", atau "node3"
-   `flow_rate` (opsional): Kecepatan aliran air (angka positif)
-   `rssi` (opsional): Kekuatan sinyal (angka)
-   `timestamp` (opsional): Waktu pengukuran (ISO format)

## 📡 Endpoint API

| Method | Endpoint      | Deskripsi                         |
| ------ | ------------- | --------------------------------- |
| POST   | `/data`       | Kirim data dari microcontroller   |
| GET    | `/flowrate`   | Ambil data grafik aliran air      |
| GET    | `/rssi`       | Ambil data grafik kekuatan sinyal |
| GET    | `/api/status` | Cek status API                    |

## 🔧 Kontrol Pompa via Blynk & LoRa

### Konfigurasi Virtual Pin Blynk

-   **V0** = Kontrol Pompa Masjid 1 (node1)
-   **V1** = Kontrol Pompa Masjid 2 (node2)
-   **V2** = Kontrol Pompa Masjid 3 (node3)

### Arsitektur LoRa

```
[Web Dashboard] → [Blynk Cloud] → [LoRa Server] → [LoRa Client + Pompa]
```

LoRa Server bertindak sebagai gateway yang:

1. Membaca perubahan virtual pin dari Blynk
2. Mengirim perintah via frekuensi radio ke LoRa Client
3. LoRa Client mengontrol relay pompa air

Lihat dokumentasi lengkap: [`BLYNK_LORA_INTEGRATION.md`](BLYNK_LORA_INTEGRATION.md)

## 🔧 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/wildanzm/kepuh-statistic.git
cd kepuh-statistic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Import schema SQL
mysql -u your_user -p your_database < database/schema.sql
```

### 4. Environment Configuration

```bash
# Copy template environment
cp .env.template .env

# Edit file .env dengan konfigurasi Anda
nano .env
```

**Contoh .env:**

```env
DB_HOST=localhost
DB_USER=kepuh_user
DB_PASSWORD=your_password
DB_NAME=kepuh_statistic
DB_PORT=3306
PORT=3000

# Blynk Integration (1 Token untuk semua kontroler)
BLYNK_AUTH_TOKEN=YOUR_SINGLE_BLYNK_TOKEN
```

### 5. Jalankan Server

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 🧪 Testing API

### Manual Testing

```bash
# Test status endpoint
curl -X GET http://localhost:3000/api/status

# Test kirim data
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -d '{"node_id":"node1","flow_rate":25.5,"rssi":-45}'
```

### Automated Testing

```bash
# Menggunakan script bash
chmod +x test_api.sh
./test_api.sh

# Menggunakan Node.js
node test_api_example.js
```

## � Contoh Implementasi Microcontroller

### Arduino/ESP32

Lihat file lengkap: [`examples/arduino_esp32_example.ino`](examples/arduino_esp32_example.ino)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void sendDataToServer(String nodeId, float flowRate, int rssi) {
  HTTPClient http;
  http.begin("http://your-server.com/data");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["node_id"] = nodeId;
  doc["flow_rate"] = flowRate;
  doc["rssi"] = rssi;

  String jsonString;
  serializeJson(doc, jsonString);

  int httpResponseCode = http.POST(jsonString);
  // Handle response...
}
```

### Raspberry Pi (Python)

Lihat file lengkap: [`examples/raspberry_pi_example.py`](examples/raspberry_pi_example.py)

```python
import requests

def send_data_to_server(node_id, flow_rate, rssi):
    data = {
        "node_id": node_id,
        "flow_rate": flow_rate,
        "rssi": rssi
    }

    response = requests.post(
        "http://your-server.com/data",
        json=data,
        headers={'Content-Type': 'application/json'}
    )

    return response.status_code == 201
```

## �📖 Dokumentasi Lengkap

-   **API Documentation**: [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)
-   **Blynk & LoRa Integration**: [`BLYNK_LORA_INTEGRATION.md`](BLYNK_LORA_INTEGRATION.md)
-   **Setup Guide**: [`examples/SETUP_GUIDE.md`](examples/SETUP_GUIDE.md)
-   **Troubleshooting Guide**: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
-   **Database Schema**: [`database/schema.sql`](database/schema.sql)
-   **LoRa Examples**: [`examples/lora_server.ino`](examples/lora_server.ino), [`examples/lora_client.ino`](examples/lora_client.ino)

## 🗄️ Struktur Database

### Tabel `volume_air`

-   `id`: Primary key (auto increment)
-   `Node_id`: ID sensor (node1, node2, node3)
-   `flow_rate`: Kecepatan aliran air (L/min)
-   `rssi`: Kekuatan sinyal (dBm)
-   `timestamp`: Waktu pengukuran

### Tabel `nodes`

-   `node_id`: ID node
-   `name`: Nama node (Masjid 1, 2, 3)
-   `location`: Lokasi node
-   `description`: Deskripsi node

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MySQL
-   **Real-time**: Socket.io
-   **Frontend**: HTML, CSS, JavaScript
-   **Styling**: Tailwind CSS

## 🔧 Development

### Project Structure

```
kepuh-statistic/
├── app.js                 # Main application
├── package.json          # Dependencies
├── database/
│   ├── db.js            # Database connection
│   └── schema.sql       # Database schema
├── routes/
│   └── index.js         # API routes
├── public/              # Static files
├── examples/            # Implementation examples
└── docs/               # Documentation
```

### Available Scripts

-   `npm start` - Start the server
-   `npm test` - Run tests (future)
-   `npm run dev` - Development mode (future)

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error**

-   ✅ Check database credentials in `.env`
-   ✅ Ensure MySQL service is running
-   ✅ Verify database exists

**API Returns 400 Error**

-   ✅ Check JSON format
-   ✅ Ensure `node_id` is valid (node1/node2/node3)
-   ✅ Verify `flow_rate` is positive number

**Data Not Appearing in Dashboard**

-   ✅ Check if data is saved to database
-   ✅ Verify timestamp is current day
-   ✅ Clear browser cache

**Blynk "Invalid Token" Error**

-   ✅ Check BLYNK_AUTH_TOKEN in `.env`
-   ✅ Ensure Virtual Pins V0, V1, V2 configured in Blynk
-   ✅ Verify Blynk project is active and online
-   ✅ See detailed troubleshooting: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

-   Buka [Issue](https://github.com/wildanzm/kepuh-statistic/issues) di GitHub
-   Email: [your-email@example.com]
-   Documentation: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
