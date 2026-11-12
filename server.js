const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// قراءة الملفات الثابتة في نفس المجلد
app.use(express.static(__dirname));

// مسار الصفحة الرئيسية لعرض ملف index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// الإيديات النشطة في الذاكرة مع وقت انتهاء الصلاحية
let activeTargets = {};

// مسار جلب حالة الإيديات النشطة
app.get('/status', (req, res) => {
    const now = Date.now();
    
    // تصفية وحذف الإيديات التي انتهى وقتها تلقائياً
    const validTargets = Object.keys(activeTargets).filter(uid => {
        if (activeTargets[uid] > now) {
            return true;
        } else {
            delete activeTargets[uid];
            return false;
        }
    });

    res.json({
        success: true,
        active_targets: validTargets
    });
});

// مسار بدء السبام
app.get('/spm', (req, res) => {
    const uid = req.query.uid;
    if (!uid || !/^\d+$/.test(uid)) {
        return res.json({ success: false, message: "UID غير صالح" });
    }

    // تعيين وقت الانتهاء بعد 15 دقيقة
    const durationMs = 15 * 60 * 1000;
    activeTargets[uid] = Date.now() + durationMs;

    res.json({ success: true, message: "تم البدء بنجاح" });
});

// مسار تمديد الوقت
app.get('/extend', (req, res) => {
    const uid = req.query.uid;
    if (!uid || !activeTargets[uid]) {
        return res.json({ success: false, message: "الأيدي غير موجود أو منتهي" });
    }

    const extensionMs = 15 * 60 * 1000;
    activeTargets[uid] = Math.max(activeTargets[uid], Date.now()) + extensionMs;

    res.json({ success: true, message: "تم التمديد بنجاح" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
