# نشر في قلوبنا على GitHub Pages

مستودعك: `https://github.com/aydhsr6/fi.aydhsr`.

رابط الموقع على GitHub Pages: **https://aydhsr6.github.io/fi.aydhsr/**.

## سبب ظهور صفحة فارغة الآن

النسخة الموجودة حالياً في المستودع تنشر ملف `index.html` الأصلي كما هو: يحتوي على `<script type="module" src="/src/main.tsx">`، بينما المستودع على GitHub لا يحتوي أصلاً على مجلد `src/` ولا على `.github/workflows/deploy-pages.yml`. GitHub Pages لا يبني ملفات React/TSX تلقائياً؛ والمسار `/src/main.tsx` يشير إلى جذر الدومين بدلاً من `/fi.aydhsr/`. لذلك تظهر الصفحة فارغة. **تغيير اسم الرابط أو إعادة تحميل الصفحة لن يصلح هذا الخلل.**

## الإصلاح الموصى به: النشر التلقائي

1. ارفع ملفات هذا المشروع **كاملة** إلى جذر المستودع `fi.aydhsr` على فرع `main` (أو `master`)، بما فيها `src/` و`public/` و`package.json` والمجلد المخفي `.github/workflows/`. لا ترفع `dist/` أو `node_modules/`، ولا ترفع رموز `sbp_` أو كلمات المرور. إذا أضفت صورتك الأصلية، ضعها في `public/logo.png` أو `public/logo.jpg` قبل الرفع.
2. افتح [Settings > Pages](https://github.com/aydhsr6/fi.aydhsr/settings/pages) في المستودع. ضمن **Build and deployment > Source** اختر **GitHub Actions** بدلاً من **Deploy from a branch**.
3. افتح [Actions](https://github.com/aydhsr6/fi.aydhsr/actions) وانتظر نجاح **Deploy Fi Qulubina to GitHub Pages**. إن لم يبدأ، اختر سير العمل واضغط **Run workflow**. كل تحديث لاحق على `main` أو `master` سيعيد النشر آلياً.
4. افتح الرابط أعلاه بعد اكتمال النشر. تحقق من **View page source**: ينبغي أن يحتوي على JavaScript مضمن من نسخة `dist/index.html` وألا يحتوي على المسار `/src/main.tsx`.

## بديل سريع: رفع النسخة المبنية يدوياً

إذا تعذر رفع ملفات المشروع وإعداد Actions، انسخ **محتويات** مجلد `dist/` بعد البناء إلى جذر المستودع على فرع `main`: استبدل ملف `index.html` القديم بـ `dist/index.html`، وارفع `dist/favicon.svg` ومجلد `dist/images/` وأي شعار أضفته. ثم اختر **Deploy from a branch > main > /(root)** في Settings > Pages. لا ترفع ملف `index.html` من جذر المشروع وحده، فهو ملف المصدر وليس الموقع الجاهز للنشر.

ملف النشر التلقائي هو `.github/workflows/deploy-pages.yml`. يبني موقع Vite ويرفع **محتويات** `dist/` إلى GitHub Pages، بما فيها `index.html` والصور والأيقونة. الروابط النسبية للصور تدعم مستودعات GitHub Pages التي تستخدم مساراً فرعياً.

اتصال Supabase يحتوي على رابط المشروع ومفتاح النشر **العام**. إذا ظهرت رسالة خطأ تحميل المنشورات بعد النشر، أكمل خطوات `SUPABASE_SETUP.md` لتنفيذ `supabase/setup.sql` وإنشاء حساب المشرف. مفتاح النشر العام لا يغني عن سياسات RLS وتوثيق المشرف.