function DepartmentBranchingModal({ departments, onClose, showToast }) {
    const [isAllocating, setIsAllocating] = useState(false);

    const handleAllocate = () => {
        setIsAllocating(true);
        setTimeout(() => {
            setIsAllocating(false);
            showToast('تم اعتماد نتيجة التشعيب وتوزيع جميع طلاب المستوى الثاني على الأقسام بنجاح!');
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-5 font-bold flex items-center justify-between">
                    <span>اعتماد التنسيق التلقائي للأقسام (Capacity Balancing)</span>
                    <button onClick={onClose}><i data-lucide="x" className="w-5 h-5"></i></button>
                </div>
                <div className="p-6 space-y-4 text-xs">
                    <p className="text-slate-600 leading-relaxed font-semibold">
                        سيتم توزيع الطلاب بناءً على المجموع المرجح والـ CGPA مع الالتزام بالحد الأقصى لكل قسم:
                    </p>
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center font-bold">
                            <span>قسم علوم الحاسب (CS):</span>
                            <span className="text-blue-700">120/120 مقعد (مكتمل)</span>
                        </div>
                        <div className="flex justify-between items-center font-bold">
                            <span>قسم نظم المعلومات (IS):</span>
                            <span className="text-emerald-700">100/120 مقعد</span>
                        </div>
                        <div className="flex justify-between items-center font-bold">
                            <span>قسم تكنولوجيا المعلومات (IT):</span>
                            <span className="text-emerald-700">80/100 مقعد</span>
                        </div>
                    </div>
                    <button
                        onClick={handleAllocate}
                        disabled={isAllocating}
                        className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold shadow flex items-center justify-center gap-2"
                    >
                        {isAllocating ? <span>جاري الحساب والتنسيق...</span> : <span>تطبيق الاعتماد النهائي للفرقة</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// =====================================================================
// TERM OPERATIONS VIEWS
// =====================================================================
