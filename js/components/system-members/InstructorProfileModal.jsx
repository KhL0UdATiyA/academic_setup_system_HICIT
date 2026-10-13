function InstructorProfileModal({ instructor, departments, onClose, onSave, showToast }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(instructor);

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [step]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateCredentials = () => {
        showToast(`تم توليد وإرسال بيانات الدخول المباشرة إلى بريد (${formData.email || 'المحاضر'}) بنجاح!`);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
                <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
                    <div>
                        <h2 className="text-lg font-extrabold">نموذج حساب المحاضر (Instructor Profile Form / Stepper Modal)</h2>
                        <p className="text-slate-400 text-xs mt-1">إنشاء أو تعديل بيانات عضو هيئة التدريس والعبء التدريسي.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
                        <i data-lucide="x" className="w-6 h-6"></i>
                    </button>
                </div>

                <div className="bg-slate-100 border-b border-slate-200 px-8 py-3 flex items-center justify-between">
                    {[
                        { num: 1, title: 'Step 1: البيانات الشخصية والتواصل' },
                        { num: 2, title: 'Step 2: البيانات الأكاديمية والوظيفية' },
                        { num: 3, title: 'Step 3: الصلاحيات وحالة الحساب' },
                    ].map((s) => (
                        <button
                            key={s.num}
                            onClick={() => setStep(s.num)}
                            className={`flex items-center gap-2 text-xs font-bold py-1 px-3 rounded-xl transition ${
                                step === s.num
                                    ? 'bg-blue-700 text-white shadow'
                                    : step > s.num
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-extrabold">{s.num}</span>
                            <span>{s.title}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900">
                                <strong>Step 1 (Personal & Contact Info):</strong> إدخال الاسم الثلاثي/الرباعي، الرقم القومي المكون من 14 رقم، وبيانات الاتصال الجامعي.
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">الاسم بالكامل (Name - Required):</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="أ.د. / د. / م. ..."
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">الرقم القومي (National ID):</label>
                                    <input
                                        type="text"
                                        maxLength="14"
                                        placeholder="14 رقم قومي"
                                        value={formData.nationalId}
                                        onChange={(e) => handleChange('nationalId', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">تاريخ الميلاد (Date of Birth YYYY-MM-DD):</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleChange('dob', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (Phone):</label>
                                    <input
                                        type="text"
                                        placeholder="01xxxxxxxxx"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني الجامعي (Email - Required):</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="example@hicit.edu.eg"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900">
                                <strong>Step 2 (Academic & Employment Details):</strong> كود المحاضر الفريد، التخصص الأكاديمي، الرتبة، وطبيعة العقد.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">كود المحاضر (Instructor Code - Required):</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => handleChange('code', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold uppercase focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">القسم الأكاديمي (Department Code):</label>
                                    <select
                                        value={formData.dept}
                                        onChange={(e) => handleChange('dept', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white"
                                    >
                                        {departments.map(d => <option key={d.id} value={d.code}>{d.code} - {d.nameAr}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">الدرجة العلمية (Academic Title):</label>
                                    <select
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white"
                                    >
                                        <option value="أستاذ">أستاذ</option>
                                        <option value="أستاذ مساعد">أستاذ مساعد</option>
                                        <option value="مدرس">مدرس</option>
                                        <option value="مدرس مساعد">مدرس مساعد</option>
                                        <option value="معيد">معيد</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">طبيعة التعاقد (Employment Type):</label>
                                    <select
                                        value={formData.employmentType}
                                        onChange={(e) => handleChange('employmentType', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white"
                                    >
                                        <option value="FullTime">تفرغ كامل (FullTime)</option>
                                        <option value="PartTime">انتداب جزئي (PartTime)</option>
                                        <option value="Visiting">محاضر زائر (Visiting)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">تاريخ التعيين (Hire Date YYYY-MM-DD):</label>
                                    <input
                                        type="date"
                                        value={formData.hireDate}
                                        onChange={(e) => handleChange('hireDate', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">الحد الأقصى للساعات التدريسية (Max Teaching Hours):</label>
                                    <input
                                        type="number"
                                        value={formData.maxHours}
                                        onChange={(e) => handleChange('maxHours', Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-blue-800 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">مكان المكتب (Office Location):</label>
                                <input
                                    type="text"
                                    placeholder="مثال: المبنى الأكاديمي - دور 3 - مكتب 304"
                                    value={formData.office}
                                    onChange={(e) => handleChange('office', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900">
                                <strong>Step 3 (Rules & Credentials):</strong> ضبط حالة الحساب وتوليد كلمة المرور المباشرة وتصدير بيانات الدخول.
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">حالة الحساب (Account Status):</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white"
                                >
                                    <option value="Active">نشط (Active)</option>
                                    <option value="On Leave">في إجازة (On Leave)</option>
                                    <option value="Suspended">مجمّد (Suspended)</option>
                                    <option value="Resigned">مستقيل (Resigned)</option>
                                </select>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-3">
                                <i data-lucide="key-round" className="w-10 h-10 text-blue-600 mx-auto"></i>
                                <div>
                                    <h4 className="font-extrabold text-slate-900">توليد وإرسال بيانات الدخول المباشرة</h4>
                                    <p className="text-slate-500 text-[11px] mt-1">سيتم إنشاء كلمة مرور مؤقتة وتوجيهها مباشرة إلى بريد المحاضر.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGenerateCredentials}
                                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold shadow transition inline-flex items-center gap-2"
                                >
                                    <i data-lucide="send" className="w-4 h-4"></i>
                                    <span>Generate Credentials & Send Invitation</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                        >
                            السابق
                        </button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-5 py-2 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800"
                        >
                            التالي
                        </button>
                    ) : (
                        <button
                            onClick={() => onSave(formData)}
                            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow"
                        >
                            حفظ البيانات وتفعيل الحساب
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
