import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export const alt = 'KDPage — All-in-One KDP Book Creation Toolkit';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          backgroundImage: 'radial-gradient(circle at 50% 0%, #1E1B4B 0%, #0F172A 70%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Decorative Grid Lines */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.08,
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating Gradient Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          }}
        />

        {/* Top Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 24px',
            borderRadius: '999px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            color: '#A5B4FC',
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '28px',
          }}
        >
          ✨ All-In-One KDP Publishing Suite
        </div>

        {/* Main Brand Title */}
        <div
          style={{
            fontSize: '76px',
            fontWeight: '900',
            letterSpacing: '-2px',
            background: 'linear-gradient(to right, #FFFFFF, #E0E7FF, #818CF8)',
            backgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center',
            marginBottom: '16px',
            lineHeight: 1.1,
          }}
        >
          KDPage Studio
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '26px',
            color: '#94A3B8',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Create Professional Puzzle Books, Custom Interiors &amp; Print-Ready Covers for Amazon KDP in Minutes.
        </div>

        {/* Tool Feature Tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          {['🧩 Sudoku', '🌀 Mazes', '🔍 Word Search', '✏️ Crosswords', '🎨 Cover Studio', '📐 Spine Calculator'].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: '10px 20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#F8FAFC',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
