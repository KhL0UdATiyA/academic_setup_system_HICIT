function DashboardOverviewView({ students, instructors, courses, studentGrades, overrideRequests, cohorts, setActiveNav, onOpenInstitute }) {
    const stats = useMemo(() => {
        const totalStudents = students.length;
        const warnedStudents = students.filter(s => s.academicStatus === 'Academic Warning').length;
        const pendingOverrides = overrideRequests.filter(r => r.status === 'Pending').length;
        const courseCodes = Array.from(new Set(studentGrades.map(g => g.courseCode)));
        const publishedCourses = courseCodes.filter(c => studentGrades.filter(g => g.courseCode === c).every(g => g.isPublished)).length;
        return { totalStudents, warnedStudents, pendingOverrides, publishedCourses, courseCodes };
    }, [students, studentGrades, overrideRequests]);

    const pipeline = stats.courseCodes.map(code => {
        const rows = studentGrades.filter(g => g.courseCode === code);
        const all = (fn) => rows.length > 0 && rows.every(fn);
        const steps = [
            { label: 'أعمال السنة', done: all(g => g.yearWorkLocked) },
            { label: 'الفاينل', done: all(g => g.isAbsent || g.finalExamMark > 0) },
            { label: 'المعالجة', done: all(g => g.processed) },
            { label: 'الاعتماد', done: all(g => g.isApproved) },
            { label: 'النشر', done: all(g => g.isPublished) },
        ];
        const course = courses.find(c => c.code === code);
        return { code, name: course?.nameAr || code, count: rows.length, steps };
    });

    const cohortRows = [...cohorts].sort((x, y) => y.level - x.level);
    const maxCohort = Math.max(0, ...cohortRows.map(c => c.totalStudents));
    const levelCounts = [1, 2, 3, 4].map(l => ({ level: l, count: students.filter(s => s.level === l).length }));

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 via-navy-800 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <span className="bg-white/10 text-blue-200 border border-white/20 text-xs px-3 py-1 rounded-full font-bold">العام الأكاديمي 2024/2025 - الفصل الدراسي الخريفي</span>
                    <h2 className="text-3xl font-extrabold tracking-tight">مرحباً بك في نظام إدارة المعهد العالي للحاسبات بالمنصورة (HICIT)</h2>
                    <p className="text-blue-100 text-xs max-w-2xl leading-relaxed">
                        المنظومة الموحدة لإدارة الهياكل الأكاديمية، شؤون الطلاب، تسجيل المقررات، وأعمال الكنترول والرصد والنتائج.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
                    <button onClick={onOpenInstitute} className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold px-5 py-3 rounded-2xl text-xs transition flex items-center gap-2">
                        <i data-lucide="building-2" className="w-4 h-4"></i>
                        <span>نظرة عامة على المعهد</span>
                    </button>
                    <button onClick={() => setActiveNav('Control & Grading')} className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs shadow-lg transition flex items-center gap-2">
                        <i data-lucide="file-spreadsheet" className="w-4 h-4"></i>
                        <span>دخول شاشة الكنترول والرصد</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-bold">إجمالي الطلاب المقيدين:</span>
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-xl"><i data-lucide="users" className="w-4 h-4"></i></div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.totalStudents} طالب</div>
                    <span className="text-[10px] text-slate-500 font-bold">موزعون على {levelCounts.filter(l => l.count > 0).length} فرق دراسية</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-bold">الطلاب تحت الإنذار:</span>
                        <div className="p-2 bg-rose-50 text-rose-700 rounded-xl"><i data-lucide="shield-alert" className="w-4 h-4"></i></div>
                    </div>
                    <div className="text-2xl font-black text-rose-700">{stats.warnedStudents} طالب</div>
                    <span className="text-[10px] text-rose-500 font-bold">يتطلب متابعة الإرشاد الأكاديمي</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-bold">طلبات الاستثناء المعلقة:</span>
                        <div className="p-2 bg-amber-50 text-amber-700 rounded-xl"><i data-lucide="clock" className="w-4 h-4"></i></div>
                    </div>
                    <div className="text-2xl font-black text-amber-800">{stats.pendingOverrides} طلب</div>
                    <span className="text-[10px] text-amber-600 font-bold">قيد مراجعة العميد/الكنترول</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-bold">مقررات نتيجتها منشورة:</span>
                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><i data-lucide="check-circle-2" className="w-4 h-4"></i></div>
                    </div>
                    <div className="text-2xl font-black text-emerald-800">{stats.publishedCourses} من {stats.courseCodes.length} مقررات</div>
                    <span className="text-[10px] text-emerald-600 font-bold">متاحة على بوابات الطلاب</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-sm">مسار الكنترول لكل مقرر</h3>
                        <button onClick={() => setActiveNav('Control & Grading')} className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                            <span>فتح الكنترول</span><i data-lucide="arrow-left" className="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {pipeline.map(p => (
                            <div key={p.code} className="border border-slate-200 rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-900"><span className="font-mono text-blue-700">{p.code}</span> · {p.name}</span>
                                    <span className="text-slate-500 font-semibold">{p.count} طالب</span>
                                </div>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {p.steps.map(st => (
                                        <div key={st.label} className={`text-center text-[10px] font-bold py-1.5 rounded-lg border ${st.done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                            {st.done ? '✔ ' : ''}{st.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">الدفعات وأعداد الطلاب</h3>
                    <div className="space-y-3">
                        {cohortRows.map(c => (
                            <div key={c.id} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                    <span>{c.code} <span className="text-slate-400 font-semibold">({LEVEL_LABELS[c.level]})</span></span>
                                    <span>{c.totalStudents} طالب</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${maxCohort ? Math.round((c.totalStudents / maxCohort) * 100) : 0}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: 'book-open', title: 'إدارة اللوائح والكتالوج', text: 'ضبط قواعد الساعات المعتمدة، شروط الترقية بين الفرق، وبناء سلم التقديرات.', nav: 'Academic Setup', cta: 'الانتقال للهيكل الأكاديمي' },
                    { icon: 'user-check', title: 'تسجيل الطلاب والتخصصات', text: 'قيد الطلاب الجدد، متابعة المحذرين، وتنفيذ محرك الترقية والتشعيب (CS, IS, IT).', nav: 'Students & Cohorts', cta: 'الانتقال لإدارة الطلاب' },
                    { icon: 'file-spreadsheet', title: 'أعمال الكنترول والنتائج', text: 'رصد أعمال السنة (40%)، درجات الفاينل (60%)، محرك الرأفة، ونشر النتيجة.', nav: 'Control & Grading', cta: 'دخول قسم الكنترول' },
                ].map(card => (
                    <div key={card.nav} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <i data-lucide={card.icon} className="w-4 h-4 text-blue-700"></i><span>{card.title}</span>
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{card.text}</p>
                        <button onClick={() => setActiveNav(card.nav)} className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                            <span>{card.cta}</span><i data-lucide="arrow-left" className="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
