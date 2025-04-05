#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

// ----------- WiFi & MQTT Config -----------
const char* ssid = "Hello";
const char* password = "amibolbona";
const char* mqtt_server = "192.168.120.9"; // Mosquitto IP
const int mqtt_port = 1883;
WiFiClient espClient;
PubSubClient client(espClient);

// ----------- Pin Definitions -----------
#define SOIL_SENSOR_1 34
#define SOIL_SENSOR_2 35
#define RELAY_PIN 5
#define LED_PIN 2    // Added LED pin
#define DHTPIN 4  
#define DHTTYPE DHT22

// ----------- Sensor & Threshold -----------
float moistureThreshold = 40;
DHT dht(DHTPIN, DHTTYPE);

// ----------- System State -----------
bool autoMode = true;        // Default to auto mode
bool manualOverride = false; // Track manual override
unsigned long manualOverrideEndTime = 0;
const unsigned long manualOverrideDuration = 1800000; // 30 minutes in ms

// ----------- MQTT Callback -----------
void callback(char* topic, byte* payload, unsigned int length) {
  String command = "";
  for (int i = 0; i < length; i++) {
    command += (char)payload[i];
  }

  Serial.print("MQTT command on ");
  Serial.print(topic);
  Serial.print(": ");
  Serial.println(command);

  if (String(topic) == "krishii/pump/control") {
    if (command == "ON") {
      digitalWrite(RELAY_PIN, HIGH);  // Pump ON
      digitalWrite(LED_PIN, HIGH);   // LED ON
      autoMode = false;
      manualOverride = true;
      manualOverrideEndTime = millis() + manualOverrideDuration;
      Serial.println("Manual Pump ON - Auto mode disabled");
    } 
    else if (command == "OFF") {
      digitalWrite(RELAY_PIN, LOW); // Pump OFF
      digitalWrite(LED_PIN, LOW);    // LED OFF
      autoMode = true;
      manualOverride = false;
      Serial.println("Manual Pump OFF - Auto mode enabled");
    }
  }
  else if (String(topic) == "krishii/pump/mode") {
    if (command == "AUTO") {
      autoMode = true;
      manualOverride = false;
      digitalWrite(LED_PIN, LOW); // LED OFF when returning to auto
      Serial.println("System set to AUTO mode");
    }
    else if (command == "MANUAL") {
      autoMode = false;
      manualOverride = true;
      Serial.println("System set to MANUAL mode");
    }
  }
}

// ----------- WiFi Connect -----------
void setup_wifi() {
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// ----------- MQTT Connect -----------
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      Serial.println("connected to MQTT");
      client.subscribe("krishii/pump/control");
      client.subscribe("krishii/pump/mode");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// ----------- Setup -----------
void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT); // Initialize LED pin
  digitalWrite(RELAY_PIN, LOW);  // Pump OFF initially
  digitalWrite(LED_PIN, LOW);     // LED OFF initially
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// ----------- Loop -----------
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Check if manual override time has expired
  if (manualOverride && millis() >= manualOverrideEndTime) {
    autoMode = true;
    manualOverride = false;
    digitalWrite(LED_PIN, LOW); // Turn off LED when returning to auto
    Serial.println("Manual override expired - returning to AUTO mode");
  }

  // --- Read Soil Moisture
  int moisture1 = analogRead(SOIL_SENSOR_1);
  int moisture2 = analogRead(SOIL_SENSOR_2);
  int avgMoisture = (moisture1 + moisture2) / 2;
  float moisture_percentage = (100 - ((avgMoisture / 4095.0) * 100));

  // --- Read DHT Sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
  }

  // --- Auto Pump Control (only if in auto mode)
  if (autoMode && !manualOverride) {
    if ((moisture_percentage <= moistureThreshold) || (avgMoisture == 0)) {
      digitalWrite(RELAY_PIN, LOW);  // Pump ON
      Serial.println("Auto Control: Pump ON (Low Moisture)");
    } else {
      digitalWrite(RELAY_PIN, HIGH); // Pump OFF
      Serial.println("Auto Control: Pump OFF (Sufficient Moisture)");
    }
  }

  // --- Serial Debug
  Serial.print("Mode: ");
  Serial.println(autoMode ? "AUTO" : "MANUAL");
  Serial.print("Soil Moisture %: "); Serial.println(moisture_percentage);
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");

  // --- Publish to MQTT for Web Dashboard
  client.publish("krishii/sensor/soil", String(moisture_percentage).c_str());
  client.publish("krishii/sensor/temp", String(temperature).c_str());
  client.publish("krishii/sensor/humidity", String(humidity).c_str());

  delay(5000);  // 5 second update cycle
}