function CohortsAndOnboardingView({ cohorts, students, setStudents, departments, regulations, instructors, searchQuery, showToast }) {
    const [selectedCohort, setSelectedCohort] = useState('ALL');
    const [selectedDept, setSelectedDept] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchQuery = !searchQuery ||
                s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.academicId.includes(searchQuery) ||
                s.nationalId.includes(searchQuery);
            const matchCohort = selectedCohort === 'ALL' || s.cohortId === selectedCohort;
            const matchDept = selectedDept === 'ALL' || s.dept === selectedDept;
            const matchStatus = selectedStatus === 'ALL' || s.academicStatus === selectedStatus;
            return matchQuery && matchCohort && matchDept && matchStatus;
        });
    }, [students, searchQuery, selectedCohort, selectedDept, selectedStatus]);

    const handleSaveStudent = (newStudentData) => {
        const exists = students.some(s => s.id === newStudentData.id);
        if (exists) {
            setStudents(students.map(s => s.id === newStudentData.id ? newStudentData : s));
            showToast('تم تحديث ملف الطالب والأكاديميات بنجاح!');
        } else {
            setStudents([newStudentData, ...students]);
            showToast('تم إلحاق الطالب المستجد بسجلات المعهد بنجاح!');
        }
        setIsAddModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Top Header Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">سلسلة الدفعات وقبول الطلاب (Cohorts & Student Onboarding)</h1>
                    <p className="text-slate-500 text-sm mt-1">عرض السلسلة الزمانية للدفعات، قبول وتسجيل الطلاب الجدد، وشيت القبول العام.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsExcelModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-2"
                    >
                        <i data-lucide="file-up" className="w-4 h-4 text-emerald-600"></i>
                        <span>رفع شيت إكسل دفعة كاملة</span>
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
                    >
                        <i data-lucide="user-plus" className="w-4 h-4"></i>
                        <span>+ تسجيل طالب جديد (Onboarding)</span>
                    </button>
                </div>
            </div>

            {/* Cohorts Directory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {cohorts.map((coh) => (
                    <div key={coh.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-blue-300 transition">
                        <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-base">{coh.code}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                coh.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                                {coh.status === 'Active' ? 'دفعة نشطة' : 'دفعة قادمة'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                                <span className="text-slate-400 block text-[10px]">العدد الكلي:</span>
                                <span className="font-extrabold text-slate-800">{coh.totalStudents} طالب</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">متوسط الـ CGPA:</span>
                                <span className="font-extrabold text-blue-700">{coh.avgGpa || '0.00'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">اللائحة المطبقة:</span>
                                <span className="font-bold text-slate-700">{coh.regulationId}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">المحذرون:</span>
                                <span className="font-bold text-rose-600">{coh.warnedCount} طالب</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Master Student Directory Table & Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <h3 className="font-extrabold text-slate-900 text-sm">دليل الطلاب العام وشيت القبول (Master Student Directory)</h3>
                    <div className="flex items-center gap-3 text-xs font-bold">
                        <select value={selectedCohort} onChange={(e) => setSelectedCohort(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5">
                            <option value="ALL">جميع الدفعات</option>
                            {cohorts.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                        </select>
                        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5">
                            <option value="ALL">جميع الأقسام</option>
                            <option value="عام (General)">عام (المستوى الأول)</option>
                            {departments.map(d => <option key={d.id} value={d.code}>{d.code}</option>)}
                        </select>
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5">
                            <option value="ALL">جميع الحالات الأكاديمية</option>
                            <option value="Regular">منتظم (Regular)</option>
                            <option value="Academic Warning">محذر أكاديمياً</option>
                            <option value="Suspended">موقوف/مجمد</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                            <tr>
                                <th className="p-3">الكود الأكاديمي (ID)</th>
                                <th className="p-3">اسم الطالب (Student Name)</th>
                                <th className="p-3">الدفعة والقسم</th>
                                <th className="p-3 text-center">الساعات المنجزة</th>
                                <th className="p-3 text-center">CGPA</th>
                                <th className="p-3 text-center">الحالة الأكاديمية</th>
                                <th className="p-3">المرشد الأكاديمي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredStudents.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50 transition">
                                    <td className="p-3 font-mono font-bold text-blue-700">{s.academicId}</td>
                                    <td className="p-3 font-bold text-slate-900">
                                        <div>{s.nameAr}</div>
                                        <div className="text-[10px] text-slate-400 font-normal">{s.email}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className="font-semibold text-slate-800">{s.cohortName}</span>
                                        <span className="block text-[10px] text-blue-600 font-bold">{s.dept}</span>
                                    </td>
                                    <td className="p-3 text-center font-bold text-slate-700">{s.passedCredits} hrs</td>
                                    <td className="p-3 text-center font-mono font-extrabold text-blue-900 bg-slate-50">{s.cgpa}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            s.academicStatus === 'Regular' ? 'bg-emerald-100 text-emerald-800' :
                                            s.academicStatus === 'Academic Warning' ? 'bg-rose-100 text-rose-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                            {s.academicStatus === 'Regular' ? 'منتظم' : s.academicStatus === 'Academic Warning' ? `محذر (${s.warningCount})` : 'موقوف'}
                                        </span>
                                    </td>
                                    <td className="p-3 font-semibold text-slate-700">{s.advisorName || 'غير معين'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <StudentOnboardingModal
                    cohorts={cohorts}
                    regulations={regulations}
                    departments={departments}
                    instructors={instructors}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveStudent}
                />
            )}

            {isExcelModalOpen && (
                <BulkExcelImportModal
                    onClose={() => setIsExcelModalOpen(false)}
                    showToast={showToast}
                />
            )}
        </div>
    );
}
