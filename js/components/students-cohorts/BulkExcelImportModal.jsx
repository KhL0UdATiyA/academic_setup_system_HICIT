function BulkExcelImportModal({ onClose, showToast }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleSimulateImport = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            showToast('تم استيراد ومعالجة شيت إكسل الطلاب المستجدين (45 طالب) بنجاح!');
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-5 font-bold flex items-center justify-between">
                    <span>رفع شيت إكسل دفعة كاملة (Bulk Excel Import)</span>
                    <button onClick={onClose}><i data-lucide="x" className="w-5 h-5"></i></button>
                </div>
                <div className="p-6 space-y-4 text-center text-xs">
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                        <i data-lucide="file-up" className="w-12 h-12 text-blue-600 mx-auto mb-2"></i>
                        <span className="block font-bold text-slate-800">اسحب ملف إكسل (.xlsx, .csv) هنا</span>
                        <span className="text-[10px] text-slate-400">أو انقر لاستعراض الملفات من الجهاز</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                        سيتم مطابقة حقول الرقم القومي، الاسم، والمجموع آلياً مع شروط القبول باللائحة.
                    </p>
                    <button
                        onClick={handleSimulateImport}
                        disabled={isUploading}
                        className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold shadow flex items-center justify-center gap-2"
                    >
                        {isUploading ? <span>جاري المعالجة...</span> : <span>بدء رفع الشيت ومعالجته</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}
