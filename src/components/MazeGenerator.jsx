'use client'; // Required if you are using Next.js App Router

import React, { useState, useEffect } from 'react';
import { generateMazeSVG } from '../utils/mazeGenerator';

export default function MazeGenerator() {
  const [shape, setShape] = useState('heart');
  const [gridSize, setGridSize] = useState(32);
  const [showSolution, setShowSolution] = useState(false);
  const [mazeSvg, setMazeSvg] = useState('');

  // Generate maze whenever settings change
  useEffect(() => {
    handleGenerate();
  }, [shape, gridSize, showSolution]);

  const handleGenerate = () => {
    const newSvg = generateMazeSVG(gridSize, shape, showSolution);
    setMazeSvg(newSvg);
  };

  // Function to let users download the SVG file for their KDP books
  const handleDownloadSVG = () => {
    if (!mazeSvg) return;
    const blob = new Blob([mazeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kdp-${shape}-maze-${showSolution ? 'solution' : 'puzzle'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">KDP Shaped Maze Generator</h2>

      {/* Control Panel */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center bg-gray-50 p-4 rounded-md border border-gray-200">
        
        {/* Shape Selector */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-600 mb-1">Shape</label>
          <select 
            value={shape} 
            onChange={(e) => setShape(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="square">Square</option>
            <option value="circle">Circle</option>
            <option value="heart">Heart</option>
            {/* NEW TRIANGLE OPTION ADDED HERE */}
            <option value="triangle">Triangle</option>
          </select>
        </div>

        {/* Grid Size Selector */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-600 mb-1">Grid Size</label>
          <select 
            value={gridSize} 
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value={20}>20 x 20 (Easy)</option>
            <option value={32}>32 x 32 (Medium)</option>
            <option value={40}>40 x 40 (Hard)</option>
          </select>
        </div>

        {/* Toggle Solution */}
        <div className="flex items-end">
          <button 
            onClick={() => setShowSolution(!showSolution)}
            className={`p-2 rounded font-medium border ${
              showSolution 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
        </div>
      </div>

      {/* Maze Preview Area */}
      <div className="flex justify-center mb-8">
        <div 
          className="w-[400px] h-[400px] border-2 border-dashed border-gray-300 p-2 flex items-center justify-center bg-white"
          dangerouslySetInnerHTML={{ __html: mazeSvg || '<p>Loading...</p>' }} 
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={handleGenerate}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Regenerate Maze
        </button>
        
        <button 
          onClick={handleDownloadSVG}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
        >
          Download SVG
        </button>
      </div>
      
    </div>
  );
}