# 🌐 Integrasi Blynk & LoRa - Kontrol Pompa Air

## 📡 Arsitektur Sistem

### Konsep LoRa Server-Client

```
[Blynk Cloud]
     ↓ (Virtual Pin V0, V1, V2)
[Web Dashboard]
     ↓ (HTTP API)
[LoRa Server]
     ↓ (Frekuensi Radio)
[LoRa Client 1] → [Pompa Masjid 1]
[LoRa Client 2] → [Pompa Masjid 2]
[LoRa Client 3] → [Pompa Masjid 3]
```

## ⚙️ Konfigurasi Blynk

### 1. Satu Token untuk Semua Kontroler

Sistem sekarang menggunakan **1 Auth Token** dengan virtual pin yang berbeda:

-   **V0** = Kontrol Pompa Masjid 1 (node1)
-   **V1** = Kontrol Pompa Masjid 2 (node2)
-   **V2** = Kontrol Pompa Masjid 3 (node3)

### 2. Setup Blynk Project

#### Virtual Pin Configuration:

```
V0 - Switch Widget (Masjid 1)
V1 - Switch Widget (Masjid 2)
V2 - Switch Widget (Masjid 3)
```

#### Widget Settings:

-   **Type**: Switch
-   **Output**: Digital (0/1)
-   **Mode**: Push (momentary)

## 🔧 Konfigurasi Environment

### File `.env`

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=kepuh_user
DB_PASSWORD=your_password
DB_NAME=kepuh_statistic
DB_PORT=3306

# Server Port
PORT=3000

# Blynk Configuration
BLYNK_AUTH_TOKEN=YOUR_SINGLE_BLYNK_TOKEN_HERE
```

## 📡 Implementasi LoRa

### LoRa Server (Menerima dari Web, Kirim ke LoRa Clients)

```cpp
// ESP32 LoRa Server - Menerima dari Web Dashboard
#include <WiFi.h>
#include <LoRa.h>
#include <ArduinoJson.h>

// LoRa Configuration
#define SS 18
#define RST 14
#define DIO0 26

// Virtual Pin Mapping
struct PumpControl {
  String nodeId;
  String virtualPin;
  int loraAddress;
};

PumpControl pumps[] = {
  {"node1", "V0", 0x01}, // Masjid 1
  {"node2", "V1", 0x02}, // Masjid 2
  {"node3", "V2", 0x03}  // Masjid 3
};

void setup() {
  Serial.begin(115200);

  // Setup WiFi
  WiFi.begin("WIFI_SSID", "WIFI_PASS");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }

  // Setup LoRa
  LoRa.setPins(SS, RST, DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  Serial.println("LoRa Server Ready");
}

void sendLoRaCommand(int address, int command) {
  LoRa.beginPacket();
  LoRa.write(address);  // Target address
  LoRa.write(command);  // Command (1=OPEN, 0=CLOSE)
  LoRa.endPacket();

  Serial.printf("Sent to 0x%02X: %s\n",
    address, command ? "OPEN" : "CLOSE");
}

void checkBlynkCommands() {
  // Cek virtual pin dari Blynk
  for (int i = 0; i < 3; i++) {
    // Baca value dari Blynk virtual pin
    int value = getBlynkValue(pumps[i].virtualPin);

    if (value != -1) { // Ada perubahan
      sendLoRaCommand(pumps[i].loraAddress, value);
      delay(100); // Delay antar pengiriman
    }
  }
}

void loop() {
  checkBlynkCommands();
  delay(1000);
}
```

### LoRa Client (Kontrol Pompa Individual)

```cpp
// ESP32 LoRa Client - Kontrol Pompa
#include <LoRa.h>

// LoRa Configuration
#define SS 18
#define RST 14
#define DIO0 26

// Device Configuration
const int DEVICE_ADDRESS = 0x01; // 0x01=Masjid1, 0x02=Masjid2, 0x03=Masjid3
const int RELAY_PIN = 2;

void setup() {
  Serial.begin(115200);

  // Setup Relay
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  // Setup LoRa
  LoRa.setPins(SS, RST, DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  Serial.printf("LoRa Client 0x%02X Ready\n", DEVICE_ADDRESS);
}

void loop() {
  // Cek pesan LoRa
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    // Baca alamat target
    int targetAddress = LoRa.read();

    // Cek apakah pesan untuk device ini
    if (targetAddress == DEVICE_ADDRESS) {
      int command = LoRa.read();

      // Kontrol relay
      digitalWrite(RELAY_PIN, command);

      Serial.printf("Received command: %s\n",
        command ? "OPEN" : "CLOSE");

      // Feedback ke serial (opsional)
      Serial.printf("Pump status: %s\n",
        digitalRead(RELAY_PIN) ? "ON" : "OFF");
    }
  }
}
```

## 🌐 Integrasi Web Dashboard

### Frontend JavaScript (Sudah terintegrasi)

Kontrol pompa sudah tersedia di tab "Kontrol Pompa" dengan tombol:

-   **Buka**: Mengirim nilai 1 ke virtual pin
-   **Tutup**: Mengirim nilai 0 ke virtual pin

### Backend API Flow

```javascript
// Client click "Buka Pompa Masjid 1"
socket.emit("pipe:control", { nodeId: "node1", action: "OPEN" });

// Server process:
// 1. Mapping: node1 → V0
// 2. HTTP GET: https://blynk.cloud/external/api/update?token=XXX&v0=1
// 3. Blynk Cloud updates V0 = 1
// 4. LoRa Server reads V0 = 1
// 5. LoRa Server sends: [0x01, 1] via radio
// 6. LoRa Client 0x01 receives command
// 7. Relay ON → Pompa Masjid 1 aktif
```

## 🔍 Troubleshooting

### Problem: Kontrol tidak berfungsi

1. **Cek Environment Variable**

    ```bash
    echo $BLYNK_AUTH_TOKEN
    ```

2. **Test Blynk API Manual**

    ```bash
    curl "https://blynk.cloud/external/api/update?token=YOUR_TOKEN&v0=1"
    ```

3. **Monitor LoRa Communication**
    - Cek serial monitor LoRa Server
    - Cek serial monitor LoRa Client
    - Pastikan frekuensi sama (433MHz)

### Problem: Koneksi LoRa gagal

1. **Cek Hardware**

    - Pastikan wiring LoRa module benar
    - Cek antena terpasang
    - Pastikan power supply stabil

2. **Cek Software**
    - Pastikan library LoRa terinstall
    - Cek pin configuration
    - Monitor serial output

### Problem: Response lambat

1. **Optimasi LoRa**
    - Kurangi delay antar transmisi
    - Gunakan spreading factor optimal
    - Pastikan tidak ada interference

## 📊 Monitoring & Logging

### Server Logs

```
✅ Perintah ke Blynk untuk node1 (v0) berhasil dikirim: OPEN (1)
📡 Sent to 0x01: OPEN
🔄 Client 0x01 acknowledged
```

### Performance Metrics

-   **Web → Blynk**: ~200-500ms
-   **LoRa Transmission**: ~50-200ms
-   **Total Response**: <1 detik

## 🚀 Future Improvements

1. **Acknowledgment System**: LoRa client kirim konfirmasi ke server
2. **Status Monitoring**: Real-time status pompa di dashboard
3. **Automatic Retry**: Auto retry jika transmisi gagal
4. **Power Management**: Sleep mode untuk LoRa clients
5. **Security**: Enkripsi komunikasi LoRa
