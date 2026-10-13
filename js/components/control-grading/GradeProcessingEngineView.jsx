// ---------------------------------------------------------------------
// 2. Grade processing engine (filters: level / semester / dept / course)
// ---------------------------------------------------------------------
function GradeProcessingEngineView({ courses, students, departments, regulation, studentGrades, setStudentGrades, searchQuery, showToast }) {
    const rules = getControlRules(regulation);
    const passMark = getPassMark(regulation);
    const minFinal = (rules.finalMax * rules.minFinalPercent) / 100;
    const scale = [...(regulation?.gradeScales || [])].sort((a, b) => b.minPercent - a.minPercent);

    const [filterLevel, setFilterLevel] = useState('ALL');
    const [filterSemester, setFilterSemester] = useState('Fall 2024');
    const [filterDept, setFilterDept] = useState('ALL');
    const [selectedCourseCode, setSelectedCourseCode] = useState('CS101');

    const filteredGrades = useMemo(() => {
        return studentGrades.filter(g => {
            const matchCourse = selectedCourseCode === 'ALL' || g.courseCode === selectedCourseCode;
            const matchSem = filterSemester === 'ALL' || g.semesterId === filterSemester;
            const st = students.find(s => s.id === g.studentId);
            const matchLevel = filterLevel === 'ALL' || (st && String(st.level) === String(filterLevel));
            const matchDept = filterDept === 'ALL' || (st && st.dept === filterDept);
            const matchQ = !searchQuery || g.studentName.includes(searchQuery) || g.academicId.includes(searchQuery);
            return matchCourse && matchSem && matchLevel && matchDept && matchQ;
        });
    }, [studentGrades, students, selectedCourseCode, filterSemester, filterLevel, filterDept, searchQuery]);

    const ids = useMemo(() => new Set(filteredGrades.map(g => g.id)), [filteredGrades]);
    const approvedCount = filteredGrades.filter(g => g.isApproved).length;
    const unlockedCount = filteredGrades.filter(g => !g.yearWorkLocked).length;
    const letterCounts = useMemo(() => {
        const acc = {};
        filteredGrades.filter(g => g.processed).forEach(g => { acc[g.letterGrade] = (acc[g.letterGrade] || 0) + 1; });
        return acc;
    }, [filteredGrades]);

    const handleRunGradeAggregation = () => {
        if (filteredGrades.length === 0) { showToast('لا توجد سجلات مطابقة للفلاتر الحالية.', 'error'); return; }
        if (unlockedCount > 0) { showToast(`يوجد ${unlockedCount} سجل لم يُغلق شيت أعمال السنة له بعد (من شاشة رصد المحاضر).`, 'error'); return; }
        setStudentGrades(prev => prev.map(g => {
            if (!ids.has(g.id) || g.isApproved) return g;
            const res = computeGradeResult(g, regulation);
            return { ...g, processed: true, totalMark: res.totalMark, letterGrade: res.letterGrade, points: res.points };
        }));
        showToast(`تم تشغيل محرك المعالجة وتجميع الدرجات (${rules.yearWorkMax}% أعمال سنة + ${rules.finalMax}% فاينل) وحساب التقديرات!`);
    };

    const canGrace = (g) => {
        if (!g.processed || g.isApproved || g.graceMarksApplied > 0) return false;
        const res = computeGradeResult(g, regulation);
        return res.passedFinal && res.totalMark < passMark && res.totalMark + rules.graceMarks >= passMark;
    };
    const handleApplyGraceMark = (gradeId) => {
        setStudentGrades(prev => prev.map(g => {
            if (g.id !== gradeId) return g;
            const updated = { ...g, graceMarksApplied: (g.graceMarksApplied || 0) + rules.graceMarks };
            const res = computeGradeResult(updated, regulation);
            return { ...updated, totalMark: res.totalMark, letterGrade: res.letterGrade, points: res.points };
        }));
        showToast(`تم منح الطالب ${rules.graceMarks} درجة رأفة معتمدة وتعديل التقدير للنجاح!`);
    };

    const selectCls = 'w-full bg-slate-100 border border-slate-300 rounded-xl p-2.5 focus:bg-white text-slate-800';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-extrabold text-slate-900">2. محرك المعالجة والنتائج والإنذارات (Grade Processing Engine)</h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">محرك الحسابات الآلي</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">معالجة الشيتات، تصفية البيانات حسب الفرقة والفصل والقسم، وتطبيق سلم الدرجات وقواعد الرأفة (+{rules.graceMarks}).</p>
                </div>
                <button onClick={handleRunGradeAggregation} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow transition flex items-center gap-2 shrink-0">
                    <i data-lucide="calculator" className="w-4 h-4"></i>
                    <span>تشغيل محرك المعالجة الفوري</span>
                </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-2">
                    <i data-lucide="filter" className="w-4 h-4 text-blue-700"></i>
                    <span>أدوات التصفية واختيار البيانات (Data Filters Bar):</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold">
                    <div>
                        <label className="text-slate-500 block mb-1">الفرقة / المستوى الدراسي:</label>
                        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={selectCls}>
                            <option value="ALL">جميع الفرق (Levels 1 - 4)</option>
                            {[1, 2, 3, 4].map(l => <option key={l} value={l}>{LEVEL_LABELS[l]} (Level {l})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-slate-500 block mb-1">الفصل الدراسي (Semester):</label>
                        <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className={selectCls}>
                            <option value="ALL">جميع الفصول الدراسية</option>
                            <option value="Fall 2024">فصل الخريف 2024 (Fall)</option>
                            <option value="Spring 2025">فصل الربيع 2025 (Spring)</option>
                            <option value="Summer 2025">الفصل الصيفي 2025 (Summer)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-slate-500 block mb-1">القسم العلمي (Department):</label>
                        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className={selectCls}>
                            <option value="ALL">جميع الأقسام العلمية</option>
                            {departments.map(d => <option key={d.id} value={d.code}>{d.nameAr} ({d.code})</option>)}
                            <option value="عام (General)">المستوى الأول العام</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-slate-500 block mb-1">المقرر الدراسي (Course):</label>
                        <select value={selectedCourseCode} onChange={(e) => setSelectedCourseCode(e.target.value)} className={`${selectCls} text-blue-900 font-extrabold`}>
                            <option value="ALL">جميع المقررات الدراسية</option>
                            {courses.map(c => <option key={c.id} value={c.code}>{c.code} - {c.nameAr}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="space-y-2">
                    <div className="font-extrabold text-slate-800">قواعد الكنترول المعتمدة (اللائحة {regulation?.code}):</div>
                    <div className="grid grid-cols-2 gap-3 font-semibold text-slate-700">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">توزيع الدرجات<div className="font-black text-blue-900 text-sm">{rules.yearWorkMax}% / {rules.finalMax}%</div></div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">حد النجاح الكلي<div className="font-black text-blue-900 text-sm">{passMark} من 100</div></div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">أدنى درجة بورقة الفاينل<div className="font-black text-blue-900 text-sm">{minFinal} من {rules.finalMax}</div></div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">الرأفة المسموحة<div className="font-black text-blue-900 text-sm">+{rules.graceMarks} درجة</div></div>
                    </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-900 leading-relaxed font-medium space-y-2">
                    <strong>سلم التقديرات والنقاط المعتمد:</strong>
                    <div className="flex flex-wrap gap-2">
                        {scale.map(sc => <span key={sc.grade} className="bg-white border border-blue-200 rounded-lg px-2.5 py-1 font-mono font-bold">{sc.grade} ({sc.minPercent}% - {Number(sc.points).toFixed(1)})</span>)}
                    </div>
                    {approvedCount > 0 && <p className="text-[11px] text-amber-800 font-bold">{approvedCount} سجل معتمد ومقفل لن تتأثر بإعادة المعالجة.</p>}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-700 flex-wrap gap-2">
                    <span>نتائج التجميع النهائي ({rules.yearWorkMax}% أعمال سنة + {rules.finalMax}% فاينل = 100%)</span>
                    <span className="flex items-center gap-3">
                        {Object.entries(letterCounts).map(([l, n]) => <span key={l} className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 font-mono">{l}: {n}</span>)}
                        <span className="text-blue-700 font-extrabold">عدد السجلات المطابقة للفلاتر: {filteredGrades.length} طالب</span>
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                            <tr>
                                <th className="p-3">الطالب والكود الأكاديمي</th>
                                <th className="p-3 text-center">المقرر</th>
                                <th className="p-3 text-center">أعمال السنة ({rules.yearWorkMax})</th>
                                <th className="p-3 text-center">درجة الفاينل ({rules.finalMax})</th>
                                <th className="p-3 text-center bg-blue-50">المجموع النهائي (100)</th>
                                <th className="p-3 text-center">فحص شرط الفاينل</th>
                                <th className="p-3 text-center">التقدير الحرفي</th>
                                <th className="p-3 text-center">النقاط</th>
                                <th className="p-3 text-center">قواعد الرأفة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredGrades.length === 0 && (
                                <tr><td colSpan="9" className="p-8 text-center text-slate-400 font-bold">لا توجد سجلات مطابقة للفلاتر.</td></tr>
                            )}
                            {filteredGrades.map((g) => {
                                const passedFinalThreshold = !g.isAbsent && g.finalExamMark >= minFinal;
                                return (
                                    <tr key={g.id} className="hover:bg-slate-50 transition">
                                        <td className="p-3 font-bold text-slate-900"><span>{g.studentName}</span><span className="block font-mono text-[10px] text-blue-700 font-bold">{g.academicId}</span></td>
                                        <td className="p-3 text-center font-mono font-bold text-slate-600">{g.courseCode}</td>
                                        <td className="p-3 text-center font-bold text-slate-700">{getYearWork(g)}</td>
                                        <td className="p-3 text-center font-bold text-purple-900">{g.isAbsent ? 'غائب' : g.finalExamMark}</td>
                                        <td className="p-3 text-center font-mono font-black text-blue-900 text-sm bg-blue-50">{g.processed ? g.totalMark : <span className="text-slate-300">—</span>}</td>
                                        <td className="p-3 text-center">
                                            {passedFinalThreshold
                                                ? <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">اجتاز الفاينل</span>
                                                : <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">راسب فاينل</span>}
                                        </td>
                                        <td className="p-3 text-center">
                                            {g.processed
                                                ? <span className={`px-3 py-1 rounded-lg font-mono font-black text-xs ${g.letterGrade === 'A' ? 'bg-emerald-100 text-emerald-800' : g.letterGrade === 'F' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>{g.letterGrade}</span>
                                                : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold text-slate-800">{g.processed ? Number(g.points).toFixed(1) : '—'}</td>
                                        <td className="p-3 text-center">
                                            {canGrace(g) ? (
                                                <button onClick={() => handleApplyGraceMark(g.id)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1 rounded-xl font-black text-[10px] shadow transition">+{rules.graceMarks} رأفة للنجاح</button>
                                            ) : g.graceMarksApplied > 0 ? (
                                                <span className="text-amber-700 font-bold text-[10px]">تمت الرأفة ({g.graceMarksApplied})</span>
                                            ) : <span className="text-slate-400 font-semibold">-</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
