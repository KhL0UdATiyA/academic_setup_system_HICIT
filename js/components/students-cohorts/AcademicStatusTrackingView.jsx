function AcademicStatusTrackingView({ students, setStudents, cohorts, departments, regulations, focus, clearFocus, searchQuery, showToast }) {
    const [filterStatus, setFilterStatus] = useState(focus ? 'NotPromoted' : 'ALL');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [levelFilter, setLevelFilter] = useState(focus ? focus.level : 'ALL');
    const activeReg = useMemo(() => (regulations || []).find(r => r.status === 'Active') || (regulations || [])[0], [regulations]);
    const rules = getProgressionRules(activeReg);

    useEffect(() => {
        if (focus) {
            setFilterStatus('NotPromoted');
            setLevelFilter(focus.level);
        }
    }, [focus]);

    const stats = useMemo(() => {
        const totalWarned = students.filter(s => s.academicStatus === 'Academic Warning').length;
        const article25Risk = students.filter(s => s.warningCount >= 3).length;
        const honors = students.filter(s => s.cgpa >= 3.50).length;
        const activeOverrides = students.filter(s => s.maxCreditOverride !== null).length;
        return { totalWarned, article25Risk, honors, activeOverrides };
    }, [students]);

    const filtered = useMemo(() => {
        return students.filter(s => {
            const matchQuery = !searchQuery || s.nameAr.includes(searchQuery) || s.academicId.includes(searchQuery);
            const matchStatus = filterStatus === 'ALL' ||
                (filterStatus === 'Warned' && s.academicStatus === 'Academic Warning') ||
                (filterStatus === 'Honors' && s.cgpa >= 3.50) ||
                (filterStatus === 'Overrides' && s.maxCreditOverride !== null) ||
                (filterStatus === 'NotPromoted' && s.level < 4 && !evaluatePromotion(s, rules).eligible);
            const matchLevel = levelFilter === 'ALL' || s.level === Number(levelFilter);
            return matchQuery && matchStatus && matchLevel;
        });
    }, [students, searchQuery, filterStatus, levelFilter, rules]);

    const handleSaveOverride = (updatedStudent) => {
        setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        showToast(`تم حفظ الاستثناء والقرارات الأكاديمية للطالب (${updatedStudent.nameAr}) بنجاح`);
        setSelectedStudent(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">تتبع الحالات الأكاديمية والاستثناءات (Status Tracking & Overrides)</h1>
                    <p className="text-slate-500 text-sm mt-1">متابعة الطلاب المحذرين (CGPA &lt; 2.00)، إنذارات مادة 25، ومنح استثناءات الساعات المعتمدة.</p>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-1">
                    <span className="text-rose-700 text-xs font-bold block">إجمالي المحذرين أكاديمياً:</span>
                    <span className="text-2xl font-black text-rose-900">{stats.totalWarned} طالب</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-1">
                    <span className="text-amber-800 text-xs font-bold block">خطر مادة 25 (3-4 إنذارات):</span>
                    <span className="text-2xl font-black text-amber-950">{stats.article25Risk} طلاب</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-1">
                    <span className="text-emerald-800 text-xs font-bold block">طلاب قائمة الشرف (CGPA &ge; 3.50):</span>
                    <span className="text-2xl font-black text-emerald-950">{stats.honors} طالب</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl space-y-1">
                    <span className="text-purple-800 text-xs font-bold block">استثناءات الساعات الممنوحة:</span>
                    <span className="text-2xl font-black text-purple-950">{stats.activeOverrides} طالب</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs font-bold">
                {[
                    { id: 'ALL', label: 'جميع الحالات' },
                    { id: 'Warned', label: 'المحذرون أكاديمياً' },
                    { id: 'Honors', label: 'قائمة الشرف' },
                    { id: 'Overrides', label: 'أصحاب الاستثناءات الممنوحة' },
                    { id: 'NotPromoted', label: 'غير المرتقين وأسباب عدم الترقية' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setFilterStatus(t.id)}
                        className={`px-4 py-2 rounded-xl transition ${
                            filterStatus === t.id ? 'bg-blue-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap bg-white p-3 rounded-2xl border border-slate-200 text-xs font-bold">
                <span className="text-slate-500">الفرقة:</span>
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 font-bold">
                    <option value="ALL">جميع الفرق</option>
                    {[1, 2, 3, 4].map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                </select>
                {focus && (
                    <span className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-xl">
                        تم الانتقال من محرك الترقية: أسباب عدم انتقال طلاب {LEVEL_LABELS[focus.level]} إلى {LEVEL_LABELS[focus.level + 1]}
                        <button onClick={() => { clearFocus(); setFilterStatus('ALL'); setLevelFilter('ALL'); }} className="mr-3 underline">إلغاء التصفية</button>
                    </span>
                )}
            </div>

            {/* Status Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <tr>
                            <th className="p-4">الكود والاسم</th>
                            <th className="p-4">الدفعة والقسم</th>
                            <th className="p-4 text-center">CGPA</th>
                            <th className="p-4 text-center">عداد الإنذارات (مادة 25)</th>
                            <th className="p-4 text-center">حد الساعات المسموح بها</th>
                            {filterStatus === 'NotPromoted' && <th className="p-4">أسباب عدم الترقية</th>}
                            <th className="p-4 text-center">إجراءات وإدارة الاستثناء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filtered.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-bold text-slate-900">
                                    <span className="font-mono text-blue-700 block text-[11px]">{s.academicId}</span>
                                    <span>{s.nameAr}</span>
                                </td>
                                <td className="p-4">
                                    <span className="font-semibold">{s.cohortName}</span>
                                    <span className="block text-[10px] text-slate-400">{s.dept}</span>
                                </td>
                                <td className="p-4 text-center font-mono font-extrabold text-slate-900 bg-slate-50">{s.cgpa}</td>
                                <td className="p-4 text-center">
                                    {s.warningCount > 0 ? (
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                            s.warningCount >= 3 ? 'bg-rose-200 text-rose-900 border border-rose-300 animate-pulse' : 'bg-amber-100 text-amber-900'
                                        }`}>
                                            إنذار {s.warningCount} من 4
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">لا يوجد</span>
                                    )}
                                </td>
                                <td className="p-4 text-center font-bold">
                                    {s.maxCreditOverride ? (
                                        <span className="bg-purple-100 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-200">
                                            {s.maxCreditOverride} ساعة (استثناء)
                                        </span>
                                    ) : (
                                        <span className="text-slate-600">{s.cgpa < 2.00 ? '12 ساعة (محذر)' : '18 ساعة (منتظم)'}</span>
                                    )}
                                </td>
                                {filterStatus === 'NotPromoted' && (
                                    <td className="p-4">
                                        <ul className="space-y-1 text-[11px] font-semibold text-rose-800">
                                            {evaluatePromotion(s, rules).reasons.map((r, i) => <li key={i}>• {r}</li>)}
                                        </ul>
                                    </td>
                                )}
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => setSelectedStudent({ ...s })}
                                        className="px-3.5 py-1.5 bg-blue-50 text-blue-800 font-bold hover:bg-blue-100 rounded-xl transition border border-blue-200"
                                    >
                                        تعديل الاستثناء والحالة
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedStudent && (
                <StudentStatusActionModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    onSave={handleSaveOverride}
                />
            )}
        </div>
    );
}
