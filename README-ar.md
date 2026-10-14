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
├── index.html                 main file: loads all the other files in order
├── css/styles.css             custom styles (font, background, scrollbar, sidebar)
├── js/
│   ├── tailwind-config.js     project colors and fonts (navy, brand)
│   ├── 00-react-setup.js      one line: prepares useState / useEffect
│   ├── data/                  demo data (names, students, courses...)
│   │   ├── initial-data.js
│   │   ├── permissions-and-roles.js
│   │   └── demo-data.js
│   ├── utils/academic-rules.js    calculations (promotion, grades, pass mark)
│   ├── config/navigation.js       sidebar, tabs, and permissions
│   ├── App.jsx                    the app shell + connects all sections
│   ├── main.js                    last lines: starts the app
│   └── components/                the screens, grouped like the sidebar
│       ├── dashboard/
│       ├── academic-setup/
│       ├── system-members/
│       ├── students-cohorts/
│       ├── term-operations/
│       └── control-grading/
└── merge.py                   merges everything into one file (see section 7)
```

الشرح بالعربي لكل جزء:

- `index.html`: الملف الرئيسي، بيحمّل كل الملفات التانية بالترتيب.
- `css/styles.css`: تنسيقات خاصة (الخط، الخلفية، السكرول بار، السايدبار).
- `js/tailwind-config.js`: ألوان وخطوط المشروع (`navy` و`brand`).
- `js/00-react-setup.js`: سطر واحد بيجهّز `useState` و`useEffect`.
- `js/data/`: الداتا التجريبية (أسماء، طلاب، مقررات...).
- `js/utils/academic-rules.js`: دوال الحسابات (الترقية، الدرجات، النجاح).
- `js/config/navigation.js`: القائمة الجانبية والتابات والصلاحيات.
- `js/App.jsx`: الإطار العام، وبيربط كل الأقسام ببعض.
- `js/main.js`: آخر سطرين، بيشغّلوا التطبيق.
- `js/components/`: الشاشات، مقسّمة بنفس أقسام القائمة الجانبية.
- `merge.py`: أداة بتدمج كل حاجة في ملف واحد (شوفي القسم 7).

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
// (1) The screen's name. The braces { } receive "props" from App
function BulkExcelImportModal({ onClose, showToast }) {

    // (2) State: a variable. When it changes, the screen updates by itself.
    //     isUploading = current value, setIsUploading = function to change it
    const [isUploading, setIsUploading] = useState(false);

    // (3) A function that runs when the user clicks
    const handleSimulateImport = () => { /* ... */ };

    // (4) What appears on screen. This is JSX: like HTML, but inside JavaScript
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60">
            {/* dark backdrop */}
            <div className="bg-white rounded-3xl w-full max-w-md">
                {/* the white window */}
                <span>Bulk Excel Import</span>
                {/* plain text: you can edit it */}
                <button onClick={onClose}>...</button>
                {/* onClick = when clicked */}
                <button disabled={isUploading}>
                    {isUploading ? <span>Processing...</span> : <span>Start</span>}
                </button>
            </div>
        </div>
    );
}
```

الشرح بالعربي لكل رقم:

1. **اسم الشاشة:** الأقواس `{ }` بتاخد "المعطيات" (props) من الـ `App`.
2. **الحالة (state):** متغير لو اتغيّر الشاشة بتتحدّث لوحدها. `isUploading` هي القيمة الحالية، و`setIsUploading` دالة بتغيّرها.
3. **دالة** بتتنفذ لما المستخدم يضغط.
4. **اللي بيظهر على الشاشة.** ده JSX: شبه HTML بس جوه جافاسكربت.
   - `onClick` معناها: لما يضغط.
   - `className` فيه كلمات Tailwind للتنسيق.
   - النص العادي (زي `Bulk Excel Import`) تعدّلي فيه براحتك.
   - الأقواس `{ }` جوه JSX معناها إن اللي جواها كود، مش نص.

### الفرق بين JSX و HTML (أهم 6 نقاط)

الأمثلة هنا في بلوك كود واحد (بالإنجليزي، عشان العلامات متتعكسش)، وشرح كل نقطة تحته بنفس الرقم:

```jsx
// 1. className, not class
<div className="p-4">...</div>

// 2. curly braces = JavaScript code
<span>{student.nameAr}</span>

// 3. show only if the condition is true
{isOpen && <Modal />}

// 4. choose between two things
{isOpen ? <Modal /> : <Button />}

// 5. repeat for every item in a list
{students.map(s => <tr key={s.id}>...</tr>)}

// 6. every element must be closed
<input />
<div></div>
```

1. بنكتب `className` مش `class`.
2. أي حاجة جوه الأقواس المعقوصة `{ }` هي كود جافاسكربت مش نص. مثلاً `student.nameAr` بيطبع اسم الطالب.
3. شرط بـ `&&`: اعرض العنصر لو الشرط صح.
4. شرط بعلامة `?`: اعرض الأول لو صح، وإلا اعرض التاني.
5. `map`: كرّر العنصر لكل عنصر في القائمة (ده بيعمل صفوف الجداول).
6. كل عنصر لازم يتقفل: إما بتاج إغلاق منفصل، أو بعلامة الإغلاق الذاتي زي في المثال.

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

الأيقونة بتتكتب بالشكل ده:

```html
<i data-lucide="x" className="w-5 h-5"></i>
```

اسم الأيقونة جوه `data-lucide`. الأسماء متاحة على **lucide.dev/icons**. غيّري الاسم بس والأيقونة هتتغير. الحجم من `w-5 h-5`.

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

لازم تسجّليه في `index.html` بسطر بالشكل ده، **قبل** سطر `js/App.jsx`:

```html
<script type="text/babel" src="js/components/academic-setup/MyNewView.jsx"></script>
```

ولو عملتي Component جديد، لازم تستدعيه في `App.jsx` مكان ما عايزاه يظهر. (مثال: دوّري على `RegulationsDirectoryView` في `App.jsx` تلاقي إزاي بيتنادى.)

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
