// =====================================================================
// DASHBOARD + INSTITUTE PROFILE
// =====================================================================
function InstituteProfileModal({ students, instructors, courses, departments, cohorts, regulation, onClose }) {
    const prog = getProgressionRules(regulation);
    const ctl = getControlRules(regulation);
    const passMark = getPassMark(regulation);
    const cohortRows = [...cohorts].sort((x, y) => y.level - x.level);
    const maxCohort = Math.max(0, ...cohortRows.map(c => c.totalStudents));
    const facultyCount = instructors.filter(i => FACULTY_TITLES.includes(i.title)).length;
    const assistantCount = instructors.filter(i => ASSISTANT_TITLES.includes(i.title)).length;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-l from-blue-900 via-navy-800 to-indigo-950 text-white p-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><i data-lucide="graduation-cap" className="w-8 h-8"></i></div>
                        <div>
                            <h2 className="text-xl font-extrabold leading-snug">المعهد العالي للحاسبات وتكنولوجيا المعلومات بالمنصورة</h2>
                            <p className="text-blue-200 text-xs font-semibold mt-1">Higher Institute of Computers and Information Technology - Mansoura (HICIT)</p>
                        </div>
                    </div>
                    <button onClick={onClose} title="إغلاق" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 shrink-0"><i data-lucide="x" className="w-5 h-5"></i></button>
                </div>

                <div className="p-6 space-y-6 text-xs">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { label: 'الطلاب المقيدون', value: students.length, cls: 'bg-blue-50 border-blue-200 text-blue-900' },
                            { label: 'أعضاء هيئة التدريس', value: facultyCount, cls: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                            { label: 'المعيدون والمدرسون المساعدون', value: assistantCount, cls: 'bg-purple-50 border-purple-200 text-purple-900' },
                            { label: 'المقررات بالكتالوج', value: courses.length, cls: 'bg-amber-50 border-amber-200 text-amber-900' },
                            { label: 'الأقسام العلمية', value: departments.length, cls: 'bg-rose-50 border-rose-200 text-rose-900' },
                        ].map(k => (
                            <div key={k.label} className={`p-4 rounded-2xl border ${k.cls}`}>
                                <div className="text-2xl font-black">{k.value}</div>
                                <div className="text-[11px] font-bold mt-1">{k.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
                            <h3 className="font-extrabold text-slate-900 text-sm">الأقسام العلمية</h3>
                            <div className="space-y-2">
                                {departments.map(d => (
                                    <div key={d.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                                        <div>
                                            <div className="font-bold text-slate-900">{d.nameAr}</div>
                                            <div className="text-[10px] text-slate-500">رئيس القسم: {d.head}</div>
                                        </div>
                                        <span className="font-mono font-extrabold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-0.5">{d.code}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
                            <h3 className="font-extrabold text-slate-900 text-sm">الدفعات وأعداد الطلاب</h3>
                            <div className="space-y-2.5">
                                {cohortRows.map(c => (
                                    <div key={c.id} className="space-y-1">
                                        <div className="flex justify-between font-bold text-slate-700">
                                            <span>{c.code} <span className="text-slate-400 font-semibold">({LEVEL_LABELS[c.level]})</span></span>
                                            <span>{c.totalStudents} طالب</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600" style={{ width: `${maxCohort ? Math.round((c.totalStudents / maxCohort) * 100) : 0}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold pt-1">إجمالي الطلاب بالدفعات: {cohortRows.reduce((a, c) => a + c.totalStudents, 0)} · عدد الدفعات: {cohorts.length}</div>
                        </div>
                    </div>

                    {regulation && (
                        <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-blue-950 text-sm">اللائحة الأكاديمية السارية</h3>
                                <span className="font-mono font-extrabold text-blue-800 bg-white border border-blue-200 rounded-lg px-2.5 py-0.5">{regulation.code}</span>
                            </div>
                            <p className="font-bold text-slate-800">{regulation.title}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-semibold text-slate-700">
                                <div className="bg-white rounded-xl border border-slate-200 p-3">إجمالي ساعات التخرج<div className="text-lg font-black text-blue-900">{regulation.totalHours}</div></div>
                                <div className="bg-white rounded-xl border border-slate-200 p-3">حد الساعات (منتظم / محذر)<div className="text-lg font-black text-blue-900">{regulation.semesterRules.maxHoursRegular} / {regulation.semesterRules.maxHoursWarned}</div></div>
                                <div className="bg-white rounded-xl border border-slate-200 p-3">شروط الترقية (ساعات)<div className="text-lg font-black text-blue-900">{prog.l1} · {prog.l2} · {prog.l3}</div></div>
                                <div className="bg-white rounded-xl border border-slate-200 p-3">توزيع الدرجات<div className="text-lg font-black text-blue-900">{ctl.yearWorkMax}% أعمال / {ctl.finalMax}% فاينل</div></div>
                            </div>
                            <p className="text-[11px] text-slate-600 font-semibold">درجة النجاح: {passMark}% · الحد الأدنى لورقة الفاينل: {ctl.minFinalPercent}% من درجتها · حد الغياب المعرض للحرمان: {ctl.absenceLimitPercent}%</p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold">إغلاق</button>
                </div>
            </div>
        </div>
    );
}
