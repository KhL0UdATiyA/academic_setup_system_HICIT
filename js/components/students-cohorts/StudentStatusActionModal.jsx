function StudentStatusActionModal({ student, onClose, onSave }) {
    const [formData, setFormData] = useState({ ...student });
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-5 font-bold flex items-center justify-between">
                    <span>استثناءات وإجراءات الطالب ({student.nameAr})</span>
                    <button onClick={onClose}><i data-lucide="x" className="w-5 h-5"></i></button>
                </div>
                <div className="p-6 space-y-4 text-xs">
                    <div>
                        <label className="block font-bold mb-1">تحديد حد الساعات المسموح به (Override Max Hours):</label>
                        <input
                            type="number"
                            placeholder="أدخل عدد الساعات المستثناة (مثال 14 أو 15 ساعة)"
                            value={formData.maxCreditOverride || ''}
                            onChange={(e) => setFormData({ ...formData, maxCreditOverride: e.target.value ? Number(e.target.value) : null })}
                            className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-purple-800"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold mb-1">عدّاد الإنذارات الأكاديمية:</label>
                            <input
                                type="number"
                                min="0"
                                max="4"
                                value={formData.warningCount}
                                onChange={(e) => setFormData({ ...formData, warningCount: Number(e.target.value) })}
                                className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-rose-700"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-1">الحالة الأكاديمية الرئيسية:</label>
                            <select
                                value={formData.academicStatus}
                                onChange={(e) => setFormData({ ...formData, academicStatus: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
                            >
                                <option value="Regular">منتظم (Regular)</option>
                                <option value="Academic Warning">محذر أكاديمياً</option>
                                <option value="Suspended">موقوف/مجمد قيد</option>
                                <option value="Transferred">محول خارجي</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold mb-1">سبب الاستثناء والملاحظة الأكاديمية (Audit Log):</label>
                        <textarea
                            rows="3"
                            placeholder="اكتب سبب القرار أو موافقة العميد/الكنترول..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl p-2.5"
                        ></textarea>
                    </div>
                </div>
                <div className="p-4 bg-slate-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white border font-bold">إلغاء</button>
                    <button onClick={() => onSave(formData)} className="px-5 py-2 rounded-xl bg-blue-700 text-white font-bold">حفظ الاستثناء والقرار</button>
                </div>
            </div>
        </div>
    );
}
