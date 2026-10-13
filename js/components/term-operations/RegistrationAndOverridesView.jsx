function RegistrationAndOverridesView({ students, termOfferings, courses, overrideRequests, setOverrideRequests, searchQuery, showToast }) {
    const [activeTab, setActiveTab] = useState('requests');

    const filteredRequests = useMemo(() => {
        if (!searchQuery) return overrideRequests;
        const q = searchQuery.toLowerCase();
        return overrideRequests.filter(r =>
            r.id.toLowerCase().includes(q) ||
            r.studentName.includes(searchQuery) ||
            r.requestedCourse.toLowerCase().includes(q)
        );
    }, [overrideRequests, searchQuery]);

    const handleApproveOverride = (reqId) => {
        setOverrideRequests(overrideRequests.map(r => r.id === reqId ? { ...r, status: 'Approved' } : r));
        showToast('تم اعتماد وتفعيل الاستثناء الأكاديمي بنجاح!');
    };

    const handleRejectOverride = (reqId) => {
        setOverrideRequests(overrideRequests.map(r => r.id === reqId ? { ...r, status: 'Rejected' } : r));
        showToast('تم رفض طلب الاستثناء.', 'info');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">تسجيل الطلاب والتحقق والاستثناءات (Registration & Overrides)</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        متابعة محرك التسجيل الآلي، التحقق من المتطلبات والساعات، وإدارة طلبات التجاوز الاستثنائية.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            activeTab === 'requests' ? 'bg-blue-700 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        طلبات الاستثناء والموافقات ({overrideRequests.filter(r => r.status === 'Pending').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('simulation')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            activeTab === 'simulation' ? 'bg-blue-700 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        لوحة محرك الإرشاد والتسجيل الآلي
                    </button>
                </div>
            </div>

            {activeTab === 'requests' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                            <span className="text-xs font-bold text-amber-900 block">طلبات قيد المراجعة:</span>
                            <span className="text-2xl font-black text-amber-950">
                                {overrideRequests.filter(r => r.status === 'Pending').length} طلب
                            </span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                            <span className="text-xs font-bold text-emerald-900 block">استثناءات معتمدة:</span>
                            <span className="text-2xl font-black text-emerald-950">
                                {overrideRequests.filter(r => r.status === 'Approved').length} طلب
                            </span>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                            <span className="text-xs font-bold text-rose-900 block">طلبات مرفوضة:</span>
                            <span className="text-2xl font-black text-rose-950">
                                {overrideRequests.filter(r => r.status === 'Rejected').length} طلب
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                                <tr>
                                    <th className="p-4">كود الطلب والطالب</th>
                                    <th className="p-4">نوع الاستثناء (Override Type)</th>
                                    <th className="p-4">المقرر المطلوب</th>
                                    <th className="p-4">ملاحظات الأسباب الأكاديمية (Audit Log)</th>
                                    <th className="p-4">المرشد الأكاديمي</th>
                                    <th className="p-4 text-center">حالة الطلب</th>
                                    <th className="p-4 text-center">إجراءات القرار</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center p-8 text-slate-400 font-bold">لا توجد طلبات مطابقة.</td>
                                    </tr>
                                )}
                                {filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-bold text-slate-900">
                                            <span className="font-mono text-blue-700 block text-[11px]">{req.id}</span>
                                            <span>{req.studentName}</span>
                                        </td>
                                        <td className="p-4 font-bold text-purple-900">
                                            <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg inline-block">
                                                {req.typeAr}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">{req.requestedCourse}</td>
                                        <td className="p-4 text-slate-600 font-medium max-w-xs">{req.reason}</td>
                                        <td className="p-4 font-semibold text-slate-700">{req.advisorName}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {req.status === 'Approved' ? 'معتمد' : req.status === 'Pending' ? 'قيد المراجعة' : 'مرفوض'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {req.status === 'Pending' ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleApproveOverride(req.id)}
                                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                                                    >
                                                        موافقة
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectOverride(req.id)}
                                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px]"
                                                    >
                                                        رفض
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-semibold">- تم القرار -</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'simulation' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base">لوحة محرك الإرشاد وقواعد التسجيل الآلي (Automated Advising Engine Rules)</h3>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 text-slate-700">
                        <div className="font-bold text-blue-900">ضوابط المحرك الأكاديمي المطبقة تلقائياً:</div>
                        <ul className="list-disc list-inside space-y-1">
                            <li>فحص استيفاء المتطلب السابق (Prerequisite Check) واستبعاد المقررات غير المستوفاة تلقائياً.</li>
                            <li>فحص حد الساعات المسموح بها حسب المعدل التراكمي (18 ساعة للعادة، 12 للمُحذّر، 9 للصيفي).</li>
                            <li>إعطاء الأولوية القصوى للمواد الراسب فيها الطالب لمنع استمرار الإنذارات.</li>
                            <li>تسجيل أسباب وتفاصيل كل استثناء في سجل المراجعة (Audit Log).</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
