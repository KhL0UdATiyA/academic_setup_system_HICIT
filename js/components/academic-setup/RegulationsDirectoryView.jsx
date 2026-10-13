function RegulationsDirectoryView({ regulations, searchQuery, onCreateNew, onDuplicate, onEdit }) {
    const filtered = useMemo(() => {
        if (!searchQuery) return regulations;
        return regulations.filter(r =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [regulations, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-extrabold text-slate-900">إدارة اللوائح الأكاديمية (Regulations Management)</h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">المعهد العالي</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">
                        هذه الصفحة مخصصة لإنشاء وضبط اللوائح الأم <span className="font-semibold text-slate-700">(Master Regulation Templates)</span> للمعهد.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCreateNew}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition flex items-center gap-2"
                    >
                        <i data-lucide="plus-circle" className="w-4 h-4"></i>
                        <span>+ إنشاء لائحة جديدة (Create New Regulation)</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((reg) => (
                    <div key={reg.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-slate-700">
                                    {reg.code}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                    reg.status === 'Active'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : reg.status === 'Under Review'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${
                                        reg.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}></span>
                                    {reg.status === 'Active' ? 'نشطة (Active)' : reg.status === 'Under Review' ? 'قيد المراجعة (Under Review)' : 'مسودة (Draft)'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">{reg.title}</h3>
                            <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">{reg.description}</p>

                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">عدد الساعات الإجمالي:</span>
                                    <span className="font-bold text-slate-800">{reg.totalHours} ساعة معتمدة</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">الدفعات المطبقة:</span>
                                    <span className="font-bold text-slate-800">{reg.applicableCohorts.join(', ')}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">أقصى مدة للبقاء بمستوى 1:</span>
                                    <span className="font-bold text-slate-800">{reg.maxStayLevel1} سنوات دراسية</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">حد الإنذارات (مادة 25):</span>
                                    <span className="font-bold text-slate-800">{reg.maxAcademicWarnings} إنذارات متتالية</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">آخر تحديث: {reg.updatedAt}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onDuplicate(reg)}
                                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
                                    title="نسخ لائحة وتعديلها لتصبح لائحة 2025"
                                >
                                    <i data-lucide="copy" className="w-3.5 h-3.5"></i>
                                    <span>نسخ لائحة (Duplicate Regulation)</span>
                                </button>
                                <button
                                    onClick={() => onEdit(reg)}
                                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition flex items-center gap-1.5"
                                >
                                    <i data-lucide="sliders" className="w-3.5 h-3.5"></i>
                                    <span>تعديل اللائحة (Edit Workflow)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
