function CourseCatalogView({ courses, setCourses, departments, regulations, showToast }) {
    const [filterDept, setFilterDept] = useState('ALL');
    const [filterRegulation, setFilterRegulation] = useState('ALL');
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const filteredCourses = useMemo(() => {
        return courses.filter(c => {
            const matchDept = filterDept === 'ALL' || c.dept === filterDept;
            const matchReg = filterRegulation === 'ALL' || c.regulationId === filterRegulation;
            const matchLevel = filterLevel === 'ALL' || c.level.toString() === filterLevel;
            return matchDept && matchReg && matchLevel;
        });
    }, [courses, filterDept, filterRegulation, filterLevel]);

    const handleAddCourse = () => {
        setEditingCourse({
            id: '',
            code: '',
            nameAr: '',
            nameEn: '',
            dept: 'CS',
            regulationId: 'REG-2023',
            level: 1,
            term: 1,
            lect: 3,
            lab: 0,
            tut: 0,
            credits: 3,
            prereq: 'لا يوجد',
            midtermMarks: 10,
            practicalMarks: 10,
            finalMarks: 60
        });
        setIsCourseModalOpen(true);
    };

    const handleEditCourse = (c) => {
        setEditingCourse({ ...c });
        setIsCourseModalOpen(true);
    };

    const handleSaveCourse = (e) => {
        e.preventDefault();
        if (courses.some(c => c.id === editingCourse.id && c.id !== '')) {
            setCourses(courses.map(c => c.id === editingCourse.id ? editingCourse : c));
            showToast('تم تحديث بيانات المقرر بنجاح');
        } else {
            const newC = { ...editingCourse, id: editingCourse.code.toUpperCase() || `CRS-${Date.now()}` };
            setCourses([...courses, newC]);
            showToast('تم تسجيل المقرر الجديد بكتالوج المعهد بنجاح');
        }
        setIsCourseModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">دليل المقررات الشامل (Global Course Catalog)</h1>
                    <p className="text-slate-500 text-sm mt-1">البنك المركزي لكافة المواد الدراسية والساعات وتوزيع الدرجات والمتطلبات المسبقة بالمعهد.</p>
                </div>
                <button
                    onClick={handleAddCourse}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition flex items-center gap-2"
                >
                    <i data-lucide="plus-circle" className="w-4 h-4"></i>
                    <span>إضافة مقرر جديد لكتالوج المعهد</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-5 text-xs font-bold">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">التصفية حسب القسم:</span>
                    <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5">
                        <option value="ALL">جميع الأقسام (CS, IS, IT, BS)</option>
                        {departments.map(d => <option key={d.id} value={d.code}>{d.code} - {d.nameAr}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-slate-500">التصفية حسب اللائحة:</span>
                    <select value={filterRegulation} onChange={(e) => setFilterRegulation(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5">
                        <option value="ALL">جميع اللوائح (REG-2023, REG-2025)</option>
                        {regulations.map(r => <option key={r.id} value={r.code}>{r.code}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-slate-500">المستوى الدراسي:</span>
                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5">
                        <option value="ALL">جميع المستويات (L1-L4)</option>
                        <option value="1">الفرقة الأولى (Level 1)</option>
                        <option value="2">الفرقة الثانية (Level 2)</option>
                        <option value="3">الفرقة الثالثة (Level 3)</option>
                        <option value="4">الفرقة الرابعة (Level 4)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <tr>
                            <th className="p-4">كود المقرر (Course Code)</th>
                            <th className="p-4">اسم المقرر (Course Name)</th>
                            <th className="p-4">القسم واللائحة</th>
                            <th className="p-4">المستوى والترم</th>
                            <th className="p-4 text-center">الساعات الأسبوعية (محاضرة/معمل/تمارين)</th>
                            <th className="p-4 text-center">الساعات المعتمدة (Credits)</th>
                            <th className="p-4 text-center">توزيع الدرجات (100)</th>
                            <th className="p-4">المتطلب السابق (Prerequisites)</th>
                            <th className="p-4 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredCourses.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-mono font-bold text-blue-700">{c.code}</td>
                                <td className="p-4 font-bold text-slate-900">
                                    <div>{c.nameAr}</div>
                                    <div className="text-[10px] text-slate-400 font-mono font-normal">{c.nameEn}</div>
                                </td>
                                <td className="p-4">
                                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded font-bold">
                                        {c.dept}
                                    </span>
                                    <span className="text-[10px] text-slate-400 mr-2">({c.regulationId})</span>
                                </td>
                                <td className="p-4 font-bold text-slate-700">
                                    الفرقة {c.level} - Term {c.term}
                                </td>
                                <td className="p-4 text-center font-mono text-slate-600 bg-slate-50/50">
                                    {c.lect}م / {c.lab}مع / {c.tut}ت
                                </td>
                                <td className="p-4 text-center font-bold text-emerald-700 bg-emerald-50/40">{c.credits} hrs</td>
                                <td className="p-4 text-center font-mono text-[11px]">
                                    {c.midtermMarks} ميدتيرم / {c.practicalMarks} عملي / {c.finalMarks} فاينل
                                </td>
                                <td className="p-4 text-slate-600 font-semibold">{c.prereq}</td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleEditCourse(c)}
                                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg"
                                        title="تعديل المقرر"
                                    >
                                        <i data-lucide="edit-2" className="w-4 h-4"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isCourseModalOpen && editingCourse && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <form onSubmit={handleSaveCourse} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
                        <div className="p-5 bg-slate-900 text-white font-bold flex items-center justify-between">
                            <span>{editingCourse.id ? 'استمارة تعديل مقرر دراسي' : 'نموذج إدخال مقرر دراسي جديد (Course Definition Form)'}</span>
                            <button type="button" onClick={() => setIsCourseModalOpen(false)}><i data-lucide="x" className="w-5 h-5"></i></button>
                        </div>
                        <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">كود المقرر (Course Code - مثال CS101):</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingCourse.code}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value.toUpperCase() })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 font-bold uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">القسم الأكاديمي المباشر (Dept):</label>
                                    <select
                                        value={editingCourse.dept}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, dept: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
                                    >
                                        {departments.map(d => <option key={d.id} value={d.code}>{d.code} - {d.nameAr}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">اسم المقرر بالعربية:</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingCourse.nameAr}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, nameAr: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">اسم المقرر بالإنجليزية:</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingCourse.nameEn}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, nameEn: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">اللائحة التابع لها المقرر (Regulation ID):</label>
                                    <select
                                        value={editingCourse.regulationId}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, regulationId: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
                                    >
                                        {regulations.map(r => <option key={r.id} value={r.code}>{r.code} ({r.title})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">المستوى والتيرم الدراسي (Study Year & Semester):</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={editingCourse.level}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, level: Number(e.target.value) })}
                                            className="border border-slate-300 rounded-xl p-2.5 font-bold"
                                        >
                                            <option value={1}>الفرقة الأولى</option>
                                            <option value={2}>الفرقة الثانية</option>
                                            <option value={3}>الفرقة الثالثة</option>
                                            <option value={4}>الفرقة الرابعة</option>
                                        </select>
                                        <select
                                            value={editingCourse.term}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, term: Number(e.target.value) })}
                                            className="border border-slate-300 rounded-xl p-2.5 font-bold"
                                        >
                                            <option value={1}>الترم الأول</option>
                                            <option value={2}>الترم الثاني</option>
                                            <option value={3}>الترم الصيفي</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                <label className="block font-extrabold text-slate-800">تفاصيل الساعات الأسبوعية المعتمدة (Hours Breakdown):</label>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">ساعات المحاضرة:</span>
                                        <input
                                            type="number"
                                            value={editingCourse.lect}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, lect: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg p-2 text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">ساعات المعمل/العملي:</span>
                                        <input
                                            type="number"
                                            value={editingCourse.lab}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, lab: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg p-2 text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">ساعات التمارين:</span>
                                        <input
                                            type="number"
                                            value={editingCourse.tut}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, tut: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg p-2 text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">الساعات المعتمدة:</span>
                                        <input
                                            type="number"
                                            value={editingCourse.credits}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, credits: Number(e.target.value) })}
                                            className="w-full border border-emerald-400 bg-emerald-50 text-emerald-800 rounded-lg p-2 text-center font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block font-extrabold text-slate-800">توزيع درجات المادة (Grading & Weight Distribution):</label>
                                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                        الإجمالي = {editingCourse.midtermMarks + editingCourse.practicalMarks + editingCourse.finalMarks + 20} درجة (شامل 20 للحضور والتكليفات)
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">درجة أعمال السنة / الميدتيرم:</span>
                                        <input
                                            type="number"
                                            value={editingCourse.midtermMarks}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, midtermMarks: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg p-2 text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">درجة العملي / الشفوي:</span>
                                        <input
                                            type="number"
                                            value={editingCourse.practicalMarks}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, practicalMarks: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg p-2 text-center font-bold"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-slate-500 block">درجة الامتحان النهائي:</span>
                                        <input
                                            type="number"
                                            value={editingCourse.finalMarks}
                                            onChange={(e) => setEditingCourse({ ...editingCourse, finalMarks: Number(e.target.value) })}
                                            className="w-full border border-slate-300 rounded-lg p-2 text-center font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">المتطلب السابق (Prerequisites Requirement):</label>
                                <select
                                    value={editingCourse.prereq}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, prereq: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
                                >
                                    <option value="لا يوجد">لا يوجد متطلب سابق</option>
                                    {courses.map(c => <option key={c.id} value={c.code}>{c.code} - {c.nameAr}</option>)}
                                    <option value="اجتياز 28 ساعة معتمدة">اجتياز 28 ساعة معتمدة</option>
                                    <option value="اجتياز 90 ساعة معتمدة">اجتياز 90 ساعة معتمدة</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-100 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold">إلغاء</button>
                            <button type="submit" className="px-5 py-2 rounded-xl bg-blue-700 text-white font-bold">حفظ بيانات المقرر</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
