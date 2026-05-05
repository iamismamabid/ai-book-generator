"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";

export default function DownloadButton({ title }: { title: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const element = document.getElementById("book-content");
    if (!element) {
      alert("Error: Content container not found!");
      setLoading(false);
      return;
    }

    try {
      // 💡 প্রো-টিপ: html2canvas স্ক্রল করা অবস্থায় থাকলে ঠিকমতো রেন্ডার করতে পারে না।
      // তাই ক্যাপচার করার ঠিক আগে পেজটিকে সাময়িকভাবে একদম ওপরে নিয়ে যাওয়া হলো।
      const originalScrollPos = window.scrollY;
      window.scrollTo(0, 0);

      // scale: 2 দিলে পিডিএফে টেক্সট ফেটে যায় না, পরিষ্কার থাকে
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true, // ক্রস-অরিজিন ফন্ট বা ডিজাইনের জন্য
        backgroundColor: "#FDFCFB" // কালো ব্যাকগ্রাউন্ড এড়ানোর জন্য
      });
      
      // ক্যাপচার শেষ, এবার ইউজারকে আগের জায়গায় ফিরিয়ে দিন
      window.scrollTo(0, originalScrollPos);

      const imgData = canvas.toDataURL("image/png");

      // 🚨 "wrong PNG signature" এরর সলভ করার মূল লজিক!
      if (imgData === "data:," || imgData.length < 20) {
        throw new Error("Canvas is empty. html2canvas failed to capture the DOM.");
      }

      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      // ফাইলের নাম স্পেস ছাড়া সেভ করা
      const safeTitle = title.replace(/\s+/g, "_");
      pdf.save(`${safeTitle}.pdf`);
      
    } catch (error) {
      console.error(error);
      alert("Failed to create PDF! The content might not be fully loaded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
        loading 
          ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
          : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg"
      }`}
    >
      {loading ? "⌛ Generating PDF..." : "📥 Download PDF"}
    </button>
  );
}