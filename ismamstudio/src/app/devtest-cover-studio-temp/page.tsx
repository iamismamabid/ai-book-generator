"use client";

// TEMPORARY dev-only harness to visually verify FabricCoverStudio changes
// without needing a signed-in premium account. Not linked from anywhere.
// Delete before committing.

import dynamic from "next/dynamic";
import { useState } from "react";

const FabricCoverStudio = dynamic(() => import("@/components/FabricCoverStudio"), { ssr: false });

const TRIM_SIZES = [
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
];

export default function DevTestCoverStudio() {
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [pageCount, setPageCount] = useState(100);
  const [coverBackground, setCoverBackground] = useState({
    backCoverColor: '#0F172A',
    backCoverType: 'solid' as 'solid' | 'gradient',
    backCoverGradientStart: '#0F172A',
    backCoverGradientEnd: '#312E81',
    frontCoverColor: '#0F172A',
    frontCoverType: 'solid' as 'solid' | 'gradient',
    frontCoverGradientStart: '#0F172A',
    frontCoverGradientEnd: '#312E81',
    backCoverImage: '',
    frontCoverImage: '',
    fullCoverImage: '',
  });
  const [showKdpGuides, setShowKdpGuides] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [coverElements, setCoverElements] = useState<any[]>([]);

  return (
    <div style={{ height: "100vh" }}>
      <FabricCoverStudio
        trimSize={trimSize}
        setTrimSize={setTrimSize}
        pageCount={pageCount}
        setPageCount={setPageCount}
        coverBackground={coverBackground}
        setCoverBackground={setCoverBackground}
        showKdpGuides={showKdpGuides}
        setShowKdpGuides={setShowKdpGuides}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        initialElements={coverElements}
        onSaveWorkspace={(elements: any) => setCoverElements(elements)}
      />
    </div>
  );
}
