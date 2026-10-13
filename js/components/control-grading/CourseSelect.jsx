// =====================================================================
// CONTROL & GRADING  (3 screens - 40% year-work / 60% final)
// =====================================================================
function CourseSelect({ courses, value, onChange }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-slate-100 border border-slate-300 font-bold rounded-xl px-3 py-2 text-xs focus:bg-white">
            {courses.map(c => <option key={c.id} value={c.code}>{c.code} - {c.nameAr}</option>)}
        </select>
    );
}
