function TermOfferingsView({ activeSemester, setActiveSemester, termOfferings, setTermOfferings, courses, instructors, searchQuery, showToast }) {
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [selectedOfferingForEdit, setSelectedOfferingForEdit] = useState(null);

    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    }, [isOfferModalOpen, activeSemester, termOfferings]);

    // Filtering offerings based on term and search query
    const filteredOfferings = useMemo(() => {
        return termOfferings.filter(off => {
            const course = courses.find(c => c.code === off.courseCode);
            const q = (searchQuery || '').toLowerCase();
            const matchQuery = !q ||
                off.courseCode.toLowerCase().includes(q) ||
                (course && (course.nameAr.includes(searchQuery) || course.nameEn.toLowerCase().includes(q)));
            const matchSem = off.semesterId === activeSemester;
            return matchQuery && matchSem;
        });
    }, [termOfferings, activeSemester, courses, searchQuery]);

    const handleSaveOffering = (newOffering) => {
        const exists = termOfferings.some(o => o.id === newOffering.id);
        if (exists && !selectedOfferingForEdit) {
            showToast('هذا المقرر مطروح بالفعل في هذا الفصل، استخدم "تعديل السكاشن".', 'info');
            return;
        }
        if (exists) {
            setTermOfferings(termOfferings.map(o => o.id === newOffering.id ? newOffering : o));
            showToast('تم تحديث طرح المقرر والسكاشن بنجاح!');
        } else {
            setTermOfferings([newOffering, ...termOfferings]);
            showToast('تم طرح المقرر في جدول الفصل الدراسي بنجاح!');
        }
        setIsOfferModalOpen(false);
        setSelectedOfferingForEdit(null);
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-extrabold text-slate-900">طرح المقررات الفصلية والجدولة (Term Offerings)</h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">العام الدراسي 2024/2025</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">
                        ربط عملي بكتالوج المقررات الشامل <span className="font-bold text-slate-700">(Global Course Catalog)</span> مع تحديد السكاشن، القاعات، والمواعيد لكل فصل.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                        <span className="text-slate-500 mr-2">الفصل الدراسي:</span>
                        {['Fall 2024', 'Spring 2025', 'Summer 2025'].map(sem => (
                            <button
                                key={sem}
                                onClick={() => setActiveSemester(sem)}
                                className={`px-3 py-1.5 rounded-lg transition ${
                                    activeSemester === sem ? 'bg-blue-700 text-white shadow font-bold' : 'text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {sem === 'Fall 2024' ? 'خريف 2024' : sem === 'Spring 2025' ? 'ربيع 2025' : 'صيف 2025'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { setSelectedOfferingForEdit(null); setIsOfferModalOpen(true); }}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
                    >
                        <i data-lucide="plus-circle" className="w-4 h-4"></i>
                        <span>+ طرح مقرر جديد للفصل</span>
                    </button>
                </div>
            </div>

            {/* Offerings Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <tr>
                            <th className="p-4">كود المقرر والاسم (Catalog Linked)</th>
                            <th className="p-4">القسم والنوع</th>
                            <th className="p-4 text-center">عدد السكاشن</th>
                            <th className="p-4">المحاضرون والقاعات</th>
                            <th className="p-4 text-center">السعة والاستيعاب</th>
                            <th className="p-4 text-center">حالة الشعبة</th>
                            <th className="p-4 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredOfferings.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center p-8 text-slate-400 font-bold">
                                    لا توجد مقررات مطروحة لهذا الفصل حالياً أو تطابق البحث.
                                </td>
                            </tr>
                        ) : (
                            filteredOfferings.map((off) => {
                                const catalogCourse = courses.find(c => c.code === off.courseCode);
                                const totalCap = off.sections.reduce((acc, s) => acc + s.capacity, 0);
                                const totalEnrolled = off.sections.reduce((acc, s) => acc + s.enrolled, 0);
                                const percent = totalCap > 0 ? Math.round((totalEnrolled / totalCap) * 100) : 0;

                                return (
                                    <tr key={off.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-bold text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-blue-700 font-extrabold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                                                    {off.courseCode}
                                                </span>
                                                <span>{catalogCourse ? catalogCourse.nameAr : off.courseCode}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1 font-mono">{catalogCourse?.nameEn}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-slate-800">{catalogCourse?.dept}</span>
                                            <span className="block text-[10px] text-emerald-700 font-bold">{catalogCourse?.credits} ساعات معتمدة</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-bold">
                                                {off.sections.length} مجموعات
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-700">
                                            {off.sections.map((sec, idx) => {
                                                const instructor = instructors.find(i => i.id === sec.instructorId);
                                                return (
                                                    <div key={idx} className="text-[11px] leading-relaxed">
                                                        • {sec.type}: <strong className="text-slate-900">{instructor ? instructor.name : 'غير محدد'}</strong> <span className="text-slate-400">({sec.room})</span>
                                                    </div>
                                                );
                                            })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="w-32 mx-auto space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span>{totalEnrolled} مسجل</span>
                                                    <span className="text-slate-400">من {totalCap}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${percent >= 100 ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                off.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {off.status === 'Open' ? 'مفتوح للتسجيل' : 'مغلق (مكتمل العدد)'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => { setSelectedOfferingForEdit(off); setIsOfferModalOpen(true); }}
                                                className="text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 mx-auto"
                                            >
                                                <i data-lucide="sliders" className="w-3.5 h-3.5"></i>
                                                <span>تعديل السكاشن</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {isOfferModalOpen && (
                <CourseOfferingModal
                    activeSemester={activeSemester}
                    courses={courses}
                    instructors={instructors}
                    initialOffering={selectedOfferingForEdit}
                    onClose={() => { setIsOfferModalOpen(false); setSelectedOfferingForEdit(null); }}
                    onSave={handleSaveOffering}
                />
            )}
        </div>
    );
}
