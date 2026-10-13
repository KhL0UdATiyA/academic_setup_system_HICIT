function DepartmentsView({ departments, setDepartments, regulations, showToast }) {
    const [selectedDept, setSelectedDept] = useState(null);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

    const handleAddDept = () => {
        setSelectedDept({
            id: '',
            code: '',
            nameAr: '',
            nameEn: '',
            head: '',
            regulationId: 'REG-2023',
            courseCount: 0,
            branchingRule: '',
        });
        setIsDeptModalOpen(true);
    };

    const handleEditDept = (dept) => {
        setSelectedDept({ ...dept });
        setIsDeptModalOpen(true);
    };

    const handleSaveDept = (e) => {
        e.preventDefault();
        if (departments.some(d => d.id === selectedDept.id && d.id !== '')) {
            setDepartments(departments.map(d => d.id === selectedDept.id ? selectedDept : d));
            showToast('تم تحديث البيانات المعتمدة للقسم الأكاديمي بنجاح');
        } else {
            const newDept = {
                ...selectedDept,
                id: selectedDept.code.toUpperCase() || `DEPT-${Date.now()}`
            };
            setDepartments([...departments, newDept]);
            showToast('تم إضافة القسم الأكاديمي الجديد إلى هيكل المعهد');
        }
        setIsDeptModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">إدارة الأقسام الأكاديمية (Departments Management)</h1>
                    <p className="text-slate-500 text-sm mt-1">هذه الصفحة مخصصة لإدارة وتحديد الأقسام الأكاديمية، تشعيبها وهياكلها.</p>
                </div>
                <button
                    onClick={handleAddDept}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition flex items-center gap-2"
                >
                    <i data-lucide="plus" className="w-4 h-4"></i>
                    <span>إضافة قسم أكاديمي جديد</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departments.map((dept) => (
                    <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
                                كود القسم: {dept.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                                المقررات المربوطة: <strong className="text-slate-800">{dept.courseCount} مقرر</strong>
                            </span>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{dept.nameAr}</h3>
                            <p className="text-xs text-slate-400 font-mono">{dept.nameEn}</p>
                        </div>

                        <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">رئيس القسم (Head of Dept):</span>
                                <span className="font-bold text-slate-800">{dept.head}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">اللائحة المربوط بها:</span>
                                <span className="font-bold text-blue-700">{dept.regulationId}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200">
                                <span className="text-slate-400 block mb-1 font-semibold">شروط التشعيب والتخصص (Branching Criteria):</span>
                                <span className="font-medium text-slate-700 block bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                                    {dept.branchingRule}
                                </span>
                            </div>
                        </div>

                        <div className="pt-1 flex justify-end">
                            <button
                                onClick={() => handleEditDept(dept)}
                                className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1"
                            >
                                <i data-lucide="edit-3" className="w-3.5 h-3.5"></i>
                                <span>تعديل بيانات القسم والشروط</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isDeptModalOpen && selectedDept && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleSaveDept} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-5 bg-slate-900 text-white font-bold flex items-center justify-between">
                            <span>{selectedDept.id ? 'تعديل بيانات قسم أكاديمي' : 'إضافة قسم أكاديمي جديد'}</span>
                            <button type="button" onClick={() => setIsDeptModalOpen(false)} title="إغلاق"><i data-lucide="x" className="w-5 h-5"></i></button>
                        </div>
                        <div className="p-6 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">كود القسم (Department Code):</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="مثال: CS, IS, IT, BS"
                                        value={selectedDept.code}
                                        onChange={(e) => setSelectedDept({ ...selectedDept, code: e.target.value.toUpperCase() })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 font-bold uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">اللائحة المربوطة:</label>
                                    <select
                                        value={selectedDept.regulationId}
                                        onChange={(e) => setSelectedDept({ ...selectedDept, regulationId: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
                                    >
                                        {regulations.map(r => <option key={r.id} value={r.code}>{r.code} - {r.title}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">اسم القسم باللغة العربية (Required):</label>
                                <input
                                    type="text"
                                    required
                                    value={selectedDept.nameAr}
                                    onChange={(e) => setSelectedDept({ ...selectedDept, nameAr: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">اسم القسم باللغة الإنجليزية:</label>
                                <input
                                    type="text"
                                    value={selectedDept.nameEn}
                                    onChange={(e) => setSelectedDept({ ...selectedDept, nameEn: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">تعيين رئيس القسم (Head of Dept):</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="أ.د. / د."
                                    value={selectedDept.head}
                                    onChange={(e) => setSelectedDept({ ...selectedDept, head: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl p-2.5"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">شروط التشعيب والتخصص (Branching Criteria):</label>
                                <textarea
                                    rows="3"
                                    value={selectedDept.branchingRule}
                                    onChange={(e) => setSelectedDept({ ...selectedDept, branchingRule: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl p-2.5"
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-100 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold">إلغاء</button>
                            <button type="submit" className="px-5 py-2 rounded-xl bg-blue-700 text-white font-bold">حفظ بيانات القسم</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
