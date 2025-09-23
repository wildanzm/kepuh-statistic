# 📚 Dokumentasi API - Kepuh Statistic

## 📡 Endpoint untuk Microcontroller

### POST /data - Mengirim Data dari Microcontroller

Endpoint ini digunakan untuk mengirim data sensor dari microcontroller ke server.

#### 📍 URL

```
POST http://your-server.com/data
```

#### 📋 Format Data yang Diterima (JSON)

```json
{
	"node_id": "node1",
	"flow_rate": 25.5,
	"rssi": -45,
	"timestamp": "2025-09-22T10:30:00.000Z"
}
```

#### 📝 Penjelasan Parameter

| Parameter   | Tipe   | Wajib    | Deskripsi                                 |
| ----------- | ------ | -------- | ----------------------------------------- |
| `node_id`   | String | ✅ Ya    | ID sensor/node (node1, node2, atau node3) |
| `flow_rate` | Number | ❌ Tidak | Kecepatan aliran air (liter/menit)        |
| `rssi`      | Number | ❌ Tidak | Kekuatan sinyal (-100 hingga 0)           |
| `timestamp` | String | ❌ Tidak | Waktu pengukuran (ISO format)             |

#### ✅ Contoh Request yang Benar

**Dengan semua parameter:**

```json
{
	"node_id": "node1",
	"flow_rate": 15.75,
	"rssi": -55,
	"timestamp": "2025-09-22T10:30:00.000Z"
}
```

**Minimal (hanya node_id):**

```json
{
	"node_id": "node2"
}
```

**Hanya dengan flow_rate:**

```json
{
	"node_id": "node3",
	"flow_rate": 30.2
}
```

#### 📤 Response Sukses (Status: 201)

```json
{
	"success": true,
	"message": "Data berhasil disimpan",
	"data": {
		"node_id": "node1",
		"flow_rate": 15.75,
		"rssi": -55,
		"timestamp": "2025-09-22T10:30:00.000Z"
	}
}
```

#### ❌ Response Error

**Jika node_id tidak valid (Status: 400):**

```json
{
	"success": false,
	"message": "node_id harus salah satu dari: node1, node2, node3"
}
```

**Jika flow_rate bukan angka (Status: 400):**

```json
{
	"success": false,
	"message": "flow_rate harus berupa angka positif"
}
```

**Jika terjadi error server (Status: 500):**

```json
{
	"success": false,
	"message": "Terjadi kesalahan server"
}
```

## 🔧 Cara Menggunakan dari Microcontroller

### Arduino/ESP32 Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void sendDataToServer(String nodeId, float flowRate, int rssi) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://your-server.com/data");
    http.addHeader("Content-Type", "application/json");

    // Buat JSON
    StaticJsonDocument<200> doc;
    doc["node_id"] = nodeId;
    doc["flow_rate"] = flowRate;
    doc["rssi"] = rssi;

    String jsonString;
    serializeJson(doc, jsonString);

    // Kirim data
    int httpResponseCode = http.POST(jsonString);

    if(httpResponseCode == 201) {
      Serial.println("Data berhasil dikirim!");
    } else {
      Serial.print("Error: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
}

// Contoh penggunaan
void loop() {
  float flowRate = readFlowSensor(); // Baca sensor aliran
  int rssi = WiFi.RSSI(); // Kekuatan sinyal WiFi

  sendDataToServer("node1", flowRate, rssi);

  delay(5000); // Kirim setiap 5 detik
}
```

### Python Example

```python
import requests
import json
import time

def send_data(node_id, flow_rate=None, rssi=None):
    url = "http://your-server.com/data"

    data = {"node_id": node_id}
    if flow_rate is not None:
        data["flow_rate"] = flow_rate
    if rssi is not None:
        data["rssi"] = rssi

    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print("Data berhasil dikirim!")
            print(response.json())
        else:
            print(f"Error: {response.status_code}")
            print(response.json())
    except Exception as e:
        print(f"Koneksi gagal: {e}")

# Contoh penggunaan
while True:
    send_data("node1", flow_rate=25.5, rssi=-45)
    time.sleep(5)  # Kirim setiap 5 detik
```

## 📊 Endpoint Lainnya (GET)

### GET /flowrate - Ambil Data Aliran Air

Mengambil data grafik aliran air dari semua node.

### GET /rssi - Ambil Data Kekuatan Sinyal

Mengambil data grafik kekuatan sinyal dari semua node.

## 🛠️ Tips Penggunaan

1. **Frekuensi Pengiriman**: Disarankan mengirim data setiap 5-10 detik untuk menghindari overload server
2. **Koneksi Internet**: Pastikan microcontroller terhubung ke internet yang stabil
3. **Error Handling**: Selalu cek response code dan implementasikan retry mechanism
4. **Timestamp**: Jika tidak diberikan, server akan menggunakan timestamp saat data diterima
5. **Validasi Data**: Pastikan flow_rate berupa angka positif dan rssi berupa angka

## 🔍 Troubleshooting

### Problem: Data tidak tersimpan

-   ✅ Cek apakah Content-Type adalah "application/json"
-   ✅ Pastikan node_id valid (node1, node2, atau node3)
-   ✅ Pastikan format JSON benar

### Problem: Error 400

-   ✅ Periksa format data yang dikirim
-   ✅ Pastikan flow_rate berupa angka positif
-   ✅ Pastikan node_id tidak kosong

### Problem: Error 500

-   ✅ Cek koneksi database server
-   ✅ Hubungi administrator sistem
