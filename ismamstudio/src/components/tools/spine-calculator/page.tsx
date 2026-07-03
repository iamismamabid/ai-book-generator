"use client";


import React, { useState } from 'react';

// ১. পেপারের ধরন নির্দিষ্ট করে দেওয়া হলো (যাতে অন্য কোনো স্ট্রিং না বসে)
type PaperType = 'white' | 'cream' | 'color';

// ২. ক্যালকুলেশন রেজাল্টের জন্য ইন্টারফেস (Interface) তৈরি
interface Dimensions {
    spine: string;
    width: string;
    height: string;
}

const SpineCalculator: React.FC = () => {
    // ৩. State-গুলোতে এক্সপ্লিসিট (Explicit) টাইপ যোগ করা হলো
    const [trimWidth, setTrimWidth] = useState<number>(6);
    const [trimHeight, setTrimHeight] = useState<number>(9);
    const [pageCount, setPageCount] = useState<number>(100);
    const [paperType, setPaperType] = useState<PaperType>('white');

    // ৪. ফাংশনের রিটার্ন টাইপ নির্দিষ্ট করা হলো
    const calculateDimensions = (): Dimensions => {
        let spineMultiplier = 0.002252; // Default White
        if (paperType === 'cream') spineMultiplier = 0.0025;
        if (paperType === 'color') spineMultiplier = 0.002347;

        const spineWidth = pageCount * spineMultiplier;
        const fullWidth = trimWidth * 2 + spineWidth + 0.25; // 0.125" bleed on both sides
        const fullHeight = trimHeight + 0.25; // 0.125" bleed on top and bottom

        return {
            spine: spineWidth.toFixed(3),
            width: fullWidth.toFixed(3),
            height: fullHeight.toFixed(3),
        };
    };

    const dimensions = calculateDimensions();

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                KDP Book Spine & Cover Calculator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Trim Size (Width x Height)</label>
                        <div className="flex space-x-2 mt-1">
                            <input
                                type="number"
                                value={trimWidth}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrimWidth(Number(e.target.value))}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Width (e.g., 6)"
                            />
                            <span className="py-2 text-gray-500">x</span>
                            <input
                                type="number"
                                value={trimHeight}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrimHeight(Number(e.target.value))}
                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Height (e.g., 9)"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Page Count</label>
                        <input
                            type="number"
                            value={pageCount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageCount(Number(e.target.value))}
                            className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            min="24"
                            max="828"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Paper Type</label>
                        <select
                            value={paperType}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaperType(e.target.value as PaperType)}
                            className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="white">White Paper</option>
                            <option value="cream">Cream Paper</option>
                            <option value="color">Color Paper</option>
                        </select>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                        Calculated Dimensions
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Spine Width:</span>
                            <span className="font-bold text-blue-600">{dimensions.spine}"</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Full Cover Width:</span>
                            <span className="font-bold text-blue-600">{dimensions.width}"</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Full Cover Height:</span>
                            <span className="font-bold text-blue-600">{dimensions.height}"</span>
                        </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-500 italic">
                        * Includes standard 0.125" bleed requirement for Amazon KDP.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpineCalculator;