"use client";
import { useState } from "react";
import { updateChapter } from "../../actions";

export default function EditableChapter({ chapter }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(chapter.content);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await updateChapter(chapter.id, content);
    setIsEditing(false);
    setLoading(false);
  };

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-8 bg-white border-2 border-indigo-100 rounded-[2rem] font-serif text-xl leading-relaxed outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
          <div className="flex gap-3">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button 
              onClick={() => setIsEditing(false)} 
              className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute -right-4 -top-4 opacity-0 group-hover:opacity-100 bg-white border border-slate-100 p-3 rounded-xl shadow-lg hover:text-indigo-600 transition-all z-10"
            title="Edit Chapter"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <div className="prose prose-indigo prose-xl font-serif text-slate-700 leading-[1.8] whitespace-pre-wrap">
            {chapter.content}
          </div>
        </div>
      )}
    </div>
  );
}