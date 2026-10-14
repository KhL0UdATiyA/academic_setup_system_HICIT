# دليل مشروع HICIT (نظام الإدارة الأكاديمية)

الدليل ده بيشرحلك الملفات اللي اتقسّم ليها الملف الكبير (5800 سطر)، وإزاي تعدّلي فيها بنفسك.

---

## 1) الملف ده فعلاً إيه؟

الملف الأصلي اللي اسمه `.html` **مش HTML عادي**. هو تطبيق **React** مكتوب جوه صفحة HTML، ومعاه 3 أدوات بتتحمّل من الإنترنت:

| الأداة | بتعمل إيه |
|---|---|
| **React** | بتبني الشاشات من قطع صغيرة اسمها Components (مكوّنات) |
| **Babel** | بتحوّل كود React (JSX) لكود يفهمه المتصفح، وقت التشغيل |
| **Tailwind CSS** | بتدّيكي التنسيق عن طريق كلمات جاهزة في `className` (زي `p-4` و `rounded-xl`) بدل ما تكتبي CSS |
| **Lucide** | الأيقونات: `<i data-lucide="x">` |

**مفيش سيرفر ولا قاعدة بيانات.** كل الداتا (الطلاب والمقررات واللوائح...) داتا تجريبية مكتوبة جوه الكود، وبتتغير في الذاكرة بس. أول ما تعملي Refresh كل حاجة بترجع زي ما كانت.

---

## 2) شكل المجلدات

```
hicit-admin/
├── index.html                ← الهيكل الرئيسي: بيحمّل كل الملفات التانية بالترتيب
├── css/styles.css            ← تنسيقات خاصة (الخط، الخلفية، السكرول بار، السايدبار)
├── js/
│   ├── tailwind-config.js    ← ألوان وخطوط المشروع (navy, brand)
│   ├── 00-react-setup.js     ← سطر واحد: بيجهّز useState/useEffect
│   ├── data/                 ← الداتا التجريبية (أسماء، طلاب، مقررات...)
│   │   ├── initial-data.js
│   │   ├── permissions-and-roles.js
│   │   └── demo-data.js
│   ├── utils/academic-rules.js   ← دوال الحسابات (الترقية، الدرجات، النجاح)
│   ├── config/navigation.js      ← القائمة الجانبية والتابات والصلاحيات
│   ├── App.jsx                   ← الإطار العام + ربط كل الأقسام ببعض
│   ├── main.js                   ← آخر سطرين: بيشغّل التطبيق
│   └── components/               ← الشاشات، مقسّمة بنفس أقسام القائمة الجانبية
│       ├── dashboard/            ← لوحة التحكم + نافذة "تعريف المعهد"
│       ├── academic-setup/       ← الإعداد الأكاديمي
│       ├── system-members/       ← أعضاء النظام
│       ├── students-cohorts/     ← الطلاب والدفعات
│       ├── term-operations/      ← عمليات الفصل الدراسي
│       └── control-grading/      ← الكنترول والنتائج
└── merge.py                  ← أداة تدمج كل حاجة في ملف واحد (شوفي القسم 7)
```

### كل ملف في components فيه شاشة واحدة

| القسم (القائمة الجانبية) | التاب | الملف |
|---|---|---|
| **لوحة التحكم** | الصفحة الرئيسية | `dashboard/DashboardOverviewView.jsx` |
| | نافذة تعريف المعهد | `dashboard/InstituteProfileModal.jsx` |
| **الإعداد الأكاديمي** | اللوائح الأكاديمية | `academic-setup/RegulationsDirectoryView.jsx` |
| | نافذة بناء/تعديل اللائحة | `academic-setup/RegulationBuilderModal.jsx` |
| | الأقسام العلمية | `academic-setup/DepartmentsView.jsx` |
| | كتالوج المقررات | `academic-setup/CourseCatalogView.jsx` |
| **أعضاء النظام** | أعضاء هيئة التدريس والمعيدون | `system-members/InstructorsDirectoryView.jsx` + نافذة `InstructorProfileModal.jsx` |
| | الموظفون والصلاحيات | `system-members/StaffAndRolesView.jsx` + نوافذ `StaffFormModal.jsx` و `RoleBuilderModal.jsx` |
| **الطلاب والدفعات** | الدفعات وقيد الطلاب | `students-cohorts/CohortsAndOnboardingView.jsx` + `StudentOnboardingModal.jsx` + `BulkExcelImportModal.jsx` |
| | تتبع الحالات الأكاديمية | `students-cohorts/AcademicStatusTrackingView.jsx` + `StudentStatusActionModal.jsx` |
| | الترقية والتشعيب | `students-cohorts/ProgressionAndBranchingView.jsx` + `DepartmentBranchingModal.jsx` |
| **عمليات الفصل الدراسي** | طرح المقررات والجدولة | `term-operations/TermOfferingsView.jsx` + `CourseOfferingModal.jsx` |
| | الأعباء التدريسية | `term-operations/TeachingLoadView.jsx` |
| | التسجيل والاستثناءات | `term-operations/RegistrationAndOverridesView.jsx` |
| **الكنترول والنتائج** | رصد درجات المحاضر | `control-grading/InstructorAssessmentLogView.jsx` (+ `CourseSelect.jsx`) |
| | محرك المعالجة والنتائج | `control-grading/GradeProcessingEngineView.jsx` |
| | التوثيق وقفل الكنترول | `control-grading/VerificationLockPublishView.jsx` |

> الكلمة اللي في الاسم: **View** = شاشة كاملة، **Modal** = نافذة منبثقة فوق الشاشة.

---

## 3) "عايزة أعدّل..." فين ألاقيه؟

| عايزة أغيّر | افتحي |
|---|---|
| لون أساسي (الأزرق الغامق `navy`، `brand`) | `js/tailwind-config.js` |
| لون/تدرّج السايدبار الأزرق | `css/styles.css` ← `.gradient-sidebar` |
| الخط (Cairo) أو لون خلفية الصفحة | `css/styles.css` ← `body` |
| شكل السكرول بار | `css/styles.css` |
| أسماء الأقسام في السايدبار أو الأيقونات | `js/config/navigation.js` ← `NAV_ITEMS` |
| أسماء التابات | `js/config/navigation.js` ← `SUB_TABS` |
| شكل السايدبار نفسه، أو الهيدر، أو رسالة التنبيه (Toast) | `js/App.jsx` ← دوّري على `<aside` أو `<header` أو `toast &&` |
| شكل شاشة معيّنة (جدول، كروت، فورم) | ملف الشاشة دي في `components/` |
| الأسماء والأرقام التجريبية (طلاب، مقررات) | `js/data/` |
| معادلات الدرجات والترقية | `js/utils/academic-rules.js` (**كلّمي المبرمج قبل ما تلمسيه**) |

---

## 4) إزاي تقري ملف شاشة (مثال حقيقي)

ده ملف `BulkExcelImportModal.jsx` مختصر، وفوق كل جزء شرحه:

```jsx
// (1) ده اسم الشاشة. الأقواس { } بتاخد "المعطيات" (props) من الـ App
function BulkExcelImportModal({ onClose, showToast }) {

    // (2) حالة (state): متغير لو اتغيّر الشاشة بتتحدّث لوحدها
    //     isUploading = القيمة الحالية، setIsUploading = دالة تغيّرها
    const [isUploading, setIsUploading] = useState(false);

    // (3) دالة بتتنفذ لما المستخدم يضغط
    const handleSimulateImport = () => { ... };

    // (4) اللي بيظهر على الشاشة. ده JSX: شبه HTML بس جوه جافاسكربت
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 ...">   {/* خلفية غامقة */}
            <div className="bg-white rounded-3xl w-full max-w-md ..."> {/* النافذة البيضا */}
                <span>رفع شيت إكسل دفعة كاملة</span>               {/* نص عادي: عدّليه */}
                <button onClick={onClose}>...</button>             {/* onClick = لما يضغط */}
                <button disabled={isUploading}>
                    {isUploading ? <span>جاري المعالجة...</span> : <span>بدء رفع الشيت</span>}
                </button>
            </div>
        </div>
    );
}
```

### الفرق بين JSX و HTML (أهم 6 نقاط)

1. بنكتب **`className`** مش `class`.
2. أي حاجة جوه **`{ }`** هي كود جافاسكربت، مش نص. مثلاً `{student.nameAr}` بيطبع اسم الطالب.
3. **`{condition && <div/>}`** معناها: اعرض الـ div لو الشرط صح.
4. **`{condition ? <A/> : <B/>}`** معناها: اعرض A لو صح، وإلا اعرض B.
5. **`{list.map(x => <tr key={x.id}>...</tr>)}`** معناها: كرّر العنصر ده لكل عنصر في القائمة (ده بيعمل صفوف الجداول).
6. كل عنصر لازم يتقفل: `<input />` و `<div></div>`.

> **قاعدة التعديل الآمن:** النصوص العربية الظاهرة والـ `className` تعدّلي فيهم براحتك. أي حاجة جوه `{ }` أو اسم متغير أو اسم دالة، اتأكدي إنك فاهماها قبل ما تلمسيها.

---

## 5) Tailwind: أهم الكلمات اللي هتقابليها

كل كلمة في `className` ليها معنى. الأكتر استخداماً في الملف:

| الكلمة | معناها |
|---|---|
| `p-4` `px-4` `py-2` | مسافة داخلية (padding): كل الجهات / أفقي / رأسي. الرقم × 4px |
| `m-2` `mt-4` `space-y-4` `gap-3` | مسافة خارجية / مسافة بين العناصر |
| `bg-white` `bg-slate-100` `bg-blue-700` | لون الخلفية |
| `text-xs` `text-sm` `text-lg` | حجم الخط |
| `font-bold` `font-extrabold` `font-black` | سُمك الخط |
| `text-slate-500` `text-white` | لون الخط |
| `rounded-xl` `rounded-3xl` `rounded-full` | تدوير الحواف |
| `border` `border-slate-200` | إطار ولونه |
| `shadow` `shadow-xl` | ظل |
| `flex` `items-center` `justify-between` | ترتيب العناصر جنب بعض ومحاذاتها |
| `grid grid-cols-3` | شبكة بـ 3 أعمدة |
| `w-full` `max-w-md` `w-64` | العرض |
| `fixed inset-0 z-50` | طبقة فوق الشاشة كلها (بتتكرر في كل النوافذ المنبثقة) |
| `hover:bg-slate-100` | تنسيق لما الماوس يعدّي فوق العنصر |
| `bg-slate-900/60` | اللون بشفافية 60% |
| `text-[11px]` | قيمة مخصصة بالظبط (11 بكسل) |

للبحث عن أي كلمة: موقع **tailwindcss.com/docs** واكتبي الكلمة في البحث.

**الألوان الخاصة بالمشروع** (في `tailwind-config.js`): `navy-800/900/950` و `brand-blue` و `brand-light`. معناها تقدري تكتبي `bg-navy-900` في أي مكان.

---

## 6) الأيقونات

الأيقونة بتتكتب كده: `<i data-lucide="x" className="w-5 h-5"></i>`. اسم الأيقونة جوه `data-lucide`. الأسماء متاحة على **lucide.dev/icons**. غيّري الاسم بس والأيقونة هتتغير. الحجم من `w-5 h-5`.

---

## 7) إزاي تشغّلي المشروع

**الملفات دي مش هتشتغل لو دبل كليك على `index.html`.** المتصفح بيمنع تحميل ملفات جانبية من الجهاز لأسباب أمان. اختاري واحدة:

**أ) Live Server (الأسهل)**
1. نزّلي VS Code، وثبّتي إضافة اسمها **Live Server**.
2. افتحي فولدر `hicit-admin` في VS Code.
3. كليك يمين على `index.html` ← **Open with Live Server**.
4. أي تعديل بتحفظيه بيظهر على طول في المتصفح.

**ب) لو معاكي Python:** افتحي الـ terminal جوه الفولدر واكتبي `python -m http.server 8000` وافتحي `http://localhost:8000`.

**ج) ملف واحد بالدبل كليك:** اكتبي `python merge.py` وهيطلع `HICIT-single-file.html` تفتحيه بالدبل كليك. (ده نسخة مدموجة، التعديل يتم دايماً في الملفات المقسّمة وبعدين تعيدي الدمج.)

**للرفع:** ارفعي الفولدر كله على أي استضافة (GitHub Pages أو Netlify أو Vercel) وهيشتغل عادي.

> **كل الأدوات بتتحمّل من الإنترنت** (Tailwind وReact وغيرهم)، فلازم النت يكون شغال.

---

## 8) لو ضفتي ملف جديد

لازم تسجّليه في `index.html` بسطر `<script type="text/babel" src="...">` **قبل** سطر `js/App.jsx`. ولو عملتي Component جديد، لازم تستدعيه في `App.jsx` مكان ما عايزاه يظهر. (مثال: دوّري على `RegulationsDirectoryView` في `App.jsx` تلاقي إزاي بيتنادى.)

---

## 9) أخطاء شائعة

| المشكلة | السبب غالباً |
|---|---|
| الصفحة بيضا خالص | غلطة في الكود. افتحي Console (زر F12 ← Console) هتلاقي اسم الملف والسطر |
| `Unexpected token` | قوس أو تاج ناقص: `</div>` أو `)` أو `}` |
| التنسيق مش بيتغير | كاتبة `class` بدل `className`، أو اسم كلمة Tailwind غلط |
| أيقونة مش ظاهرة | اسم الأيقونة غلط في `data-lucide` |
| `X is not defined` | الملف مش متسجل في `index.html`، أو اسم الـ Component مكتوب غلط |
| الداتا اتصفّرت | طبيعي: مفيش حفظ، بترجع لما تعملي Refresh |

**نصيحة:** احتفظي بنسخة من الفولدر قبل أي تعديل كبير، أو استخدمي Git.

---

## 10) ملاحظات للمصممة (UI/UX)

- **التصميم موجّه للديسكتوب أساساً.** فيه responsive جزئي: كلمات `md:` موجودة في 21 ملف (بتخلي الفورمات والكروت تتحول لعمود واحد في الشاشات الصغيرة)، وفيه بضع كلمات `lg:` و`xl:`. لكن مفيش `sm:` خالص، والسايدبار عرضه ثابت (`w-64`، وبيتقفل بزرار يدوي بس)، والجداول عريضة. تجربة الموبايل **مش متصمّمة ولا متجرّبة**، ولو مطلوبة هتحتاجي تراجعي كل شاشة.
- **اللغة:** الصفحة RTL (`dir="rtl"` في `index.html`)، والخط Cairo.
- **حالات الشاشات:** الـ Toast (رسالة النجاح) في `App.jsx`، والنوافذ كلها بتتفتح بـ `fixed inset-0`.
- **الصلاحيات (RBAC):** القائمة بتتغير حسب الـ "Persona" (بتبدّلي من الهيدر)، فلما تصمّمي لازم تفتكري إن كل دور بيشوف شاشات مختلفة. التفاصيل في `config/navigation.js` ← `TAB_ACCESS`.
