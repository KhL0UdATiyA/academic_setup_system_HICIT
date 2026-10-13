function InstructorsDirectoryView({ instructors, setInstructors, departments, searchQuery, showToast }) {
    const [filterDept, setFilterDept] = useState('ALL');
    const [filterTitle, setFilterTitle] = useState('ALL');
    const [filterEmployment, setFilterEmployment] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentInstructor, setCurrentInstructor] = useState(null);

    const filteredInstructors = useMemo(() => {
        return instructors.filter(ins => {
            const matchQuery = !searchQuery ||
                ins.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ins.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchDept = filterDept === 'ALL' || ins.dept === filterDept;
            const matchTitle = filterTitle === 'ALL' || ins.title === filterTitle;
            const matchEmployment = filterEmployment === 'ALL' || ins.employmentType === filterEmployment;
            return matchQuery && matchDept && matchTitle && matchEmployment;
        });
    }, [instructors, searchQuery, filterDept, filterTitle, filterEmployment]);

    const handleCreateNew = () => {
        setCurrentInstructor({
            id: '',
            code: `INS-${Math.floor(100 + Math.random() * 900)}`,
            name: '',
            nationalId: '',
            phone: '',
            email: '',
            dob: '1990-01-01',
            dept: 'CS',
            title: 'مدرس',
            employmentType: 'FullTime',
            hireDate: new Date().toISOString().split('T')[0],
            office: 'المبنى الأكاديمي - دور 2 - مكتب 205',
            maxHours: 16,
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const handleEdit = (ins) => {
        setCurrentInstructor({ ...ins });
        setIsModalOpen(true);
    };

    const handleSave = (savedData) => {
        if (instructors.some(i => i.id === savedData.id && i.id !== '')) {
            setInstructors(instructors.map(i => i.id === savedData.id ? savedData : i));
            showToast('تم تحديث بيانات عضو هيئة التدريس بنجاح.');
        } else {
            const newIns = { ...savedData, id: `INS-${Date.now().toString().slice(-4)}` };
            setInstructors([...instructors, newIns]);
            showToast('تم إنشاء وتوليد حساب عضو هيئة التدريس الجديد بنجاح.');
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">دليل أعضاء هيئة التدريس والكتلة المعاونة (Instructors Directory)</h1>
                    <p className="text-slate-500 text-sm mt-1">إدارة وإنشاء حسابات الدكاترة والمعيدين، وتحديد رتبهم الأكاديمية وأعبائهم التدريسية.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition flex items-center gap-2"
                >
                    <i data-lucide="user-plus" className="w-4 h-4"></i>
                    <span>+ إضافة عضو هيئة تدريس جديد</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">القسم العلمي:</span>
                    <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5">
                        <option value="ALL">جميع الأقسام (CS, IS, IT, BS)</option>
                        {departments.map(d => <option key={d.id} value={d.code}>{d.code} - {d.nameAr}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-slate-500">الدرجة العلمية:</span>
                    <select value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5">
                        <option value="ALL">جميع الدرجات</option>
                        <option value="أستاذ">أستاذ</option>
                        <option value="أستاذ مساعد">أستاذ مساعد</option>
                        <option value="مدرس">مدرس</option>
                        <option value="مدرس مساعد">مدرس مساعد</option>
                        <option value="معيد">معيد</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-slate-500">طبيعة التعاقد:</span>
                    <select value={filterEmployment} onChange={(e) => setFilterEmployment(e.target.value)} className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5">
                        <option value="ALL">جميع أنواع التعاقد</option>
                        <option value="FullTime">تفرغ كامل (FullTime)</option>
                        <option value="PartTime">انتداب جزئي (PartTime)</option>
                        <option value="Visiting">محاضر زائر (Visiting)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <tr>
                            <th className="p-4">كود المحاضر (Instructor Code)</th>
                            <th className="p-4">الاسم بالكامل (Full Name)</th>
                            <th className="p-4">الدرجة العلمية (Academic Title)</th>
                            <th className="p-4">القسم (Department)</th>
                            <th className="p-4">طبيعة التعاقد (Employment Type)</th>
                            <th className="p-4 text-center">العبء التدريسي (Max Hours)</th>
                            <th className="p-4 text-center">حالة الحساب (Status)</th>
                            <th className="p-4 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredInstructors.map((ins) => (
                            <tr key={ins.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-mono font-bold text-blue-700">{ins.code}</td>
                                <td className="p-4 font-bold text-slate-900">
                                    <div>{ins.name}</div>
                                    <div className="text-[11px] text-slate-400 font-normal">{ins.email}</div>
                                </td>
                                <td className="p-4 font-semibold text-slate-800">{ins.title}</td>
                                <td className="p-4">
                                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded font-bold">
                                        {ins.dept}
                                    </span>
                                </td>
                                <td className="p-4 font-medium text-slate-700">
                                    {ins.employmentType === 'FullTime' ? 'تفرغ كامل (FullTime)' : ins.employmentType === 'PartTime' ? 'انتداب جزئي (PartTime)' : 'زائر (Visiting)'}
                                </td>
                                <td className="p-4 text-center font-bold text-blue-900 bg-slate-50/60">{ins.maxHours} ساعة</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                        ins.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                        ins.status === 'On Leave' ? 'bg-amber-100 text-amber-800' :
                                        'bg-rose-100 text-rose-800'
                                    }`}>
                                        {ins.status === 'Active' ? 'نشط (Active)' : ins.status === 'On Leave' ? 'إجازة (On Leave)' : 'مجمّد/مستقيل'}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleEdit(ins)}
                                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg font-bold flex items-center gap-1 mx-auto"
                                    >
                                        <i data-lucide="edit-3" className="w-4 h-4"></i>
                                        <span>تعديل</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentInstructor && (
                <InstructorProfileModal
                    instructor={currentInstructor}
                    departments={departments}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    showToast={showToast}
                />
            )}
        </div>
    );
}
