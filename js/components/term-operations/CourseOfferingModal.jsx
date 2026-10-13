// =====================================================================
// COURSE OFFERING MODAL (Lecture by faculty, Sections/Labs by TAs)
// =====================================================================
const KIND_META = {
    lecture: { label: 'محاضرة', badge: 'bg-blue-100 text-blue-900 border-blue-200', who: 'عضو هيئة تدريس' },
    section: { label: 'سكشن', badge: 'bg-emerald-100 text-emerald-900 border-emerald-200', who: 'مدرس مساعد / معيد' },
    lab: { label: 'معمل', badge: 'bg-purple-100 text-purple-900 border-purple-200', who: 'مدرس مساعد / معيد' },
};

const daysOverlap = (a, b) => {
    const A = (a || '').split('/').map(x => x.trim()).filter(Boolean);
    const B = (b || '').split('/').map(x => x.trim()).filter(Boolean);
    return A.some(d => B.includes(d));
};

function CourseOfferingModal({ activeSemester, courses, instructors, initialOffering, onClose, onSave }) {
    const faculty = instructors.filter(i => FACULTY_TITLES.includes(i.title));
    const assistants = instructors.filter(i => ASSISTANT_TITLES.includes(i.title));

    const [selectedCourseCode, setSelectedCourseCode] = useState(initialOffering ? initialOffering.courseCode : courses[0]?.code || '');
    const selectedCourseObj = courses.find(c => c.code === selectedCourseCode);

    const [sections, setSections] = useState(() => {
        if (initialOffering) {
            return initialOffering.sections.map(s => {
                // normalise legacy records (old "type" strings) into the simplified kind/label model
                if (s.kind) return { ...s };
                const kind = /Lab/.test(s.type) ? 'lab' : /Lecture/.test(s.type) ? 'lecture' : 'section';
                return { ...s, kind, label: KIND_META[kind].label, practicalMarks: s.practicalMarks || 0 };
            });
        }
        return [{ id: 'LEC', kind: 'lecture', label: 'محاضرة', instructorId: faculty[0]?.id || '', days: 'الأحد / الثلاثاء', time: '09:00 - 10:30', room: 'مدرج 1', capacity: 100, enrolled: 0, practicalMarks: 0 }];
    });
    const [errors, setErrors] = useState([]);

    const renumber = (list) => {
        const counters = { section: 0, lab: 0 };
        return list.map(s => {
            if (s.kind === 'lecture') return { ...s, label: 'محاضرة' };
            counters[s.kind] += 1;
            return { ...s, label: `${KIND_META[s.kind].label} ${counters[s.kind]}`, id: `${s.kind === 'lab' ? 'LAB' : 'SEC'}-${counters[s.kind]}` };
        });
    };

    const addSection = (kind) => {
        const ta = assistants[0]?.id || '';
        const isLab = kind === 'lab';
        const newSec = {
            id: `NEW-${Date.now()}`, kind, label: '', instructorId: ta,
            days: isLab ? 'الأربعاء' : 'الإثنين', time: isLab ? '11:00 - 01:00' : '11:00 - 12:30',
            room: isLab ? 'معمل حاسب 1' : 'قاعة 101', capacity: isLab ? 30 : 35, enrolled: 0,
            practicalMarks: isLab ? (selectedCourseObj?.practicalMarks || 0) : 0
        };
        setSections(renumber([...sections, newSec]));
    };
    const updateSection = (index, field, value) => {
        setSections(sections.map((s, i) => i === index ? { ...s, [field]: (field === 'capacity' || field === 'practicalMarks') ? Number(value) : value } : s));
    };
    const removeSection = (index) => setSections(renumber(sections.filter((_, i) => i !== index)));

    const validate = () => {
        const errs = [];
        const lecture = sections.find(s => s.kind === 'lecture');
        if (!lecture || !lecture.instructorId) errs.push('يجب تحديد أستاذ المادة (عضو هيئة تدريس) للمحاضرة.');
        sections.forEach(s => {
            if (!s.instructorId) errs.push(`حدد المحاضر / المعيد المسؤول عن (${s.label}).`);
            if (!s.days.trim() || !s.time.trim() || !s.room.trim()) errs.push(`أكمل الموعد والقاعة الخاصة بـ (${s.label}).`);
            if (s.kind !== 'lecture' && s.practicalMarks > (selectedCourseObj?.practicalMarks || 0)) errs.push(`درجة العملي في (${s.label}) تتجاوز الحد الأقصى للمقرر (${selectedCourseObj?.practicalMarks}).`);
        });
        for (let i = 0; i < sections.length; i++) {
            for (let j = i + 1; j < sections.length; j++) {
                const a = sections[i], b = sections[j];
                if (a.time.trim() === b.time.trim() && daysOverlap(a.days, b.days)) {
                    if (a.room.trim() === b.room.trim()) errs.push(`تعارض قاعة: (${a.label}) و (${b.label}) في نفس القاعة والوقت.`);
                    if (a.instructorId && a.instructorId === b.instructorId) errs.push(`تعارض مواعيد: نفس المحاضر مسند لـ (${a.label}) و (${b.label}) في نفس الوقت.`);
                }
            }
        }
        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const totalCap = sections.reduce((a, s) => a + s.capacity, 0);
        const totalEnrolled = sections.reduce((a, s) => a + s.enrolled, 0);
        onSave({
            id: initialOffering ? initialOffering.id : `OFF-${selectedCourseCode}-${activeSemester.replace(' ', '')}`,
            courseCode: selectedCourseCode,
            semesterId: activeSemester,
            academicYear: '2024/2025',
            status: totalCap > 0 && totalEnrolled >= totalCap ? 'Closed' : 'Open',
            sections
        });
    };

    const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6">
                <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-extrabold">استمارة طرح مقرر بالجدول الدراسي</h3>
                        <p className="text-[11px] text-slate-400">أستاذ المادة للمحاضرة - والمعيدون / المدرسون المساعدون للسكاشن والمعامل مع المواعيد والقاعات ودرجات العملي.</p>
                    </div>
                    <button type="button" onClick={onClose} title="إغلاق" className="p-1.5 rounded-lg hover:bg-white/10"><i data-lucide="x" className="w-5 h-5"></i></button>
                </div>

                <div className="p-6 space-y-5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block font-bold mb-1">المقرر (من كتالوج المقررات)</label>
                            <select
                                value={selectedCourseCode}
                                disabled={!!initialOffering}
                                onChange={(e) => setSelectedCourseCode(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold disabled:bg-slate-100"
                            >
                                {courses.map(c => <option key={c.id} value={c.code}>{c.code} - {c.nameAr} ({c.dept} - {c.credits} ساعات)</option>)}
                            </select>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 font-bold text-blue-900 text-[11px] leading-relaxed">
                            {selectedCourseObj ? `${LEVEL_LABELS[selectedCourseObj.level]} · محاضرة ${selectedCourseObj.lect}س / معمل ${selectedCourseObj.lab}س / سكشن ${selectedCourseObj.tut}س · عملي ${selectedCourseObj.practicalMarks} درجة` : ''}
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 space-y-1 font-bold">
                            {errors.map((er, i) => <div key={i}>• {er}</div>)}
                        </div>
                    )}

                    <div className="space-y-3">
                        {sections.map((sec, idx) => {
                            const options = sec.kind === 'lecture' ? faculty : assistants;
                            return (
                                <div key={sec.id + idx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-lg border text-[11px] font-extrabold ${KIND_META[sec.kind].badge}`}>{sec.label}</span>
                                            <span className="text-[10px] text-slate-500 font-bold">يُسند إلى: {KIND_META[sec.kind].who}</span>
                                        </div>
                                        {sec.kind !== 'lecture' && (
                                            <button type="button" onClick={() => removeSection(idx)} className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg" title="حذف"><i data-lucide="trash-2" className="w-4 h-4"></i></button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">{sec.kind === 'lecture' ? 'أستاذ المادة' : 'المعيد / المدرس المساعد'}</label>
                                            <select value={sec.instructorId} onChange={e => updateSection(idx, 'instructorId', e.target.value)} className={inputCls}>
                                                <option value="">— اختر —</option>
                                                {options.map(ins => <option key={ins.id} value={ins.id}>{ins.name} ({ins.title})</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">الأيام</label>
                                            <input value={sec.days} onChange={e => updateSection(idx, 'days', e.target.value)} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">التوقيت</label>
                                            <input value={sec.time} onChange={e => updateSection(idx, 'time', e.target.value)} className={`${inputCls} font-mono`} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">القاعة / المعمل</label>
                                            <input value={sec.room} onChange={e => updateSection(idx, 'room', e.target.value)} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">السعة</label>
                                            <input type="number" min="1" value={sec.capacity} onChange={e => updateSection(idx, 'capacity', e.target.value)} className={inputCls} />
                                        </div>
                                        {sec.kind !== 'lecture' && (
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-500 mb-1">درجة العملي التي يرصدها ({sec.label}) - الحد الأقصى {selectedCourseObj?.practicalMarks}</label>
                                                <input type="number" min="0" max={selectedCourseObj?.practicalMarks || 100} value={sec.practicalMarks} onChange={e => updateSection(idx, 'practicalMarks', e.target.value)} className={inputCls} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-2">
                        <button type="button" onClick={() => addSection('section')} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold hover:bg-emerald-100">+ إضافة سكشن</button>
                        <button type="button" onClick={() => addSection('lab')} className="px-4 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-extrabold hover:bg-purple-100">+ إضافة معمل</button>
                    </div>
                </div>

                <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50">إلغاء</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold shadow-md">حفظ الطرح والجدول</button>
                </div>
            </form>
        </div>
    );
}
