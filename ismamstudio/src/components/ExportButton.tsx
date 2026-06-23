"use client";

import {jsPDF } from "jspdf";
import { Download } from "lucide-react";

interface ExportButtonProps{
    title?: string;
    content?: string;

}

export default function ExportButton({title = "My Book", content = "No content available."}: ExportButtonProps){
    const handleDownload = () =>{
        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(title,20,30);


        doc.setFont("helvetica","normal");
        doc.setFontSize(12);

      const splitText = doc.splitTextToSize(content,170);
      doc.text(splitText,20,50);

      doc.save(`${title.replace(/\s+/g,"_")}.pdf`);
    };

    return(
        <button
        onClick = {handleDownload}
        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-indigo-600 shadow-md transition-all active:scale-95 pointer-events-auto"
     >
        <Download className="w-4 h-4"/>Export PDF
     </button>
    
    );
}

