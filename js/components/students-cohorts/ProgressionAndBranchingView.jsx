// =====================================================================
// PROGRESSION & BRANCHING (all levels + direct link to status tracking)
// =====================================================================
function ProgressionAndBranchingView({ students, setStudents, departments, regulations, showToast, onOpenStatusTracking }) {
    const activeReg = useMemo(() => regulations.find(r => r.status === 'Active') || regulations[0], [regulations]);
    const rules = getProgressionRules(activeReg);
    const [reports, setReports] = useState({});
    const [runningLevel, setRunningLevel] = useState(null);
    const [isBranchingModalOpen, setIsBranchingModalOpen] = useState(false);

    const transitions = [
        { from: 1, to: 2, hours: rules.l1, title: 'من الفرقة الأولى إلى الفرقة الثانية' },
        { from: 2, to: 3, hours: rules.l2, title: 'من الفرقة الثانية إلى الفرقة الثالثة' },
        { from: 3, to: 4, hours: rules.l3, title: 'من الفرقة الثالثة إلى الفرقة الرابعة' },
    ];

    const levelStats = transitions.map(t => {
        const inLevel = students.filter(s => s.level === t.from);
        const evals = inLevel.map(s => ({ s, ev: evaluatePromotion(s, rules) }));
        return {
            ...t,
            total: inLevel.length,
            eligible: evals.filter(e => e.ev.eligible).map(e => e.s),
            blocked: evals.filter(e => !e.ev.eligible)
        };
    });

    const handleRun = (t) => {
        setRunningLevel(t.from);
        setTimeout(() => {
            const st = levelStats.find(x => x.from === t.from);
            setReports(prev => ({
                ...prev,
                [t.from]: { promotedIds: st.eligible.map(s => s.id), retainedCount: st.blocked.length, applied: false }
            }));
            setRunningLevel(null);
            showToast(`تم فحص شروط الترقية ${t.title} - راجع النتيجة ثم اعتمد التنفيذ.`, 'info');
        }, 800);
    };

    const handleApply = (t) => {
        const rep = reports[t.from];
        if (!rep || rep.applied) return;
        const ids = new Set(rep.promotedIds);
        setStudents(prev => prev.map(s => (ids.has(s.id) && s.level === t.from) ? { ...s, level: s.level + 1 } : s));
        setReports(prev => ({ ...prev, [t.from]: { ...prev[t.from], applied: true } }));
        showToast(`تم اعتماد وترقية ${rep.promotedIds.length} طالب ${t.title}.`);
    };

    const branchingStudents = students.filter(s => s.level <= 2);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">الترقية والتشعيب الأكاديمي (Progression & Department Branching)</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        محرك الترقية لجميع الفرق الدراسية وفق لائحة <strong className="text-blue-700">{activeReg?.code}</strong> مع إظهار الشروط وعدد الطلاب غير المنتقلين وتوزيع الرغبات والتنسيق.
                    </p>
                </div>
            </div>

            {/* Progression Engine: one card per transition */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {levelStats.map((t) => {
                    const rep = reports[t.from];
                    return (
                        <div key={t.from} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col">
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-sm">{t.title}</h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">محرك الترقية التلقائية (Automatic Progression Engine)</p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap">{t.total} طالب بالفرقة</span>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] space-y-1.5">
                                <div className="font-extrabold text-slate-800">شروط الانتقال:</div>
                                <div className="flex items-start gap-2 text-slate-700 font-semibold">
                                    <span className="text-emerald-600">✔</span>
                                    <span>اجتياز <strong className="text-blue-800">{t.hours}</strong> ساعة معتمدة على الأقل (من إجمالي {activeReg?.totalHours} ساعة للتخرج).</span>
                                </div>
                                <div className="flex items-start gap-2 text-slate-700 font-semibold">
                                    <span className="text-emerald-600">✔</span>
                                    <span>ألا تكون حالة القيد موقوفاً أو مجمداً.</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                                    <div className="text-lg font-black text-slate-900">{t.total}</div>
                                    <div className="text-[10px] font-bold text-slate-500">إجمالي الفرقة</div>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200">
                                    <div className="text-lg font-black text-emerald-800">{t.eligible.length}</div>
                                    <div className="text-[10px] font-bold text-emerald-700">مستوفٍ للشروط</div>
                                </div>
                                <div className="bg-rose-50 rounded-xl p-2.5 border border-rose-200">
                                    <div className="text-lg font-black text-rose-800">{t.blocked.length}</div>
                                    <div className="text-[10px] font-bold text-rose-700">غير منتقلين</div>
                                </div>
                            </div>

                            {rep && (
                                <div className={`p-3 rounded-xl text-[11px] font-bold border ${rep.applied ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                                    {rep.applied
                                        ? `✔ تم اعتماد ترقية ${rep.promotedIds.length} طالب - بقي ${rep.retainedCount} بالفرقة للإعادة.`
                                        : `نتيجة الفحص: ${rep.promotedIds.length} طالب سيُرقَّون و ${rep.retainedCount} سيبقون بالفرقة. بانتظار الاعتماد.`}
                                </div>
                            )}

                            <div className="mt-auto space-y-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRun(t)}
                                        disabled={runningLevel === t.from || t.total === 0}
                                        className="flex-1 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                                    >
                                        <span className={runningLevel === t.from ? 'inline-block animate-spin' : 'inline-block'}><i data-lucide="refresh-cw" className="w-4 h-4"></i></span>
                                        <span>{runningLevel === t.from ? 'جاري الفحص...' : 'فحص الترقية'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleApply(t)}
                                        disabled={!rep || rep.applied || rep.promotedIds.length === 0}
                                        className="flex-1 px-3 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow transition"
                                    >
                                        اعتماد الترقية
                                    </button>
                                </div>
                                <button
                                    onClick={() => onOpenStatusTracking(t.from)}
                                    disabled={t.blocked.length === 0}
                                    className="w-full px-3 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-rose-800 border border-rose-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2"
                                >
                                    <i data-lucide="shield-alert" className="w-4 h-4"></i>
                                    <span>عرض أسباب عدم الترقية ({t.blocked.length}) - تتبع الحالات والاستثناءات</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Department Branching Wizard */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-base">محرك التشعيب والتخصص بالأقسام (Department Branching Wizard)</h3>
                        <p className="text-xs text-slate-500">تنسيق طلاب الفرقة الثانية وتوزيعهم على أقسام CS, IS, IT حسب الـ CGPA والطاقة الاستيعابية.</p>
                    </div>
                    <button
                        onClick={() => setIsBranchingModalOpen(true)}
                        className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2"
                    >
                        <i data-lucide="git-branch" className="w-4 h-4"></i>
                        <span>تنفيذ محرك التنسيق والتشعيب التلقائي</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                            <tr>
                                <th className="p-3">الطالب</th>
                                <th className="p-3 text-center">الفرقة</th>
                                <th className="p-3 text-center">CGPA</th>
                                <th className="p-3 text-center">تقدير CS101</th>
                                <th className="p-3 text-center">الرغبة الأولى</th>
                                <th className="p-3 text-center">الرغبة الثانية</th>
                                <th className="p-3 text-center">الرغبة الثالثة</th>
                                <th className="p-3 text-center">القسم المخصص حالياً</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {branchingStudents.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-bold text-slate-900">
                                        <span>{s.nameAr}</span>
                                        <span className="block text-[10px] text-slate-400 font-mono">{s.academicId}</span>
                                    </td>
                                    <td className="p-3 text-center font-semibold text-slate-700">{LEVEL_LABELS[s.level]}</td>
                                    <td className="p-3 text-center font-mono font-bold text-blue-700 bg-slate-50">{s.cgpa}</td>
                                    <td className="p-3 text-center font-bold">{s.cs101Grade || 'A'}</td>
                                    <td className="p-3 text-center font-bold text-emerald-700 bg-emerald-50/30">{s.choices?.choice1 || 'CS'}</td>
                                    <td className="p-3 text-center font-semibold text-slate-600">{s.choices?.choice2 || 'IS'}</td>
                                    <td className="p-3 text-center font-semibold text-slate-600">{s.choices?.choice3 || 'IT'}</td>
                                    <td className="p-3 text-center font-bold">
                                        <span className="bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-lg border border-blue-200">{s.dept}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isBranchingModalOpen && (
                <DepartmentBranchingModal departments={departments} onClose={() => setIsBranchingModalOpen(false)} showToast={showToast} />
            )}
        </div>
    );
}
