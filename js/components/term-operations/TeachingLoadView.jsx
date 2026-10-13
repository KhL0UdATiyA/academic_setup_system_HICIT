// =====================================================================
// TEACHING LOAD (per instructor across all levels)
// =====================================================================
function TeachingLoadView({ activeSemester, instructors, termOfferings, courses, searchQuery, showToast }) {
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [expandedId, setExpandedId] = useState(null);

    const loadMatrix = useMemo(() => {
        return instructors.map(ins => {
            const assigned = [];
            termOfferings.filter(off => off.semesterId === activeSemester).forEach(off => {
                const course = courses.find(c => c.code === off.courseCode);
                off.sections.forEach(sec => {
                    if (sec.instructorId !== ins.id) return;
                    const kind = sec.kind || (/Lab/.test(sec.type) ? 'lab' : /Lecture/.test(sec.type) ? 'lecture' : 'section');
                    const hours = kind === 'lecture' ? (course?.lect ?? 3) : kind === 'lab' ? (course?.lab ?? 2) : (course?.tut ?? 1);
                    assigned.push({
                        courseCode: off.courseCode, courseName: course?.nameAr || off.courseCode, level: course?.level || 0,
                        kind, label: sec.label || KIND_META[kind].label, hours, days: sec.days, time: sec.time, room: sec.room
                    });
                });
            });

            const byLevel = { 1: 0, 2: 0, 3: 0, 4: 0 };
            assigned.forEach(a => { if (byLevel[a.level] !== undefined) byLevel[a.level] += a.hours; });
            const assignedHours = assigned.reduce((acc, a) => acc + a.hours, 0);
            let conflicts = 0;
            for (let i = 0; i < assigned.length; i++) {
                for (let j = i + 1; j < assigned.length; j++) {
                    if (assigned[i].time === assigned[j].time && daysOverlap(assigned[i].days, assigned[j].days)) conflicts++;
                }
            }
            const isOverloaded = assignedHours > ins.maxHours;
            const isUnderload = assignedHours < (ins.maxHours * 0.5);
            const courseCount = new Set(assigned.map(a => a.courseCode)).size;
            return { ...ins, assigned, byLevel, assignedHours, conflicts, isOverloaded, isUnderload, courseCount };
        });
    }, [instructors, termOfferings, courses, activeSemester]);

    const filteredMatrix = useMemo(() => {
        return loadMatrix.filter(m => {
            const q = (searchQuery || '').toLowerCase();
            const matchQ = !q || m.name.includes(searchQuery) || m.code.toLowerCase().includes(q);
            const matchL = levelFilter === 'ALL' || m.byLevel[levelFilter] > 0;
            return matchQ && matchL;
        });
    }, [loadMatrix, searchQuery, levelFilter]);

    const levelTotals = [1, 2, 3, 4].map(l => ({ level: l, hours: loadMatrix.reduce((a, m) => a + m.byLevel[l], 0) }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">لوحة الأعباء التدريسية (Teaching Load Dashboard)</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        قياس العبء التدريسي المكتمل لكل محاضر ومعيد عبر كافة الفرق الدراسية، مع رصد تجاوز النصاب وتعارض المواعيد.
                    </p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    {activeSemester === 'Fall 2024' ? 'خريف 2024' : activeSemester === 'Spring 2025' ? 'ربيع 2025' : 'صيف 2025'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-400">إجمالي الساعات المسندة بالفصل:</span>
                    <div className="text-2xl font-black text-blue-900">{loadMatrix.reduce((acc, m) => acc + m.assignedHours, 0)} ساعة أسبوعية</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-emerald-800">ضمن النصاب المتوازن:</span>
                    <div className="text-2xl font-black text-emerald-950">{loadMatrix.filter(m => !m.isOverloaded && !m.isUnderload).length} محاضر</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-rose-800">تجاوز النصاب (Overloaded):</span>
                    <div className="text-2xl font-black text-rose-950">{loadMatrix.filter(m => m.isOverloaded).length} محاضر</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-amber-800">تعارض مواعيد مكتشف:</span>
                    <div className="text-2xl font-black text-amber-950">{loadMatrix.reduce((a, m) => a + m.conflicts, 0)} حالة</div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs font-bold">
                <span className="text-slate-500">عرض حسب الفرقة:</span>
                {[{ id: 'ALL', label: 'كل الفرق' }, ...[1, 2, 3, 4].map(l => ({ id: l, label: `${LEVEL_LABELS[l]} (${levelTotals[l - 1].hours}س)` }))].map(t => (
                    <button key={t.id} onClick={() => setLevelFilter(t.id)}
                        className={`px-4 py-2 rounded-xl transition ${levelFilter === t.id ? 'bg-blue-700 text-white shadow' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                            <tr>
                                <th className="p-4">الكود والاسم</th>
                                <th className="p-4">الدرجة والتعاقد</th>
                                {[1, 2, 3, 4].map(l => <th key={l} className="p-4 text-center">ف{l}</th>)}
                                <th className="p-4 text-center">العبء / الحد الأقصى</th>
                                <th className="p-4 text-center">الحالة</th>
                                <th className="p-4 text-center">التفاصيل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredMatrix.map((ins) => {
                                const percent = ins.maxHours > 0 ? Math.round((ins.assignedHours / ins.maxHours) * 100) : 0;
                                const open = expandedId === ins.id;
                                return (
                                    <React.Fragment key={ins.id}>
                                        <tr className="hover:bg-slate-50 transition">
                                            <td className="p-4 font-bold text-slate-900">
                                                <span className="font-mono text-blue-700 block text-[11px]">{ins.code}</span>
                                                <span>{ins.name}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-semibold text-slate-800">{ins.title}</span>
                                                <span className="block text-[10px] text-slate-400">{ins.dept} ({ins.employmentType})</span>
                                            </td>
                                            {[1, 2, 3, 4].map(l => (
                                                <td key={l} className="p-4 text-center font-mono font-bold">
                                                    {ins.byLevel[l] > 0 ? <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg">{ins.byLevel[l]}س</span> : <span className="text-slate-300">—</span>}
                                                </td>
                                            ))}
                                            <td className="p-4 text-center font-bold">
                                                <div className="w-28 mx-auto space-y-1">
                                                    <div className="font-mono text-xs"><strong className={ins.isOverloaded ? 'text-rose-600' : 'text-slate-900'}>{ins.assignedHours}</strong> / {ins.maxHours} ساعة</div>
                                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${ins.isOverloaded ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center space-y-1">
                                                {ins.isOverloaded ? (
                                                    <span className="block bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-[10px] font-extrabold border border-rose-200">متجاوز للنصاب</span>
                                                ) : ins.isUnderload ? (
                                                    <span className="block bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold">تحت النصاب</span>
                                                ) : (
                                                    <span className="block bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">نصاب متوازن</span>
                                                )}
                                                {ins.conflicts > 0 && <span className="block bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-[10px] font-bold">تعارض مواعيد ({ins.conflicts})</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => setExpandedId(open ? null : ins.id)} className="text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold">
                                                    {open ? 'إخفاء' : `عرض (${ins.assigned.length})`}
                                                </button>
                                            </td>
                                        </tr>
                                        {open && (
                                            <tr className="bg-slate-50/70">
                                                <td colSpan="9" className="p-4">
                                                    {ins.assigned.length === 0 ? (
                                                        <span className="text-slate-400 italic">لم يتم إسناد مواد لهذا الفصل بعد.</span>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                            {ins.assigned.map((a, i) => (
                                                                <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-mono font-extrabold text-blue-700">{a.courseCode}</span>
                                                                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${KIND_META[a.kind].badge}`}>{a.label}</span>
                                                                    </div>
                                                                    <div className="font-bold text-slate-800">{a.courseName}</div>
                                                                    <div className="text-[11px] text-slate-500">{LEVEL_LABELS[a.level]} · {a.hours} ساعة أسبوعياً</div>
                                                                    <div className="text-[11px] text-slate-600 font-semibold">{a.days} · {a.time} · {a.room}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
