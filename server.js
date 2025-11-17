import express from "express";
import cors from "cors";
import { SerialPort } from "serialport";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ تأكدي من رقم المنفذ الخاص بالبلوتوث
const port = new SerialPort({ path: "COM3", baudRate: 9600 });

// ===================== دالة الحساب =====================
function calculateWater(area, soil, temperature, crop) {
  const cropFactors = {
    "Tomato": 6,
    "Wheat": 5,
    "Corn": 5.5,
    "Cucumber": 6
  };
  const cropFactor = cropFactors[crop] || 5;
  return area * cropFactor * (1 - soil / 100) * (temperature / 25);
}

// ===================== مسار الحساب =====================
app.post("/calculate-water", (req, res) => {
  try {
    const { temperature, humidity, soil, crop, area } = req.body;
    if ([temperature, humidity, soil, crop, area].some(v => v === undefined || v === ""))
      return res.status(400).json({ error: "Missing input fields" });
    const water = calculateWater(area, soil, temperature, crop);
    res.json({ water_needed: water });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== تشغيل المضخة =====================
app.post("/pump/on", (req, res) => {
  port.write("F", err => { // ✅ إرسال حرف F لبدء التشغيل
    if (err) return res.status(500).json({ error: err.message });
    console.log("💧 Pump ON command (F) sent via Bluetooth");
    res.json({ status: "Pump ON" });
  });
});

// ===================== إيقاف المضخة =====================
app.post("/pump/off", (req, res) => {
  port.write("S", err => { // ✅ إرسال حرف S للإيقاف
    if (err) return res.status(500).json({ error: err.message });
    console.log("🚫 Pump OFF command (S) sent via Bluetooth");
    res.json({ status: "Pump OFF" });
  });
});

// ===================== تشغيل الخادم =====================
const PORT = 3000;
app.listen(PORT, () => console.log(`🌿 Server running on http://localhost:${PORT}`));
