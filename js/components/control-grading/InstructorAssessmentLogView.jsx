const RESET_RESULT = { processed: false, totalMark: null, letterGrade: null, points: null };

// ---------------------------------------------------------------------
// 1. Instructor assessment log (year-work 40)
// ---------------------------------------------------------------------
function InstructorAssessmentLogView({ courses, regulation, studentGrades, setStudentGrades, searchQuery, showToast }) {
    const rules = getControlRules(regulation);
    const [selCode, setSelectedCourseCode] = useState('CS101');
    const selectedCourseCode = courses.some(c => c.code === selCode) ? selCode : (courses[0]?.code || '');
    const [assessmentTab, setAssessmentTab] = useState('sheet'); // sheet | weekly | summary

    const currentCourseGrades = useMemo(() => studentGrades.filter(g => g.courseCode === selectedCourseCode), [studentGrades, selectedCourseCode]);
    const currentCourseObj = courses.find(c => c.code === selectedCourseCode);
    const midMax = (currentCourseObj?.midtermMarks ?? 10) + (currentCourseObj?.practicalMarks ?? 10);
    const isLocked = currentCourseGrades.length > 0 && currentCourseGrades.every(g => g.yearWorkLocked);

    const visibleGrades = useMemo(() => {
        if (!searchQuery) return currentCourseGrades;
        return currentCourseGrades.filter(g => g.studentName.includes(searchQuery) || g.academicId.includes(searchQuery));
    }, [currentCourseGrades, searchQuery]);

    const handleUpdateGrade = (gradeId, field, value) => {
        if (isLocked) { showToast('شيت أعمال السنة لهذه المادة مغلق وممرر للكنترول، لا يمكن التعديل إلا بإذن إداري!', 'error'); return; }
        const numVal = Math.max(0, Number(value));
        const maxByField = { attendanceMarks: ATTENDANCE_MAX, taskMarks: TASKS_MAX, midtermMarks: midMax };
        const labels = { attendanceMarks: 'درجة الحضور العمومي', taskMarks: 'درجة التكليفات', midtermMarks: 'درجة الميدتيرم/العملي' };
        if (numVal > maxByField[field]) {
            showToast(`تنبيه: ${labels[field]} لا يجب أن تتجاوز ${maxByField[field]} درجة!`, 'error');
            return;
        }
        setStudentGrades(prev => prev.map(g => g.id === gradeId ? { ...g, [field]: numVal, ...RESET_RESULT } : g));
    };

    const handleToggleWeeklyLog = (gradeId, weekKey) => {
        if (isLocked) { showToast('سجل الحضور مغلق بعد تمرير الشيت للكنترول.', 'error'); return; }
        setStudentGrades(prev => prev.map(g => {
            if (g.id !== gradeId) return g;
            const cur = (g.weeklyLogs && g.weeklyLogs[weekKey]) || 'P';
            const next = cur === 'P' ? 'A' : cur === 'A' ? 'L' : 'P';
            const logs = { ...(g.weeklyLogs || {}), [weekKey]: next };
            return { ...g, weeklyLogs: logs, attendanceMarks: attendanceMarksFromLogs(logs), ...RESET_RESULT };
        }));
    };

    const handleLockYearWork = () => {
        setStudentGrades(prev => prev.map(g => g.courseCode === selectedCourseCode ? { ...g, yearWorkLocked: true } : g));
        showToast(`تم إغلاق وتجميد شيت أعمال السنة للمادة (${selectedCourseCode}) بنسبة ${rules.yearWorkMax}% وتمريره رسمياً للكنترول!`);
    };

    const summaries = useMemo(() => currentCourseGrades.map(g => ({ g, s: summarizeLogs(g.weeklyLogs) })), [currentCourseGrades]);
    const weekly = WEEK_KEYS.map(w => {
        const vals = currentCourseGrades.map(g => (g.weeklyLogs && g.weeklyLogs[w]) || 'P');
        return { key: w, present: vals.filter(v => v === 'P').length, late: vals.filter(v => v === 'L').length, absent: vals.filter(v => v === 'A').length };
    });
    const avgAttendance = summaries.length ? Math.round(summaries.reduce((a, x) => a + x.s.percent, 0) / summaries.length) : 0;
    const totalAbsences = summaries.reduce((a, x) => a + x.s.absent, 0);
    const atRisk = summaries.filter(x => x.s.absencePercent >= rules.absenceLimitPercent).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-extrabold text-slate-900">1. شاشة رصد درجات المحاضر ({rules.yearWorkMax}% أعمال سنة)</h1>
                        {isLocked ? (
                            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><i data-lucide="lock" className="w-3.5 h-3.5"></i>شيت أعمال السنة مغلق وممرر للكنترول</span>
                        ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><i data-lucide="edit" className="w-3.5 h-3.5"></i>مفتوح لرصد المحاضر</span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm mt-1">رصد الحضور العمومي، التكليفات، ودرجات الميدتيرم/العملي (إجمالي {rules.yearWorkMax} درجة) قبل تمرير المادة للكنترول للفاينل ({rules.finalMax} درجة).</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">المقرر:</span>
                        <CourseSelect courses={courses} value={selectedCourseCode} onChange={setSelectedCourseCode} />
                    </div>
                    <button
                        onClick={handleLockYearWork}
                        disabled={isLocked || currentCourseGrades.length === 0}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow transition flex items-center gap-2 ${isLocked || currentCourseGrades.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
                    >
                        <i data-lucide="lock" className="w-4 h-4"></i>
                        <span>اعتماد وقفل شيت {rules.yearWorkMax}% أعمال السنة</span>
                    </button>
                </div>
            </div>

            <div className="bg-blue-900 text-white p-5 rounded-2xl shadow flex items-center justify-between text-xs gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <i data-lucide="calculator" className="w-6 h-6 text-blue-300"></i>
                    <div>
                        <h4 className="font-extrabold text-sm">توزيع الدرجات المعتمد باللائحة لمادة ({selectedCourseCode})</h4>
                        <p className="text-blue-200 text-[11px]">{rules.yearWorkMax}% أعمال سنة ({ATTENDANCE_MAX} حضور عمومي + {TASKS_MAX} تكليفات + {midMax} ميدتيرم/عملي) | {rules.finalMax}% الامتحان النهائي (Final Exam)</p>
                    </div>
                </div>
                <span className="bg-white/10 text-white px-3 py-1 rounded-lg font-mono font-bold">100 درجة كلية</span>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs font-bold flex-wrap">
                {[
                    { id: 'sheet', label: 'شيت رصد الدرجات' },
                    { id: 'weekly', label: 'رصد الحضور الأسبوعي' },
                    { id: 'summary', label: 'ملخص الحضور والغياب العام' },
                ].map(t => (
                    <button key={t.id} onClick={() => setAssessmentTab(t.id)} className={`px-4 py-2 rounded-xl transition ${assessmentTab === t.id ? 'bg-blue-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>{t.label}</button>
                ))}
            </div>

            {currentCourseGrades.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 font-bold">لا توجد سجلات طلاب لهذا المقرر بعد.</div>
            )}

            {currentCourseGrades.length > 0 && assessmentTab === 'sheet' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                                <tr>
                                    <th className="p-3">الكود الأكاديمي والاسم</th>
                                    <th className="p-3 text-center">الحضور العمومي ({ATTENDANCE_MAX})</th>
                                    <th className="p-3 text-center">التكليفات والمهام ({TASKS_MAX})</th>
                                    <th className="p-3 text-center">الميدتيرم والعملي ({midMax})</th>
                                    <th className="p-3 text-center bg-blue-50/80">مجموع أعمال السنة ({rules.yearWorkMax}%)</th>
                                    <th className="p-3 text-center">حالة الاعتماد</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {visibleGrades.map((g) => (
                                    <tr key={g.id} className="hover:bg-slate-50 transition">
                                        <td className="p-3 font-bold text-slate-900">
                                            <span className="font-mono text-blue-700 block text-[11px]">{g.academicId}</span>
                                            <span>{g.studentName}</span>
                                        </td>
                                        {[['attendanceMarks', ATTENDANCE_MAX], ['taskMarks', TASKS_MAX], ['midtermMarks', midMax]].map(([field, max]) => (
                                            <td key={field} className="p-3 text-center">
                                                <input
                                                    type="number" min="0" max={max} disabled={isLocked} value={g[field]}
                                                    onChange={(e) => handleUpdateGrade(g.id, field, e.target.value)}
                                                    className={`w-20 bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-center focus:bg-white disabled:bg-slate-100 ${field === 'midtermMarks' ? 'text-blue-800' : ''}`}
                                                />
                                            </td>
                                        ))}
                                        <td className="p-3 text-center bg-blue-50/50 font-mono font-black text-blue-900 text-sm">{getYearWork(g)} / {rules.yearWorkMax}</td>
                                        <td className="p-3 text-center">
                                            {g.yearWorkLocked
                                                ? <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold">مُعتمد ومقفل</span>
                                                : <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">قيد الرصد</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {currentCourseGrades.length > 0 && assessmentTab === 'weekly' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-4">
                    <div className="text-xs font-bold text-slate-700">سجل الحضور والغياب الأسبوعي (انقر للتنقل: حاضر P ← غائب A ← متأخر L). كل تعديل يحدّث درجة الحضور العمومي آلياً (P=1، L=½، A=0).</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                                <tr>
                                    <th className="p-3">اسم الطالب</th>
                                    {WEEK_KEYS.map((w, i) => <th key={w} className="p-3 text-center">أ{i + 1}</th>)}
                                    <th className="p-3 text-center">حاضر / غائب / متأخر</th>
                                    <th className="p-3 text-center">درجة الحضور</th>
                                    <th className="p-3 text-center">التنبيه</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {visibleGrades.map((g) => {
                                    const s = summarizeLogs(g.weeklyLogs);
                                    return (
                                        <tr key={g.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-bold text-slate-900">{g.studentName}</td>
                                            {WEEK_KEYS.map((wKey) => {
                                                const status = (g.weeklyLogs && g.weeklyLogs[wKey]) || 'P';
                                                return (
                                                    <td key={wKey} className="p-2 text-center">
                                                        <button
                                                            disabled={isLocked} onClick={() => handleToggleWeeklyLog(g.id, wKey)}
                                                            className={`w-8 h-8 rounded-lg font-mono font-extrabold text-xs transition ${
                                                                status === 'P' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                                                status === 'A' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                                                'bg-amber-100 text-amber-800 border border-amber-300'
                                                            } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                        >{status}</button>
                                                    </td>
                                                );
                                            })}
                                            <td className="p-3 text-center font-mono font-bold"><span className="text-emerald-700">{s.present}</span> / <span className="text-rose-700">{s.absent}</span> / <span className="text-amber-700">{s.late}</span></td>
                                            <td className="p-3 text-center font-mono font-extrabold text-blue-800">{g.attendanceMarks} / {ATTENDANCE_MAX}</td>
                                            <td className="p-3 text-center">
                                                {s.absencePercent >= rules.absenceLimitPercent
                                                    ? <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full font-bold text-[10px]">⚠️ إنذار غياب ({s.absent} أسابيع)</span>
                                                    : <span className="text-emerald-700 font-bold text-[10px]">حضور منتظم</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {currentCourseGrades.length > 0 && assessmentTab === 'summary' && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1"><span className="text-xs font-bold text-slate-400 block">متوسط نسبة الحضور العامة:</span><span className="text-2xl font-black text-blue-900">{avgAttendance}%</span></div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1"><span className="text-xs font-bold text-slate-400 block">إجمالي حالات الغياب:</span><span className="text-2xl font-black text-rose-700">{totalAbsences} غياب</span></div>
                        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-1"><span className="text-xs font-bold text-rose-800 block">معرضون للحرمان (غياب ≥ {rules.absenceLimitPercent}%):</span><span className="text-2xl font-black text-rose-900">{atRisk} طالب</span></div>
                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-1"><span className="text-xs font-bold text-emerald-800 block">عدد أسابيع الرصد:</span><span className="text-2xl font-black text-emerald-900">{WEEK_KEYS.length} أسابيع</span></div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                        <h3 className="font-extrabold text-slate-900 text-sm">الحضور والغياب العام لكل أسبوع (على مستوى المقرر)</h3>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                            {weekly.map((w, i) => {
                                const total = w.present + w.late + w.absent || 1;
                                return (
                                    <div key={w.key} className="border border-slate-200 rounded-xl p-3 text-center space-y-2">
                                        <div className="text-[11px] font-bold text-slate-500">الأسبوع {i + 1}</div>
                                        <div className="w-full h-16 bg-slate-100 rounded-lg overflow-hidden flex flex-col-reverse">
                                            <div className="bg-emerald-500" style={{ height: `${(w.present / total) * 100}%` }}></div>
                                            <div className="bg-amber-400" style={{ height: `${(w.late / total) * 100}%` }}></div>
                                            <div className="bg-rose-500" style={{ height: `${(w.absent / total) * 100}%` }}></div>
                                        </div>
                                        <div className="text-[10px] font-mono font-bold"><span className="text-emerald-700">{w.present}</span>/<span className="text-amber-700">{w.late}</span>/<span className="text-rose-700">{w.absent}</span></div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold text-slate-500"><span className="text-emerald-600">■ حاضر</span><span className="text-amber-500">■ متأخر</span><span className="text-rose-600">■ غائب</span></div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                                <tr>
                                    <th className="p-3">الطالب</th>
                                    <th className="p-3 text-center">حضور</th>
                                    <th className="p-3 text-center">تأخير</th>
                                    <th className="p-3 text-center">غياب</th>
                                    <th className="p-3 text-center">نسبة الحضور</th>
                                    <th className="p-3 text-center">نسبة الغياب</th>
                                    <th className="p-3 text-center">الموقف</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {summaries.filter(x => !searchQuery || x.g.studentName.includes(searchQuery) || x.g.academicId.includes(searchQuery)).map(({ g, s }) => (
                                    <tr key={g.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-slate-900"><span className="font-mono text-blue-700 block text-[11px]">{g.academicId}</span>{g.studentName}</td>
                                        <td className="p-3 text-center font-mono font-bold text-emerald-700">{s.present}</td>
                                        <td className="p-3 text-center font-mono font-bold text-amber-700">{s.late}</td>
                                        <td className="p-3 text-center font-mono font-bold text-rose-700">{s.absent}</td>
                                        <td className="p-3 text-center">
                                            <div className="w-24 mx-auto space-y-1">
                                                <div className="font-mono font-bold">{s.percent}%</div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${s.percent >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${s.percent}%` }}></div></div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold">{s.absencePercent}%</td>
                                        <td className="p-3 text-center">
                                            {s.absencePercent >= rules.absenceLimitPercent
                                                ? <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full font-extrabold text-[10px]">معرض للحرمان</span>
                                                : s.absent > 0
                                                    ? <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold text-[10px]">إنذار غياب</span>
                                                    : <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[10px]">منتظم</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
