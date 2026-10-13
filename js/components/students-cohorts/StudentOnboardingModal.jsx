function StudentOnboardingModal({ cohorts, regulations, departments, instructors, onClose, onSave }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        id: `STD-${Date.now().toString().slice(-6)}`,
        academicId: `${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        nationalId: '',
        nameAr: '',
        nameEn: '',
        cohortId: 'COH-2024',
        cohortName: 'دفعة 2024',
        dept: 'عام (General)',
        level: 1,
        passedCredits: 0,
        cgpa: 0.00,
        academicStatus: 'Regular',
        warningCount: 0,
        advisorName: instructors[0]?.name || '',
        regType: 'مستجد',
        highSchoolGrade: 80.0,
        phone: '',
        email: '',
        choices: { choice1: 'CS', choice2: 'IS', choice3: 'IT' },
        cs101Grade: 'N/A'
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
                <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
                    <div>
                        <h2 className="text-lg font-extrabold">نموذج قبول وتسجيل طالب جديد (Student Onboarding Stepper Wizard)</h2>
                        <p className="text-slate-400 text-xs mt-1">إدخال البيانات الأساسية، التعيين الأكاديمي، المرشد والمستوى.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
                        <i data-lucide="x" className="w-6 h-6"></i>
                    </button>
                </div>

                <div className="bg-slate-100 border-b border-slate-200 px-8 py-3 flex items-center justify-between">
                    {[
                        { num: 1, title: 'Step 1: البيانات الشخصية والاتصال' },
                        { num: 2, title: 'Step 2: البيانات الأكاديمية والقبول' },
                        { num: 3, title: 'Step 3: التوجيه والإرشاد الأكاديمي' },
                    ].map((s) => (
                        <button
                            key={s.num}
                            onClick={() => setStep(s.num)}
                            className={`flex items-center gap-2 text-xs font-bold py-1 px-3 rounded-xl transition ${
                                step === s.num ? 'bg-blue-700 text-white shadow' : 'text-slate-500 hover:bg-slate-200'
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">اسم الطالب بالعربية (Required):</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nameAr}
                                        onChange={(e) => handleChange('nameAr', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">اسم الطالب بالإنجليزية:</label>
                                    <input
                                        type="text"
                                        value={formData.nameEn}
                                        onChange={(e) => handleChange('nameEn', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">الرقم القومي (14 رقم):</label>
                                    <input
                                        type="text"
                                        maxLength="14"
                                        value={formData.nationalId}
                                        onChange={(e) => handleChange('nationalId', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">رقم الهاتف التواصل:</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">البريد الإلكتروني الجامعي:</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">الرقم الجامعي (Academic ID):</label>
                                    <input
                                        type="text"
                                        value={formData.academicId}
                                        onChange={(e) => handleChange('academicId', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-blue-700"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">الدفعة التابع لها:</label>
                                    <select
                                        value={formData.cohortId}
                                        onChange={(e) => handleChange('cohortId', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                                    >
                                        {cohorts.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">نوع القبول:</label>
                                    <select
                                        value={formData.regType}
                                        onChange={(e) => handleChange('regType', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                                    >
                                        <option value="مستجد">مستجد (New Enrollment)</option>
                                        <option value="تحويل خارجي">تحويل خارجي (Transferred)</option>
                                        <option value="إعادة قيد">إعادة قيد (Re-registered)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">مجموع الثانوية العامة (%):</label>
                                    <input
                                        type="number"
                                        value={formData.highSchoolGrade}
                                        onChange={(e) => handleChange('highSchoolGrade', Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-1">القسم المبدئي المخصص:</label>
                                <select
                                    value={formData.dept}
                                    onChange={(e) => handleChange('dept', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                                >
                                    <option value="عام (General)">عام (General Level 1)</option>
                                    {departments.map(d => <option key={d.id} value={d.code}>{d.code} - {d.nameAr}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">تعيين المرشد الأكاديمي (Assigned Academic Advisor):</label>
                                <select
                                    value={formData.advisorName}
                                    onChange={(e) => handleChange('advisorName', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                                >
                                    {instructors.map(ins => <option key={ins.id} value={ins.name}>{ins.name} ({ins.dept})</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold">السابق</button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button onClick={() => setStep(step + 1)} className="px-5 py-2 rounded-xl bg-blue-700 text-white font-bold">التالي</button>
                    ) : (
                        <button onClick={() => onSave(formData)} className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold">حفظ الطالب وتسجيله</button>
                    )}
                </div>
            </div>
        </div>
    );
}
