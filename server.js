const express = require('express');
const cors = require('cors');
const path = require('path'); // 1. تمت إضافة مكتبة المسارات
const app = express();

app.use(express.json());
app.use(cors());

// 2. تفعيل قراءة الملفات الثابتة في نفس المجلد
app.use(express.static(__dirname));

// 3. مسار الصفحة الرئيسية لعرض ملف index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تخزين مؤقت للإيديات النشطة في الذاكرة مع وقت انتهاء الصلاحية
let activeTargets = {};

// 1. مسار جلب حالة الإيديات النشطة
app.get('/status', (req, res) => {
    const now = Date.now();
    // تصفية الإيديات التي انتهى وقتها تلقائياً
    const validTargets = Object.keys(activeTargets).filter(uid => {
        if (activeTargets[uid] > now) {
            return true;
        } else {
            delete activeTargets[uid]; // حذف المنتهي
            return false;
        }
    });

    res.json({
        success: true,
        active_targets: validTargets
    });
});

// 2. مسار بدء السبام للإيدي الجديد (لمدة 15 دقيقة افتراضياً)
app.get('/spm', (req, res) => {
    const uid = req.query.uid;
    if (!uid) {
        return res.json({ success: false, message: "الرجاء إدخال UID" });
    }

    const durationMs = 15 * 60 * 1000; // 15 دقيقة
    activeTargets[uid] = Date.now() + durationMs;

    res.json({
        success: true,
        message: "تم بدء السبام بنجاح"
    });
});

// 3. مسار تمديد الوقت (عند الضغط على زر التمديد)
app.get('/extend', (req, res) => {
    const uid = req.query.uid;
    if (!uid || !activeTargets[uid]) {
        return res.json({ success: false, message: "الإيدي غير نشط أو غير موجود" });
    }

    const extensionMs = 15 * 60 * 1000; // إضافة 15 دقيقة
    if (activeTargets[uid] > Date.now()) {
        activeTargets[uid] += extensionMs;
    } else {
        activeTargets[uid] = Date.now() + extensionMs;
    }

    res.json({
        success: true,
        message: "تم تمديد الوقت بنجاح"
    });
});

// تشغيل السيرفر على البورت الافتراضي للمنصات أو بورت 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
