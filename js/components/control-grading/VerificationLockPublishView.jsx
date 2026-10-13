// ---------------------------------------------------------------------
// 3. Verification, lock, exam schedule & publishing
// ---------------------------------------------------------------------
function VerificationLockPublishView({ courses, regulation, students, setStudents, cohorts, studentGrades, setStudentGrades, showToast }) {
    const [selectedCourseCode, setSelectedCourseCode] = useState('CS101');
    const course = courses.find(c => c.code === selectedCourseCode);
    const credits = course?.credits || 3;

    const filteredGrades = useMemo(() => studentGrades.filter(g => g.courseCode === selectedCourseCode), [studentGrades, selectedCourseCode]);
    const allProcessed = filteredGrades.length > 0 && filteredGrades.every(g => g.processed);
    const isApproved = filteredGrades.length > 0 && filteredGrades.every(g => g.isApproved);
    const isPublished = filteredGrades.length > 0 && filteredGrades.every(g => g.isPublished);

    const analytics = useMemo(() => {
        const done = filteredGrades.filter(g => g.processed);
        const passCount = done.filter(g => g.letterGrade !== 'F').length;
        return { total: filteredGrades.length, passCount, failCount: done.length - passCount, passRate: done.length ? Math.round((passCount / done.length) * 100) : 0 };
    }, [filteredGrades]);

    // Exam schedule overview per level (counts from cohorts, status from real control sheets)
    const examSchedule = [1, 2, 3, 4].map(level => {
        const cohort = cohorts.find(c => c.level === level && c.status !== 'Upcoming');
        const levelStudentIds = new Set(students.filter(s => s.level === level).map(s => s.id));
        const rows = studentGrades.filter(g => levelStudentIds.has(g.studentId));
        const locked = rows.length > 0 && rows.every(g => g.isPublished);
        const started = rows.length > 0;
        return {
            level, levelName: LEVEL_LABELS[level],
            cohortCode: cohort ? cohort.code : '—',
            totalStudents: cohort ? cohort.totalStudents : students.filter(s => s.level === level).length,
            season: level === 4 ? 'امتحانات يناير / مايو / دور يوليو الاستثنائي' : 'امتحانات يناير (فصل الخريف) / امتحانات مايو (فصل الربيع)',
            examStatus: locked ? 'مكتمل ومقفل نهائياً' : started ? 'قيد الرصد والاعتماد' : 'لم يبدأ الرصد بعد',
            isLocked: locked
        };
    });

    const cgpaPreview = useMemo(() => filteredGrades.map(g => {
        const st = students.find(s => s.id === g.studentId);
        if (!st || !g.processed) return { g, st, projected: null };
        const prevCredits = st.passedCredits || 0;
        const projected = isPublished ? st.cgpa : Math.round(((st.cgpa * prevCredits + g.points * credits) / (prevCredits + credits)) * 100) / 100;
        return { g, st, projected };
    }), [filteredGrades, students, credits, isPublished]);

    const handleApproveAndLockControl = () => {
        if (!allProcessed) { showToast('يجب تشغيل محرك المعالجة لجميع طلاب المقرر قبل الاعتماد (شاشة 2).', 'error'); return; }
        setStudentGrades(prev => prev.map(g => g.courseCode === selectedCourseCode ? { ...g, isApproved: true } : g));
        showToast(`تم التوقيع والاعتماد النهائي لشيت الكنترول للمادة (${selectedCourseCode}) بواسطة رئيس الكنترول!`);
    };

    const handlePublishResults = () => {
        if (!isApproved) { showToast('يجب التوقيع والاعتماد النهائي للكنترول أولاً قبل نشر النتيجة للطلاب!', 'error'); return; }
        if (isPublished) return;
        const updates = {};
        filteredGrades.forEach(g => {
            const st = students.find(s => s.id === g.studentId);
            if (!st) return;
            const prevCredits = st.passedCredits || 0;
            updates[st.id] = {
                cgpa: Math.round(((st.cgpa * prevCredits + g.points * credits) / (prevCredits + credits)) * 100) / 100,
                passedCredits: prevCredits + (g.points > 0 ? credits : 0)
            };
        });
        setStudents(prev => prev.map(s => updates[s.id] ? { ...s, ...updates[s.id] } : s));
        setStudentGrades(prev => prev.map(g => g.courseCode === selectedCourseCode ? { ...g, isPublished: true } : g));
        showToast(`تم نشر نتائج مادة (${selectedCourseCode}) بنجاح وتحديث المعدلات التراكمية (CGPA) والساعات المجتازة لجميع الطلاب!`);
    };

    const checklist = [
        { label: 'إغلاق أعمال السنة', ok: filteredGrades.length > 0 && filteredGrades.every(g => g.yearWorkLocked) },
        { label: 'رصد درجات الفاينل', ok: filteredGrades.length > 0 && filteredGrades.every(g => g.isAbsent || g.finalExamMark > 0) },
        { label: 'تشغيل محرك المعالجة', ok: allProcessed },
        { label: 'اعتماد رئيس الكنترول', ok: isApproved },
        { label: 'نشر النتيجة', ok: isPublished },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-extrabold text-slate-900">3. التوثيق وقفل الكنترول ومواعيد الامتحانات (Verification & Publishing)</h1>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">الاعتماد وقفل الترم</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">متابعة الفرق التي تمتحن ومواعيدها خلال السنة، مراجعة النسبة العامة، واعتماد النتيجة ونشرها.</p>
                </div>
                <CourseSelect courses={courses} value={selectedCourseCode} onChange={setSelectedCourseCode} />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <i data-lucide="calendar" className="w-4 h-4 text-blue-700"></i>
                        <span>مواعيد امتحانات الفرق الدراسية ومراحل الكنترول خلال السنة الأكاديمية:</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">متابعة الفرق التي تقدمت للامتحانات وحالة قفل الكنترول لكل دفعة.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {examSchedule.map((item) => (
                        <div key={item.level} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-blue-700 text-white font-extrabold flex items-center justify-center text-xs">L{item.level}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-xs">{item.levelName} ({item.cohortCode})</h4>
                                        <span className="text-[10px] text-slate-500">{item.totalStudents} طالب مسجل</span>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${item.isLocked ? 'bg-emerald-100 text-emerald-800' : item.examStatus === 'قيد الرصد والاعتماد' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>{item.examStatus}</span>
                            </div>
                            <div className="text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700"><strong>مواعيد الامتحانات بالسنة:</strong> {item.season}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-extrabold text-slate-700 mb-3">مراحل الكنترول للمقرر {selectedCourseCode}</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {checklist.map((c, i) => (
                        <div key={c.label} className={`text-center text-[11px] font-bold py-2.5 px-2 rounded-xl border ${c.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            {c.ok ? '✔' : `${i + 1}.`} {c.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1"><span className="text-slate-400 text-xs font-bold block">إجمالي الطلاب المتقدمين:</span><span className="text-2xl font-black text-slate-900">{analytics.total} طالب</span></div>
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-1"><span className="text-emerald-800 text-xs font-bold block">عدد الناجحين:</span><span className="text-2xl font-black text-emerald-950">{analytics.passCount} طالب</span></div>
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-1"><span className="text-rose-800 text-xs font-bold block">عدد الراسبين:</span><span className="text-2xl font-black text-rose-950">{analytics.failCount} طالب</span></div>
                <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl space-y-1"><span className="text-blue-800 text-xs font-bold block">نسبة النجاح العامة:</span><span className="text-2xl font-black text-blue-950">{allProcessed ? `${analytics.passRate}%` : '—'}</span></div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-base">اعتماد وقفل الكنترول النهائي (Level 1 Approval)</h3>
                        {isApproved
                            ? <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">معتمد ومقفل</span>
                            : <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">بانتظار توقيع رئيس الكنترول</span>}
                    </div>
                    <p className="text-xs text-slate-500">توقيع اعتماد النتيجة يمنع أي تعديلات إضافية على شيتات المادة ويسمح بالنشر المباشر وتحديث المعدل التراكمي.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={handleApproveAndLockControl} disabled={isApproved} className={`px-5 py-3 rounded-xl font-extrabold text-xs shadow transition flex items-center gap-2 ${isApproved ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-purple-800 hover:bg-purple-900 text-white'}`}>
                        <i data-lucide="shield-check" className="w-4 h-4"></i><span>توقيع وتعميد الكنترول النهائي (Lock Control)</span>
                    </button>
                    <button onClick={handlePublishResults} disabled={isPublished} className={`px-5 py-3 rounded-xl font-extrabold text-xs shadow transition flex items-center gap-2 ${isPublished ? 'bg-emerald-200 text-emerald-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                        <i data-lucide="send" className="w-4 h-4"></i><span>{isPublished ? 'النتيجة منشورة بالفعل 🟢' : 'نشر النتيجة فوراً للطلاب (Publish Grades)'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">معاينة حساب المعدل التراكمي (CGPA)</h3>
                    <span className="text-[11px] text-slate-500 font-semibold">المقرر: {credits} ساعات معتمدة · الحساب موزون بالساعات المجتازة سابقاً (تقدير تقريبي)</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                            <tr>
                                <th className="p-3">الطالب</th>
                                <th className="p-3 text-center">المجموع</th>
                                <th className="p-3 text-center">التقدير</th>
                                <th className="p-3 text-center">النقاط</th>
                                <th className="p-3 text-center">{isPublished ? 'CGPA بعد النشر' : 'CGPA الحالي'}</th>
                                <th className="p-3 text-center">{isPublished ? 'الساعات المجتازة' : 'CGPA المتوقع بعد النشر'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {cgpaPreview.map(({ g, st, projected }) => (
                                <tr key={g.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-bold text-slate-900"><span className="font-mono text-blue-700 block text-[11px]">{g.academicId}</span>{g.studentName}</td>
                                    <td className="p-3 text-center font-mono font-bold">{g.processed ? g.totalMark : '—'}</td>
                                    <td className="p-3 text-center font-mono font-black">{g.processed ? g.letterGrade : '—'}</td>
                                    <td className="p-3 text-center font-mono">{g.processed ? Number(g.points).toFixed(1) : '—'}</td>
                                    <td className="p-3 text-center font-mono font-bold text-slate-700">{st ? st.cgpa : '—'}</td>
                                    <td className="p-3 text-center font-mono font-extrabold text-blue-800">{isPublished ? (st ? st.passedCredits : '—') : (projected !== null ? projected : '—')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
