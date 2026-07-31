"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { 
  Type, Square, Circle as CircleIcon, Star, Ruler, 
  Trash2, Undo2, Redo2, Loader2, Download, Check, Settings,
  Sparkles, Shapes, Upload, LayoutTemplate, Grid, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Plus, Eraser, Lock, Unlock, Copy, Scissors, Clipboard, ChevronsUp, ChevronsDown,
  Bold, Italic, Underline, AlignJustify, Box
} from "lucide-react";
import { jsPDF } from "jspdf";
import { calculateKdpLayout, KdpSpecs, KdpLayoutResult } from "@/app/utils/kdpLayout";
import { initFabricSnapping } from "@/hooks/useFabricSnap";
import { COVER_TEMPLATES, resolveTemplateElements, CoverTemplate } from "@/lib/coverTemplates";
import TemplateGalleryModal from "@/components/TemplateGalleryModal";
import CoverMockup3DModal from "@/components/CoverMockup3DModal";

const FONT_CATEGORIES: { category: string; fonts: string[] }[] = [
  { category: "System", fonts: ["Arial", "Georgia", "Times New Roman", "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS", "Arimo"] },
  { category: "Sans Serif", fonts: ["Inter", "Outfit", "Montserrat", "Poppins", "Raleway", "Nunito", "Work Sans", "Rubik", "DM Sans", "Archivo", "Karla", "Mulish", "Manrope", "Josefin Sans"] },
  { category: "Serif", fonts: ["Playfair Display", "Merriweather", "Lora", "Cormorant Garamond", "Crimson Text", "PT Serif", "Libre Baskerville", "EB Garamond", "Cinzel", "Bitter", "Noto Serif", "Vollkorn", "Domine", "Spectral"] },
  { category: "Display & Bold", fonts: ["Bebas Neue", "Oswald", "Anton", "Passion One", "Alfa Slab One", "Bungee", "Fjalla One", "Righteous", "Staatliches", "Abril Fatface", "Bangers", "Titan One", "Luckiest Guy", "Big Shoulders Display"] },
  { category: "Handwriting & Script", fonts: ["Pacifico", "Sacramento", "Great Vibes", "Dancing Script", "Caveat", "Satisfy", "Kalam", "Shadows Into Light", "Amatic SC", "Permanent Marker", "Indie Flower", "Homemade Apple"] },
  { category: "Monospace", fonts: ["Courier Prime", "Space Mono", "JetBrains Mono", "IBM Plex Mono"] },
];

const FONT_FAMILIES = FONT_CATEGORIES.flatMap(c => c.fonts);

// Fonts that need loading from Google Fonts (i.e. everything except the browser-native System group)
const GOOGLE_FONT_FAMILIES = FONT_CATEGORIES.filter(c => c.category !== "System").flatMap(c => c.fonts);

// Photoshop-style layer compositing modes (native canvas globalCompositeOperation)
const BLEND_MODES = [
  { value: "source-over", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
  { value: "color-dodge", label: "Color Dodge" },
  { value: "color-burn", label: "Color Burn" },
  { value: "hard-light", label: "Hard Light" },
  { value: "soft-light", label: "Soft Light" },
  { value: "difference", label: "Difference" },
  { value: "exclusion", label: "Exclusion" },
  { value: "hue", label: "Hue" },
  { value: "saturation", label: "Saturation" },
  { value: "color", label: "Color" },
  { value: "luminosity", label: "Luminosity" },
];

// Fixed 3x3 sharpen convolution kernel (fabric.Image.filters.Convolute)
const SHARPEN_MATRIX = [0, -1, 0, -1, 5, -1, 0, -1, 0];

const CLIPARTS = [
  { name: "Quantum Propulsion", src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80" },
  { name: " containment field", src: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80" },
  { name: "Warp Schematic", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80" },
  { name: "Magnetic Coil", src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=300&q=80" },
  { name: "FAA Flight Orbit", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80" }
];

const KDP_ICONS_LIBRARY = [
  {
    category: "Planners & Trackers",
    icons: [
      { name: "Checkbox", path: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm4 9l3 3 6-6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Checked Box", path: "M9 11l3 3L22 4 M20 12v8H4V4h16v2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Clock", path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-15v5h4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Hourglass", path: "M5 2h14v4l-4 4 4 4v4H5v-4l4-4-4-4V2zm0 18h14M5 4h14M12 10l-3-3h6l-3 3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Calendar Grid", path: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-14 2h14v2H5V6zm0 4h14v10H5V10z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Calendar Day", path: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-14 2h14v2H5V6zm3 6h3v3H8v-3z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Empty Grid", path: "M3 3h18v18H3zm0 6h18M3 15h18M9 3v18M15 3v18", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "To-Do List", path: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Habit Circle", path: "M12 2a10 10 0 1 0 10 10 A10 10 0 0 0 12 2 M12 6v6l4 2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Mood Sun", path: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Mood Cloud", path: "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Mood Rain", path: "M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25 M8 20v2 M12 20v2 M16 20v2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Moon & Sleep", path: "M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 1-9-9z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Heart Rate", path: "M22 12h-4l-3 9L9 3l-3 9H2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Scale & Weight", path: "M12 2a10 10 0 0 1 10 10v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6A10 10 0 0 1 12 2zm0 18V10 M8 13.5l4-2.5 4 2.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Kettlebell", path: "M12 8A5 5 0 0 0 7 13v5a5 5 0 0 0 10 0v-5A5 5 0 0 0 12 8zm0-6a3 3 0 0 1 3 3v3H9V5a3 3 0 0 1 3-3z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Water Drop", path: "M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13s-7 8.7-7 13a7 7 0 0 0 7 7z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Coffee Cup", path: "M17 8H3v8a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V8zm0 2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M6 2v2 M10 2v2 M14 2v2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Spoon & Fork", path: "M18 2v10H14V2 M16 12v8 M6 2v6c0 1.5 2 2.5 2 2.5V20 M10 2v6c0 1.5-2 2.5-2 2.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Key & Security", path: "M21 2l-10 10 M11 12v5h3v-2h2v-3h3 M3 21a4 4 0 1 1 5-5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Note & Pin", path: "M16 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12v-6h6V4a2 2 0 0 0-2-2zm0 20l6-6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Folder", path: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Contact & Bio",
    icons: [
      { name: "Envelope", path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Opened Envelope", path: "M22 18V8 M2 18V8 M2 8l10 6 10-6 M2 18h20 M2 8h20 M12 2L2 8h20z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Phone (Modern)", path: "M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Phone (Classic)", path: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Globe", path: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2 M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Link", path: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Map Pin", path: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Map", path: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zm6-3v15m6-12v15", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "User Card", path: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M20 8h2 M20 12h2 M20 16h2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Users (Group)", path: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Chat Bubble", path: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Chat Double", path: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 M17 15h-4l-3 3V15a6 6 0 1 1 7-3.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Instagram", path: "M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zm-5 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm5.5-.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Twitter & X", path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "YouTube", path: "M22.54 6.42a2.78 2.78 0 0 0-1.95-2C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 2C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z M9.75 15.02V8.98L15 12z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Pinterest", path: "M12 2a10 10 0 0 0-1.9 19.8c.2-1.5.5-3.8.8-5.4l1-4.2c-.3-.6-.5-1.4-.5-2.2 0-2 1.2-3.5 2.6-3.5 1.2 0 1.8.9 1.8 2 0 1.2-.8 3-1.2 4.7-.3 1.4.7 2.5 2.1 2.5 2.5 0 4.2-3.3 4.2-7.2 0-3-2-5.3-5.8-5.3-4.2 0-6.8 3.1-6.8 6.6 0 1.2.3 2.1.8 2.7l-1 4.2c-.4 1.7-1.2 3.4-1.8 5.1a10 10 0 1 0 9.7-.1z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Share", path: "M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7 M16 6l-4-4-4 4 M12 2v13", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Bio Pen", path: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Cover Marketing",
    icons: [
      { name: "Ribbon Banner", path: "M15 5H9a2 2 0 0 0-2 2v14l5-4 5 4V7a2 2 0 0 0-2-2z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Starburst (8-pt)", path: "M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Starburst (12-pt)", path: "M12 2l1.9 4.3 4.7-1.3-1.3 4.7 4.3 1.9-4.3 1.9 1.3 4.7-4.7-1.3-1.9 4.3-1.9-4.3-4.7 1.3 1.3-4.7-4.3-1.9 4.3-1.9-1.3-4.7 4.7 1.3z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Starburst (16-pt)", path: "M12 2l1.2 3.8 3.5-1.9.3 4 3.9-.7-1.2 3.8 3.5 1.9-3.5 1.9 1.2 3.8-3.9-.7-.3 4-3.5-1.9-1.2 3.8-1.2-3.8-3.5 1.9-.3-4-3.9.7 1.2-3.8-3.5-1.9 3.5-1.9-1.2-3.8 3.9.7.3-4 3.5 1.9z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Award Seal", path: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ribbon Seal", path: "M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8 13.5L4 22l8-3 8 3-4-8.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Shield", path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Trophy", path: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34 M12 2a7 7 0 0 0-7 7v4.66a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Crown", path: "M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Stamp", path: "M21 18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3h18z M12 15V8 M8 8V5a4 4 0 0 1 8 0v3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Sale Tag", path: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Price Label", path: "M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4 M2 15v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4 M2 9h20 M7 9v6", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Percent Tag", path: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M9 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-6 4l6-6", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Megaphone", path: "M11.67 8.11l7.85-4.47a1 1 0 0 1 1.48.88v15a1 1 0 0 1-1.48.88l-7.85-4.47 M3 8h8.67v8H3a3 3 0 0 1 0-6z M23 12h-2.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Target", path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-16a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Fingerprint", path: "M12 2a10 10 0 0 0-10 10M12 6a6 6 0 0 0-6 6 M12 10a2 2 0 0 0-2 2 M14 12a2 2 0 0 1-2 2 M18 12a6 6 0 0 1-6 6 M22 12a10 10 0 0 1-10 10", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Lock", path: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Keyhole", path: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm0-13a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-1.5 5.5l3 3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Compass", path: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm4.24-14.24l-3 7.07-7.07 3 3-7.07 7.07-3z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ribbon Knot", path: "M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0c-2.5 0-5 3-5 7 0 5 5 9 5 9s5-4 5-9c0-4-2.5-7-5-7z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Decorative Flourishes",
    icons: [
      { name: "Chapter Divider (Diamond)", path: "M 5 50 H 35 L 43 40 L 50 50 L 43 60 L 35 50 H 5 M 95 50 H 65 L 57 40 L 50 50 L 57 60 L 65 50 H 95", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 100 },
      { name: "Chapter Divider (Scroll)", path: "M 5 50 H 40 L 45 42 L 50 50 L 45 58 L 40 50 H 95", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 100 },
      { name: "Corner Ornament L", path: "M 10 10 H 90 V 25 H 25 V 90 H 10 Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 100 },
      { name: "Corner Ornament Swirl", path: "M 10 10 C 50 10, 90 50, 90 90 M 10 10 V 50 C 30 50, 50 30, 50 10 M 15 15 H 45 V 45 H 15 Z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 100 },
      { name: "Vine Flourish", path: "M 10 90 C 20 60, 40 40, 90 10 M 30 70 C 40 80, 50 70, 55 60 M 60 40 C 70 30, 80 40, 75 50", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 100 },
      { name: "Frame Border", path: "M 10 10 H 90 V 90 H 10 Z M 15 15 H 85 V 85 H 15 Z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 100 },
      { name: "Double Border Frame", path: "M 5 5 H 95 V 95 H 5 Z M 12 12 H 88 V 88 H 12 Z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 100 },
      { name: "Geometric Frame", path: "M 50 5 L 90 28 L 90 72 L 50 95 L 10 72 L 10 28 Z M 50 12 L 84 32 L 84 68 L 50 88 L 16 68 L 16 32 Z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 100 },
      { name: "Star (5-point)", path: "M 50 5 L 63 35 L 95 38 L 71 60 L 78 92 L 50 77 L 22 92 L 29 60 L 5 38 L 37 35 Z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 100 },
      { name: "Star (4-point)", path: "M 50 5 L 62 38 L 95 50 L 62 62 L 50 95 L 38 62 L 5 50 L 38 38 Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 100 },
      { name: "Heart (Solid)", path: "M 50 85 C 10 50, 20 15, 50 30 C 80 15, 90 50, 50 85 Z", fill: "#EF4444", stroke: "#EF4444", strokeWidth: 1, viewBox: 100 },
      { name: "Heart (Outline)", path: "M 50 85 C 10 50, 20 15, 50 30 C 80 15, 90 50, 50 85 Z", fill: "transparent", stroke: "#EF4444", strokeWidth: 2, viewBox: 100 },
      { name: "Sparkle (Solid)", path: "M 50 10 C 50 40, 60 50, 90 50 C 60 50, 50 60, 50 90 C 50 60, 40 50, 10 50 C 40 50, 50 40, 50 10 Z", fill: "#F59E0B", stroke: "#F59E0B", strokeWidth: 1, viewBox: 100 },
      { name: "Sparkle (Outline)", path: "M 50 10 C 50 40, 60 50, 90 50 C 60 50, 50 60, 50 90 C 50 60, 40 50, 10 50 C 40 50, 50 40, 50 10 Z", fill: "transparent", stroke: "#F59E0B", strokeWidth: 2, viewBox: 100 },
      { name: "Cross", path: "M 40 10 H 60 V 35 H 85 V 55 H 60 V 90 H 40 V 55 H 15 V 35 H 40 Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 100 },
      { name: "Leaf", path: "M 10 90 C 10 40, 40 10, 90 10 C 90 60, 60 90, 10 90 Z M 10 90 L 50 50 M 35 35 C 45 45, 55 35, 60 30", fill: "transparent", stroke: "#10B981", strokeWidth: 1.5, viewBox: 100 },
      { name: "Flower Outline", path: "M 50 35 C 40 15, 60 15, 50 35 M 65 50 C 85 40, 85 60, 65 50 M 50 65 C 60 85, 40 85, 50 65 M 35 50 C 15 60, 15 40, 35 50 M 50 40 A 10 10 0 1 1 50 60 A 10 10 0 1 1 50 40 Z", fill: "transparent", stroke: "#EC4899", strokeWidth: 1.5, viewBox: 100 },
      { name: "Diamond Flourish", path: "M 50 15 L 85 50 L 50 85 L 15 50 Z M 50 25 L 75 50 L 50 75 L 25 50 Z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 100 },
      { name: "Scroll Swirl", path: "M 10 50 C 10 20, 40 20, 50 50 C 60 80, 90 80, 90 50 M 20 50 A 10 10 0 1 1 40 50 M 80 50 A 10 10 0 1 1 60 50", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 100 },
      { name: "Wave Line", path: "M 5 50 C 20 20, 30 80, 50 50 C 70 20, 80 80, 95 50", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 100 }
    ]
  },
  {
    category: "Educational & Kids",
    icons: [
      { name: "Tracing A (Dotted)", path: "M4 20L12 4l8 16M7 14h10", fill: "transparent", stroke: "#000000", strokeWidth: 2, strokeDashArray: [4, 4], viewBox: 24 },
      { name: "Tracing B (Dotted)", path: "M4 2v20 M4 2h8a5 5 0 0 1 0 10H4 M4 12h9a5 5 0 0 1 0 10H4", fill: "transparent", stroke: "#000000", strokeWidth: 2, strokeDashArray: [4, 4], viewBox: 24 },
      { name: "Tracing C (Dotted)", path: "M18 6a6 6 0 1 0 0 12", fill: "transparent", stroke: "#000000", strokeWidth: 2, strokeDashArray: [4, 4], viewBox: 24 },
      { name: "Tracing D (Dotted)", path: "M4 2v20 M4 2h7a9 9 0 0 1 0 18H4", fill: "transparent", stroke: "#000000", strokeWidth: 2, strokeDashArray: [4, 4], viewBox: 24 },
      { name: "Tracing Circle", path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", fill: "transparent", stroke: "#000000", strokeWidth: 2, strokeDashArray: [4, 4], viewBox: 24 },
      { name: "Tracing Square", path: "M3 3h18v18H3z", fill: "transparent", stroke: "#000000", strokeWidth: 2, strokeDashArray: [4, 4], viewBox: 24 },
      { name: "Tracing Triangle", path: "M12 3l9 16H3z", fill: "transparent", stroke: "#000000", strokeWidth: 2, strokeDashArray: [4, 4], viewBox: 24 },
      { name: "Plus Sign", path: "M12 5v14 M5 12h14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Minus Sign", path: "M5 12h14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Multiply Sign", path: "M5 5l14 14 M19 5L5 19", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Divide Sign", path: "M12 6m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M12 18m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M5 12h14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Equal Sign", path: "M5 9h14 M5 15h14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Arrow Right", path: "M5 12h14 M12 5l7 7-7 7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Arrow Left", path: "M19 12H5 M12 5l-7 7 7 7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Arrow Up Right", path: "M7 17L17 7 M7 7h10v10", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Pencil", path: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ruler", path: "M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 6h4 M5 12h6 M5 16h4", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Calculator", path: "M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z M8 6h8v4H8 M8 14h2 M14 14h2 M8 18h2 M14 18h2", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Graduation Cap", path: "M22 10v6M2 10l10-5 10 5-10 5z M6 12.5V16a6 6 0 0 0 12 0v-3.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Open Book", path: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Stacked Books", path: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20 M6 2v15 M10 2v15 M14 2v15 M18 2v15", fill: "transparent", stroke: "#000000", strokeWidth: 1.5, viewBox: 24 },
      { name: "Lightbulb", path: "M9 21h6 M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  }
];

const BACKGROUNDS = [
  { name: "Midnight Space", back: "#05070F", front: "#0F172A", type: 'gradient', backStart: '#020617', backEnd: '#0f172a', frontStart: '#0f172a', frontEnd: '#1e1b4b' },
  { name: "Watercolor Sunset", back: "#FEF08A", front: "#FECDD3", type: 'gradient', backStart: '#fef08a', backEnd: '#fde047', frontStart: '#fde047', frontEnd: '#fecdd3' },
  { name: "Botanical Forest", back: "#064E3B", front: "#022C22", type: 'gradient', backStart: '#064e3b', backEnd: '#022c22', frontStart: '#022c22', frontEnd: '#022c22' },
  { name: "Vintage Cream", back: "#FEF3C7", front: "#FDE68A", type: 'solid', backStart: '#FEF3C7', backEnd: '#FEF3C7', frontStart: '#FDE68A', frontEnd: '#FDE68A' },
  { name: "Cyberpunk Glow", back: "#030712", front: "#3B0764", type: 'gradient', backStart: '#030712', backEnd: '#111827', frontStart: '#111827', frontEnd: '#3b0764' }
];

const TRIM_SIZES = [
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

interface FabricCoverStudioProps {
  trimSize: { label: string; w: number; h: number };
  setTrimSize: (size: any) => void;
  pageCount: number;
  setPageCount: (cnt: number) => void;
  
  coverBackground: {
    backCoverColor: string;
    backCoverType: 'solid' | 'gradient';
    backCoverGradientStart: string;
    backCoverGradientEnd: string;
    frontCoverColor: string;
    frontCoverType: 'solid' | 'gradient';
    frontCoverGradientStart: string;
    frontCoverGradientEnd: string;
    backCoverImage: string;
    frontCoverImage: string;
    fullCoverImage: string;
  };
  setCoverBackground: React.Dispatch<React.SetStateAction<{
    backCoverColor: string;
    backCoverType: 'solid' | 'gradient';
    backCoverGradientStart: string;
    backCoverGradientEnd: string;
    frontCoverColor: string;
    frontCoverType: 'solid' | 'gradient';
    frontCoverGradientStart: string;
    frontCoverGradientEnd: string;
    backCoverImage: string;
    frontCoverImage: string;
    fullCoverImage: string;
  }>>;

  showKdpGuides: boolean;
  setShowKdpGuides: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  initialElements: any[];
  onSaveWorkspace: (serializedJson: any) => void;
}

const serializeToLegacyElements = (fCanvas: fabric.Canvas): any[] => {
  return fCanvas.getObjects().map((obj: any) => {
    let type = '';
    if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
      type = obj.type === 'textbox' ? 'textbox' : 'text';
    } else if (obj.type === 'rect') {
      type = 'rect';
    } else if (obj.type === 'circle') {
      type = 'circle';
    } else if (obj.type === 'line') {
      type = 'line';
    } else if (obj.type === 'image') {
      type = 'clipart';
    } else if (obj.type === 'triangle') {
      type = 'triangle';
    } else if (obj.type === 'polygon' && obj.isHexagon) {
      type = 'hexagon';
    } else if (obj.type === 'polygon' && obj.isPentagon) {
      type = 'pentagon';
    } else if (obj.type === 'polygon' && obj.isOctagon) {
      type = 'octagon';
    } else if (obj.type === 'polygon' && obj.isDiamond) {
      type = 'diamond';
    } else if (obj.type === 'polygon' && obj.isTrapezoid) {
      type = 'trapezoid';
    } else if (obj.type === 'ellipse') {
      type = 'ellipse';
    } else if (obj.type === 'polygon') {
      type = 'star';
    } else if (obj.type === 'path' && obj.isHeart) {
      type = 'heart';
    } else if (obj.type === 'path') {
      type = 'path';
    } else if (obj.type === 'group' && obj.isCurvedText) {
      type = 'curvedtext';
    }


    const base: any = {
      id: obj.id || `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      type,
      x: obj.left,
      y: obj.top,
      rotation: obj.angle || 0,
      opacity: obj.opacity ?? 1,
      fill: typeof obj.fill === 'string' ? obj.fill : undefined,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      isLocked: !!obj.isLocked
    };

    // Set the id back on the object so it stays consistent
    obj.id = base.id;

    if (type === 'text' || type === 'textbox') {
      base.text = obj.text;
      base.fontSize = Math.round((obj.fontSize || 24) * (obj.scaleX || 1));
      base.scaleX = 1;
      base.scaleY = 1;
      base.fontFamily = obj.fontFamily;
      base.fontStyle = obj.fontStyle;
      base.align = obj.textAlign;
      base.width = (obj.width || 240) * (obj.scaleX || 1);
      if (type === 'textbox') {
        base.isTextbox = true;
      }
    } else if (type === 'curvedtext') {
      base.curvedTextData = obj.curvedTextData;
    } else if (type === 'rect' || type === 'triangle' || type === 'hexagon' || type === 'star' || type === 'heart' || type === 'pentagon' || type === 'octagon' || type === 'ellipse' || type === 'diamond' || type === 'trapezoid' || type === 'path') {
      base.width = (obj.width || 100) * (obj.scaleX || 1);
      base.height = (obj.height || 100) * (obj.scaleY || 1);
      base.scaleX = 1;
      base.scaleY = 1;
      if (type === 'rect') {
        base.cornerRadius = obj.rx;
      } else if (type === 'star' || type === 'pentagon' || type === 'octagon' || type === 'diamond' || type === 'trapezoid') {
        base.points = obj.points;
      } else if (type === 'path') {
        base.pathData = obj.svgPathData || '';
        base.viewBox = obj.viewBox || 24;
        if (obj.strokeDashArray) {
          base.strokeDashArray = obj.strokeDashArray;
        }
      }
    } else if (type === 'circle') {
      base.radius = (obj.radius || 50) * (obj.scaleX || 1);
      base.scaleX = 1;
      base.scaleY = 1;
    } else if (type === 'clipart') {
      base.src = obj.getSrc ? obj.getSrc() : obj._element?.src || '';
      base.width = (obj.width || 150) * (obj.scaleX || 1);
      base.height = (obj.height || 150) * (obj.scaleY || 1);
      base.scaleX = 1;
      base.scaleY = 1;
    } else if (type === 'line') {
      base.points = [obj.x1, obj.y1, obj.x2, obj.y2];
      base.scaleX = 1;
      base.scaleY = 1;
    }

    return base;
  });
};

export default function FabricCoverStudio({
  trimSize,
  setTrimSize,
  pageCount,
  setPageCount,
  coverBackground,
  setCoverBackground,
  showKdpGuides,
  setShowKdpGuides,
  snapToGrid,
  setSnapToGrid,
  initialElements,
  onSaveWorkspace
}: FabricCoverStudioProps) {
  // Destructure coverBackground properties locally to maintain full compatibility with existing code
  const {
    backCoverColor,
    backCoverType,
    backCoverGradientStart,
    backCoverGradientEnd,
    frontCoverColor,
    frontCoverType,
    frontCoverGradientStart,
    frontCoverGradientEnd,
    backCoverImage,
    frontCoverImage,
    fullCoverImage
  } = coverBackground;

  // Keep a ref to coverBackground to prevent stale closure inside saveState and ensure instant rendering
  const coverBackgroundRef = useRef(coverBackground);
  useEffect(() => {
    coverBackgroundRef.current = coverBackground;
  }, [coverBackground]);

  // Dynamically load Google Fonts for the cover studio — every font in
  // GOOGLE_FONT_FAMILIES (everything but the browser-native "System" group)
  // gets requested at both regular and bold weight in one combined stylesheet.
  useEffect(() => {
    const familyParams = GOOGLE_FONT_FAMILIES
      .map(f => `family=${f.replace(/\s+/g, '+')}:wght@400;700`)
      .join('&');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head && document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Local helper setters that update the combined coverBackground state object and the ref for instant sync
  const setBackCoverColor = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverColor: val };
    setCoverBackground(prev => ({ ...prev, backCoverColor: val }));
    if (canvas) canvas.renderAll();
  };
  const setBackCoverType = (val: 'solid' | 'gradient') => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverType: val };
    setCoverBackground(prev => ({ ...prev, backCoverType: val }));
    if (canvas) canvas.renderAll();
  };
  const setBackCoverGradientStart = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverGradientStart: val };
    setCoverBackground(prev => ({ ...prev, backCoverGradientStart: val }));
    if (canvas) canvas.renderAll();
  };
  const setBackCoverGradientEnd = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverGradientEnd: val };
    setCoverBackground(prev => ({ ...prev, backCoverGradientEnd: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverColor = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverColor: val };
    setCoverBackground(prev => ({ ...prev, frontCoverColor: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverType = (val: 'solid' | 'gradient') => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverType: val };
    setCoverBackground(prev => ({ ...prev, frontCoverType: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverGradientStart = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverGradientStart: val };
    setCoverBackground(prev => ({ ...prev, frontCoverGradientStart: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverGradientEnd = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverGradientEnd: val };
    setCoverBackground(prev => ({ ...prev, frontCoverGradientEnd: val }));
    if (canvas) canvas.renderAll();
  };
  const setBackCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverImage: val };
    setCoverBackground(prev => ({ ...prev, backCoverImage: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverImage: val };
    setCoverBackground(prev => ({ ...prev, frontCoverImage: val }));
    if (canvas) canvas.renderAll();
  };
  const setFullCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, fullCoverImage: val };
    setCoverBackground(prev => ({ ...prev, fullCoverImage: val }));
    if (canvas) canvas.renderAll();
  };

  // Ref to hold saveState function to call it when coverBackground updates
  const saveStateRef = useRef<() => void>(() => {});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scaleRatio, setScaleRatio] = useState(1);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  // Fabric.js renders text with whatever font is available at the moment it
  // draws — it doesn't know when a webfont finishes downloading. With 50+
  // fonts now loading async, without this any text already placed with a
  // not-yet-loaded font would silently stay on the fallback font.
  useEffect(() => {
    if (!canvas || typeof document === 'undefined' || !document.fonts?.ready) return;
    document.fonts.ready.then(() => canvas.requestRenderAll());
  }, [canvas]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [clipboard, setClipboard] = useState<any>(null);
  const [isObjectLocked, setIsObjectLocked] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<'elements' | 'graphics' | 'presets' | 'uploads' | 'settings' | null>('elements');
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [graphicsSubTab, setGraphicsSubTab] = useState<'kdp-icons' | 'unsplash'>('kdp-icons');

  // 3D Mockup Preview states
  const [isMockupOpen, setIsMockupOpen] = useState(false);
  const [isMockupLoading, setIsMockupLoading] = useState(false);
  const [mockupFrontUrl, setMockupFrontUrl] = useState<string | null>(null);
  const [mockupSpineUrl, setMockupSpineUrl] = useState<string | null>(null);

  // Auto-collapse tool tab panel on mobile devices upon initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setActiveToolTab(null);
    }
  }, []);

  // History Undo/Redo States
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const historyRef = useRef<string[]>([]);
  const historyStepRef = useRef<number>(-1);
  const isUpdatingHistory = useRef(false);

  // Unsplash search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Active object editing states
  const [objectColor, setObjectColor] = useState("#FFFFFF");
  const [objectStrokeColor, setObjectStrokeColor] = useState("#FFFFFF");
  const [objectStrokeWidth, setObjectStrokeWidth] = useState(0);
  const [objectText, setObjectText] = useState("");
  const [objectFontSize, setObjectFontSize] = useState(32);
  const [objectFontFamily, setObjectFontFamily] = useState("Arial");

  // Curved text controls
  const [curvedTextValue, setCurvedTextValue] = useState("CURVED TEXT");
  const [curvedRadius, setCurvedRadius] = useState(90);
  const [curvedFlip, setCurvedFlip] = useState(false);
  const [curvedFontFamily, setCurvedFontFamily] = useState("Arial");
  const [curvedFontSize, setCurvedFontSize] = useState(24);
  const [curvedColor, setCurvedColor] = useState("#FFFFFF");

  // Contextual toolbar properties
  const [objectFontWeight, setObjectFontWeight] = useState("normal");
  const [objectFontStyle, setObjectFontStyle] = useState("normal");
  const [objectUnderline, setObjectUnderline] = useState(false);
  const [objectTextAlign, setObjectTextAlign] = useState("left");
  const [objectWidth, setObjectWidth] = useState(100);
  const [objectHeight, setObjectHeight] = useState(100);
  const [objectFlipX, setObjectFlipX] = useState(false);
  const [objectFlipY, setObjectFlipY] = useState(false);

  // Spine Text Alignment States
  const [spineTextVAlign, setSpineTextVAlign] = useState<'top' | 'center' | 'bottom'>('center');
  const [spineTextRotation, setSpineTextRotation] = useState<90 | 270>(90);

  // Typography & Effects States
  const [objectCharSpacing, setObjectCharSpacing] = useState(0);
  const [objectLineHeight, setObjectLineHeight] = useState(1.16);
  const [objectOpacity, setObjectOpacity] = useState(1);
  const [objectHasShadow, setObjectHasShadow] = useState(false);
  const [objectShadowColor, setObjectShadowColor] = useState("rgba(0,0,0,0.5)");
  const [objectShadowBlur, setObjectShadowBlur] = useState(10);
  const [objectShadowOffsetX, setObjectShadowOffsetX] = useState(5);
  const [objectShadowOffsetY, setObjectShadowOffsetY] = useState(5);

  // Blend mode (Photoshop-style layer compositing)
  const [objectBlendMode, setObjectBlendMode] = useState<string>("source-over");

  // Gradient fill (shapes & text)
  const [objectFillType, setObjectFillType] = useState<'solid' | 'gradient'>('solid');
  const [objectGradientStart, setObjectGradientStart] = useState('#6366F1');
  const [objectGradientEnd, setObjectGradientEnd] = useState('#EC4899');
  const [objectGradientAngle, setObjectGradientAngle] = useState(90);

  // Photoshop-style image adjustments (backed by fabric.Image.filters)
  const [imgBrightness, setImgBrightness] = useState(0);
  const [imgContrast, setImgContrast] = useState(0);
  const [imgSaturation, setImgSaturation] = useState(0);
  const [imgHue, setImgHue] = useState(0);
  const [imgBlur, setImgBlur] = useState(0);
  const [imgSharpen, setImgSharpen] = useState(false);
  const [imgPixelate, setImgPixelate] = useState(0);
  const [imgNoise, setImgNoise] = useState(0);
  const [imgGrayscale, setImgGrayscale] = useState(false);
  const [imgSepia, setImgSepia] = useState(false);
  const [imgInvert, setImgInvert] = useState(false);

  // Layer list state for UI rendering
  const [layers, setLayers] = useState<fabric.Object[]>([]);

  // Background Image refs
  const backCoverImageEl = useRef<HTMLImageElement | null>(null);
  const frontCoverImageEl = useRef<HTMLImageElement | null>(null);
  const fullCoverImageEl = useRef<HTMLImageElement | null>(null);

  // Background Image loaders
  useEffect(() => {
    if (fullCoverImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullCoverImage;
      img.onload = () => {
        fullCoverImageEl.current = img;
        canvas?.requestRenderAll();
      };
      img.onerror = () => {
        fullCoverImageEl.current = null;
      };
    } else {
      fullCoverImageEl.current = null;
      canvas?.requestRenderAll();
    }
  }, [fullCoverImage, canvas]);

  useEffect(() => {
    if (backCoverImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = backCoverImage;
      img.onload = () => {
        backCoverImageEl.current = img;
        canvas?.requestRenderAll();
      };
      img.onerror = () => {
        backCoverImageEl.current = null;
      };
    } else {
      backCoverImageEl.current = null;
      canvas?.requestRenderAll();
    }
  }, [backCoverImage, canvas]);

  useEffect(() => {
    if (frontCoverImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = frontCoverImage;
      img.onload = () => {
        frontCoverImageEl.current = img;
        canvas?.requestRenderAll();
      };
      img.onerror = () => {
        frontCoverImageEl.current = null;
      };
    } else {
      frontCoverImageEl.current = null;
      canvas?.requestRenderAll();
    }
  }, [frontCoverImage, canvas]);

  // Sync active object properties to states
  useEffect(() => {
    if (!activeObject) return;
    setObjectColor(activeObject.fill as string || "#FFFFFF");
    setObjectStrokeColor(activeObject.stroke || "#FFFFFF");
    setObjectStrokeWidth(activeObject.strokeWidth || 0);
    setObjectOpacity(activeObject.opacity ?? 1);
    setIsObjectLocked(!!(activeObject as any).isLocked);

    // Sync shadow properties if any
    const shadow = activeObject.shadow as fabric.Shadow | undefined;
    if (shadow) {
      setObjectHasShadow(true);
      setObjectShadowColor(shadow.color || "rgba(0,0,0,0.5)");
      setObjectShadowBlur(shadow.blur || 10);
      setObjectShadowOffsetX(shadow.offsetX || 5);
      setObjectShadowOffsetY(shadow.offsetY || 5);
    } else {
      setObjectHasShadow(false);
    }

    // Sync Dimensions & Flips
    setObjectWidth(Math.round((activeObject.width || 0) * (activeObject.scaleX || 1)));
    setObjectHeight(Math.round((activeObject.height || 0) * (activeObject.scaleY || 1)));
    setObjectFlipX(!!activeObject.flipX);
    setObjectFlipY(!!activeObject.flipY);

    // Sync blend mode
    setObjectBlendMode((activeObject as any).globalCompositeOperation || "source-over");

    // Sync fill type (solid vs gradient) for shapes/text
    const fillVal: any = activeObject.fill;
    if (fillVal && typeof fillVal === "object" && Array.isArray(fillVal.colorStops)) {
      setObjectFillType("gradient");
      setObjectGradientStart(fillVal.colorStops[0]?.color || "#6366F1");
      setObjectGradientEnd(fillVal.colorStops[fillVal.colorStops.length - 1]?.color || "#EC4899");
    } else {
      setObjectFillType("solid");
    }

    // Sync Photoshop-style image adjustments from existing filters
    if (activeObject.type === "image") {
      const imgFilters = ((activeObject as fabric.Image).filters || []) as any[];
      const findFilter = (t: string) => imgFilters.find((f) => f && f.type === t);
      setImgBrightness(findFilter("Brightness")?.brightness ?? 0);
      setImgContrast(findFilter("Contrast")?.contrast ?? 0);
      setImgSaturation(findFilter("Saturation")?.saturation ?? 0);
      setImgHue(Math.round((findFilter("HueRotation")?.rotation ?? 0) * 180));
      setImgBlur(findFilter("Blur")?.blur ?? 0);
      setImgSharpen(!!findFilter("Convolute"));
      setImgPixelate(findFilter("Pixelate")?.blocksize ?? 0);
      setImgNoise(findFilter("Noise")?.noise ?? 0);
      setImgGrayscale(!!findFilter("Grayscale"));
      setImgSepia(!!findFilter("Sepia"));
      setImgInvert(!!findFilter("Invert"));
    }

    if (activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox') {
      const textObj = activeObject as fabric.IText;
      setObjectText(textObj.text || "");
      setObjectFontSize(textObj.fontSize || 32);
      setObjectFontFamily(textObj.fontFamily || "Arial");
      setObjectCharSpacing(textObj.charSpacing || 0);
      setObjectLineHeight(textObj.lineHeight || 1.16);

      // Sync text style states
      setObjectFontWeight(String(textObj.fontWeight || "normal"));
      setObjectFontStyle(textObj.fontStyle || "normal");
      setObjectUnderline(!!textObj.underline);
      setObjectTextAlign(textObj.textAlign || "left");
    }

    if ((activeObject as any).isCurvedText) {
      const data = (activeObject as any).curvedTextData as CurvedTextData;
      setCurvedTextValue(data.text);
      setCurvedRadius(data.radius);
      setCurvedFlip(data.flip);
      setCurvedFontFamily(data.fontFamily);
      setCurvedFontSize(data.fontSize);
      setCurvedColor(data.fill);
    }
  }, [activeObject]);

  const updateActiveObjectProperty = (property: string, value: any, saveHistory = true) => {
    if (!canvas || !activeObject) return;
    activeObject.set({ [property]: value });
    canvas.requestRenderAll();
    if (saveHistory) {
      canvas.fire("object:modified", { target: activeObject });
    }
  };

  const updateActiveObjectShadow = (hasShadow: boolean, color: string, blur: number, ox: number, oy: number, saveHistory = true) => {
    if (!canvas || !activeObject) return;
    if (hasShadow) {
      activeObject.set({
        shadow: new fabric.Shadow({
          color: color,
          blur: blur,
          offsetX: ox,
          offsetY: oy
        })
      });
    } else {
      activeObject.set({ shadow: undefined });
    }
    canvas.requestRenderAll();
    if (saveHistory) {
      canvas.fire("object:modified", { target: activeObject });
    }
  };

  // Rebuilds the fabric.Image filter stack from scratch (non-destructive — always
  // recomputed from the original pixels, so overrides can be applied in any order
  // without compounding). Any single param can be overridden while the rest fall
  // back to current state, which lets each slider commit just its own value.
  const applyImageFilters = (
    overrides: Partial<{
      brightness: number; contrast: number; saturation: number; hue: number;
      blur: number; sharpen: boolean; pixelate: number; noise: number;
      grayscale: boolean; sepia: boolean; invert: boolean;
    }> = {},
    saveHistory = true
  ) => {
    if (!canvas || !activeObject || activeObject.type !== "image") return;
    const img = activeObject as fabric.Image;

    const brightness = overrides.brightness ?? imgBrightness;
    const contrast = overrides.contrast ?? imgContrast;
    const saturation = overrides.saturation ?? imgSaturation;
    const hue = overrides.hue ?? imgHue;
    const blur = overrides.blur ?? imgBlur;
    const sharpen = overrides.sharpen ?? imgSharpen;
    const pixelate = overrides.pixelate ?? imgPixelate;
    const noise = overrides.noise ?? imgNoise;
    const grayscale = overrides.grayscale ?? imgGrayscale;
    const sepia = overrides.sepia ?? imgSepia;
    const invert = overrides.invert ?? imgInvert;

    const filters: any[] = [];
    if (brightness !== 0) filters.push(new fabric.Image.filters.Brightness({ brightness }));
    if (contrast !== 0) filters.push(new fabric.Image.filters.Contrast({ contrast }));
    if (saturation !== 0) filters.push(new fabric.Image.filters.Saturation({ saturation }));
    if (hue !== 0) filters.push(new fabric.Image.filters.HueRotation({ rotation: hue / 180 }));
    if (grayscale) filters.push(new fabric.Image.filters.Grayscale());
    if (sepia) filters.push(new fabric.Image.filters.Sepia());
    if (invert) filters.push(new fabric.Image.filters.Invert());
    if (sharpen) filters.push(new fabric.Image.filters.Convolute({ matrix: SHARPEN_MATRIX }));
    if (blur > 0) filters.push(new fabric.Image.filters.Blur({ blur }));
    if (pixelate > 0) filters.push(new fabric.Image.filters.Pixelate({ blocksize: pixelate }));
    if (noise > 0) filters.push(new fabric.Image.filters.Noise({ noise }));

    img.filters = filters;
    img.applyFilters();
    canvas.requestRenderAll();
    if (saveHistory) {
      canvas.fire("object:modified", { target: img });
    }
  };

  // Builds a linear gradient in the object's own coordinate space (0..width, 0..height)
  // and rotates the start/end points around its center to honor the angle control.
  const applyGradientFill = (start: string, end: string, angleDeg: number, saveHistory = true) => {
    if (!canvas || !activeObject) return;
    const width = activeObject.width || 100;
    const height = activeObject.height || 100;
    const rad = (angleDeg * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;

    const gradient = new fabric.Gradient({
      type: "linear",
      coords: {
        x1: cx - cx * Math.cos(rad),
        y1: cy - cy * Math.sin(rad),
        x2: cx + cx * Math.cos(rad),
        y2: cy + cy * Math.sin(rad),
      },
      colorStops: [
        { offset: 0, color: start },
        { offset: 1, color: end },
      ],
    });

    activeObject.set("fill", gradient);
    canvas.requestRenderAll();
    if (saveHistory) {
      canvas.fire("object:modified", { target: activeObject });
    }
  };

  const toggleBold = () => {
    if (!canvas || !activeObject) return;
    const newVal = objectFontWeight === "bold" ? "normal" : "bold";
    setObjectFontWeight(newVal);
    updateActiveObjectProperty("fontWeight", newVal);
  };

  const toggleItalic = () => {
    if (!canvas || !activeObject) return;
    const newVal = objectFontStyle === "italic" ? "normal" : "italic";
    setObjectFontStyle(newVal);
    updateActiveObjectProperty("fontStyle", newVal);
  };

  const toggleUnderline = () => {
    if (!canvas || !activeObject) return;
    const newVal = !objectUnderline;
    setObjectUnderline(newVal);
    updateActiveObjectProperty("underline", newVal);
  };

  const handleTextAlignment = (align: string) => {
    if (!canvas || !activeObject) return;
    setObjectTextAlign(align);
    updateActiveObjectProperty("textAlign", align);
  };

  const toggleFlipX = () => {
    if (!canvas || !activeObject) return;
    const newVal = !objectFlipX;
    setObjectFlipX(newVal);
    updateActiveObjectProperty("flipX", newVal);
  };

  const toggleFlipY = () => {
    if (!canvas || !activeObject) return;
    const newVal = !objectFlipY;
    setObjectFlipY(newVal);
    updateActiveObjectProperty("flipY", newVal);
  };

  const handleExactWidth = (val: number) => {
    if (!canvas || !activeObject || val <= 0) return;
    setObjectWidth(val);
    const baseWidth = activeObject.width || 1;
    activeObject.set({ scaleX: val / baseWidth });
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const handleExactHeight = (val: number) => {
    if (!canvas || !activeObject || val <= 0) return;
    setObjectHeight(val);
    const baseHeight = activeObject.height || 1;
    activeObject.set({ scaleY: val / baseHeight });
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  // Keyboard Shortcuts via stable handler refs (initialized empty to avoid TDZ errors)
  const handlersRef = useRef<any>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        handlersRef.current.handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        handlersRef.current.handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && key === 'c') {
        e.preventDefault();
        handlersRef.current.copySelected();
      } else if ((e.ctrlKey || e.metaKey) && key === 'x') {
        e.preventDefault();
        handlersRef.current.cutSelected();
      } else if ((e.ctrlKey || e.metaKey) && key === 'v') {
        e.preventDefault();
        handlersRef.current.pasteSelected();
      } else if ((e.ctrlKey || e.metaKey) && key === 'd') {
        e.preventDefault();
        handlersRef.current.duplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && key === 'l') {
        e.preventDefault();
        handlersRef.current.toggleLockSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handlersRef.current.deleteSelected();
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        handlersRef.current.handleNudge(e.key, e.shiftKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  // Paper Type Selection ('white' | 'cream' | 'color')
  const [paperType, setPaperType] = useState<'white' | 'cream' | 'color'>('white');

  // Helper for KDP interior margin guidelines
  const getKdpGutterReference = (pages: number) => {
    if (pages <= 150) return { gutter: '0.375" (9.6 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
    if (pages <= 300) return { gutter: '0.500" (12.7 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
    if (pages <= 500) return { gutter: '0.625" (15.9 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
    if (pages <= 700) return { gutter: '0.750" (19.1 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
    return { gutter: '0.875" (22.3 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
  };

  // Graphics panel states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // KDP specs calculations
  const layout = calculateKdpLayout({
    trimWidth: trimSize.w,
    trimHeight: trimSize.h,
    pageCount: pageCount,
    paperType: paperType
  }, 800);

  // Resize observer to calculate dynamic scale factor relative to container space
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth;
      const parentHeight = containerRef.current.clientHeight;
      if (parentWidth && parentHeight) {
        const ratioX = parentWidth / layout.canvasWidth;
        const ratioY = parentHeight / layout.canvasHeight;
        // Apply a padding margin of 0.95 so it fits with some breathing room
        const ratio = Math.min(ratioX, ratioY) * 0.95;
        setScaleRatio(ratio);
      }
    };

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(containerRef.current);
    updateScale();

    return () => {
      observer.disconnect();
    };
  }, [layout.canvasWidth, layout.canvasHeight]);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create Fabric instance
    const fCanvas = new fabric.Canvas(canvasRef.current, {
      width: layout.canvasWidth,
      height: layout.canvasHeight,
      backgroundColor: 'transparent',
      preserveObjectStacking: true
    });

    // Override getPointer to account for CSS transform scaling of parent container
    fCanvas.getPointer = function (this: any, e: any, ignoreZoom?: boolean) {
      const rect = this.upperCanvasEl.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      
      const scaleX = this.width ? rect.width / this.width : 1;
      const scaleY = this.height ? rect.height / this.height : 1;
      
      const x = (clientX - rect.left) / (scaleX || 1);
      const y = (clientY - rect.top) / (scaleY || 1);
      
      return { x, y };
    };

    setCanvas(fCanvas);

    // Initial history step
    const initialJson = JSON.stringify({
      canvasJson: fCanvas.toJSON(['isCurvedText', 'curvedTextData']),
      background: coverBackgroundRef.current
    });
    historyRef.current = [initialJson];
    historyStepRef.current = 0;
    setHistory([initialJson]);
    setHistoryStep(0);

    // Sync layers list helper
    const updateLayers = () => {
      setLayers([...fCanvas.getObjects()].reverse());
    };

    // Helper to sync dimensions during scaling/moving
    const syncActiveObjectDimensions = () => {
      const active = fCanvas.getActiveObject();
      if (active) {
        setObjectWidth(Math.round((active.width || 0) * (active.scaleX || 1)));
        setObjectHeight(Math.round((active.height || 0) * (active.scaleY || 1)));
      }
    };

    fCanvas.on("object:scaling", syncActiveObjectDimensions);
    fCanvas.on("object:moving", syncActiveObjectDimensions);

    // Selection events
    fCanvas.on("selection:created", (e) => {
      const obj = e.selected ? e.selected[0] : null;
      setActiveObject(obj);
      if (obj) {
        setObjectWidth(Math.round((obj.width || 0) * (obj.scaleX || 1)));
        setObjectHeight(Math.round((obj.height || 0) * (obj.scaleY || 1)));
      }
    });
    fCanvas.on("selection:updated", (e) => {
      const obj = e.selected ? e.selected[0] : null;
      setActiveObject(obj);
      if (obj) {
        setObjectWidth(Math.round((obj.width || 0) * (obj.scaleX || 1)));
        setObjectHeight(Math.round((obj.height || 0) * (obj.scaleY || 1)));
      }
    });
    fCanvas.on("selection:cleared", () => {
      setActiveObject(null);
    });

    // Save history on changes
    const saveState = () => {
      if (isUpdatingHistory.current) return;
      const stateObj = {
        canvasJson: fCanvas.toJSON(['isCurvedText', 'curvedTextData']),
        background: coverBackgroundRef.current
      };
      const json = JSON.stringify(stateObj);
      
      const currentHistory = historyRef.current;
      const currentStep = historyStepRef.current;
      const sliced = currentHistory.slice(0, currentStep + 1);
      const nextHistory = [...sliced, json];
      const nextStep = nextHistory.length - 1;

      historyRef.current = nextHistory;
      historyStepRef.current = nextStep;
      setHistory(nextHistory);
      setHistoryStep(nextStep);
      
      const legacyElements = serializeToLegacyElements(fCanvas);
      onSaveWorkspace(legacyElements);
      updateLayers();
    };

    saveStateRef.current = saveState;

    fCanvas.on("object:added", saveState);
    fCanvas.on("object:modified", saveState);
    fCanvas.on("object:removed", saveState);

    // Initial elements import (translation from Konva element nodes to Fabric objects)
    importLegacyElements(fCanvas, initialElements, layout);

    // Initial layers load
    updateLayers();

    return () => {
      fCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.canvasWidth, layout.canvasHeight]);

  // Handle snap-to-grid & guides alignment
  useEffect(() => {
    if (!canvas) return;

    const getGuides = () => ({
      x: [
        { value: layout.canvasWidth / 2, name: "Spine Center" },
        { value: layout.spineLeftPx, name: "Spine Left" },
        { value: layout.spineRightPx, name: "Spine Right" },
        { value: layout.backCoverCenterPx, name: "Back Cover Center" },
        { value: layout.frontCoverCenterPx, name: "Front Cover Center" },
        { value: layout.trimLeftPx, name: "Trim Left" },
        { value: layout.trimRightPx, name: "Trim Right" }
      ],
      y: [
        { value: layout.canvasHeight / 2, name: "Canvas Middle" },
        { value: layout.trimTopPx, name: "Trim Top" },
        { value: layout.trimBottomPx, name: "Trim Bottom" }
      ]
    });

    const snapTolerance = snapToGrid ? 10 : 0;
    const cleanupSnap = initFabricSnapping(canvas, getGuides, snapTolerance);

    return () => {
      cleanupSnap();
    };
  }, [canvas, snapToGrid, layout]);

  // Background painting and KDP Guides rendering in Fabric's before:render and after:render
  useEffect(() => {
    if (!canvas) return;

    // Remove legacy render listeners
    canvas.off("before:render");
    canvas.off("after:render");

    // Paint backgrounds BEFORE drawing objects (so they sit behind all elements)
    canvas.on("before:render", () => {
      const ctx = canvas.getContext();
      if (!ctx) return;

      ctx.save();
      
      const bg = coverBackgroundRef.current;
      
      // 1. Draw Back Cover background
      if (bg.backCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, layout.spineLeftPx, 0);
        grad.addColorStop(0, bg.backCoverGradientStart);
        grad.addColorStop(1, bg.backCoverGradientEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg.backCoverColor;
      }
      ctx.fillRect(0, 0, layout.spineLeftPx, layout.canvasHeight);

      // 2. Draw Spine background (smooth connecting gradient or solid color)
      if (bg.backCoverType === 'gradient' && bg.frontCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(layout.spineLeftPx, 0, layout.spineRightPx, 0);
        grad.addColorStop(0, bg.backCoverGradientEnd);
        grad.addColorStop(1, bg.frontCoverGradientStart);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg.backCoverColor;
      }
      ctx.fillRect(layout.spineLeftPx, 0, layout.spineWidthPx, layout.canvasHeight);

      // 3. Draw Front Cover background
      if (bg.frontCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(layout.spineRightPx, 0, layout.canvasWidth, 0);
        grad.addColorStop(0, bg.frontCoverGradientStart);
        grad.addColorStop(1, bg.frontCoverGradientEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg.frontCoverColor;
      }
      ctx.fillRect(layout.spineRightPx, 0, layout.canvasWidth - layout.spineRightPx, layout.canvasHeight);

      // 4. Overlay Background Images if loaded
      if (fullCoverImageEl.current) {
        ctx.drawImage(fullCoverImageEl.current, 0, 0, layout.canvasWidth, layout.canvasHeight);
      }
      if (backCoverImageEl.current) {
        ctx.drawImage(backCoverImageEl.current, 0, 0, layout.spineLeftPx, layout.canvasHeight);
      }
      if (frontCoverImageEl.current) {
        ctx.drawImage(frontCoverImageEl.current, layout.spineRightPx, 0, layout.canvasWidth - layout.spineRightPx, layout.canvasHeight);
      }

      ctx.restore();
    });

    // Draw Guidelines AFTER drawing objects (so they sit on top)
    canvas.on("after:render", () => {
      const ctx = canvas.getContext();
      if (!ctx) return;

      if (showKdpGuides && !isGenerating) {
        ctx.save();
        
        // 1. Draw Bleed / Trim borders
        ctx.strokeStyle = "#3B82F6"; // blue-500
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(
          layout.bleedPx, 
          layout.bleedPx, 
          layout.canvasWidth - layout.bleedPx * 2, 
          layout.canvasHeight - layout.bleedPx * 2
        );

        // 2. Draw Spine Region Borders
        ctx.fillStyle = "rgba(244, 63, 94, 0.12)"; // light rose
        ctx.fillRect(layout.spineLeftPx, 0, layout.spineWidthPx, layout.canvasHeight);

        ctx.strokeStyle = "#F43F5E"; // rose-500
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(layout.spineLeftPx, 0);
        ctx.lineTo(layout.spineLeftPx, layout.canvasHeight);
        ctx.moveTo(layout.spineRightPx, 0);
        ctx.lineTo(layout.spineRightPx, layout.canvasHeight);
        ctx.stroke();

        // 2b. Draw Spine Text Safety Boundaries (dashed amber lines, 0.0625" inside spine folds)
        if (layout.spineWidth > 0.125) {
          const spineSafeMarginPx = 0.0625 * layout.scale;
          ctx.strokeStyle = "#EAB308"; // amber-500
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(layout.spineLeftPx + spineSafeMarginPx, 0);
          ctx.lineTo(layout.spineLeftPx + spineSafeMarginPx, layout.canvasHeight);
          ctx.moveTo(layout.spineRightPx - spineSafeMarginPx, 0);
          ctx.lineTo(layout.spineRightPx - spineSafeMarginPx, layout.canvasHeight);
          ctx.stroke();
        }

        // 3. Draw Live Safety Area Lines (Orange dash)
        ctx.strokeStyle = "#F97316"; // orange-500
        ctx.setLineDash([4, 4]);
        
        // Back Cover Live bounds
        ctx.strokeRect(
          layout.backLiveLeftPx,
          layout.backLiveTopPx,
          layout.backLiveRightPx - layout.backLiveLeftPx,
          layout.backLiveBottomPx - layout.backLiveTopPx
        );

        // Front Cover Live bounds
        ctx.strokeRect(
          layout.frontLiveLeftPx,
          layout.frontLiveTopPx,
          layout.frontLiveRightPx - layout.frontLiveLeftPx,
          layout.frontLiveBottomPx - layout.frontLiveTopPx
        );

        // Labels
        ctx.font = "bold 9px sans-serif";
        ctx.fillStyle = "rgba(244, 63, 94, 0.6)";
        ctx.fillText("SPINE AREA", layout.spineLeftPx + 4, 15);
        ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
        ctx.fillText("TRIM LINE", layout.bleedPx + 4, layout.bleedPx - 4);
        ctx.fillStyle = "rgba(249, 115, 22, 0.6)";
        ctx.fillText("SAFETY ZONE", layout.frontLiveLeftPx + 4, layout.frontLiveTopPx - 4);

        ctx.restore();
      }
    });

    canvas.renderAll();
  }, [
    canvas,
    fullCoverImage, backCoverImage, frontCoverImage,
    showKdpGuides, isGenerating, layout
  ]);

  // Import Legacy Elements Translation helper
  const importLegacyElements = (fCanvas: fabric.Canvas, elements: any[], kdp: KdpLayoutResult) => {
    if (!elements || elements.length === 0) return;

    elements.forEach(el => {
      let obj: fabric.Object | null = null;

      if (el.type === 'text' || el.type === 'textbox') {
        const textOptions = {
          id: el.id,
          left: el.x,
          top: el.y,
          fontSize: el.fontSize || 24,
          fill: el.fill || '#FFFFFF',
          fontFamily: el.fontFamily || 'Arial',
          fontStyle: el.fontStyle || 'normal',
          textAlign: el.align || 'center',
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        };

        if (el.isTextbox || el.type === 'textbox') {
          obj = new fabric.Textbox(el.text, {
            ...textOptions,
            width: el.width || 240
          } as any);
        } else {
          obj = new fabric.IText(el.text, textOptions as any);
        }
      } else if (el.type === 'rect') {
        obj = new fabric.Rect({
          id: el.id,
          left: el.x,
          top: el.y,
          width: el.width || 100,
          height: el.height || 100,
          fill: el.fill || '#F59E0B',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          rx: el.cornerRadius || 0,
          ry: el.cornerRadius || 0,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'circle') {
        obj = new fabric.Circle({
          id: el.id,
          left: el.x,
          top: el.y,
          radius: el.radius || 50,
          fill: el.fill || '#3B82F6',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'line') {
        obj = new fabric.Line(el.points || [0, 0, 100, 0], {
          id: el.id,
          left: el.x,
          top: el.y,
          stroke: el.stroke || '#FFFFFF',
          strokeWidth: el.strokeWidth || 4,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'triangle') {
        obj = new fabric.Triangle({
          id: el.id,
          left: el.x,
          top: el.y,
          width: el.width || 100,
          height: el.height || 100,
          fill: el.fill || '#10B981',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'hexagon') {
        const points = [
          { x: 50, y: 0 },
          { x: 100, y: 25 },
          { x: 100, y: 75 },
          { x: 50, y: 100 },
          { x: 0, y: 75 },
          { x: 0, y: 25 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || '#8B5CF6',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isHexagon = true;
      } else if (el.type === 'star') {
        obj = new fabric.Polygon(el.points || [], {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || '#10B981',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 238) / 238,
          scaleY: (el.height || 226) / 226,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'heart') {
        const heartPath = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z";
        obj = new fabric.Path(heartPath, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || '#EF4444',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 80) / 80,
          scaleY: (el.height || 80) / 80,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isHeart = true;
      } else if (el.type === 'path') {
        const vb = el.viewBox || 24;
        obj = new fabric.Path(el.pathData, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || vb) / vb,
          scaleY: (el.height || vb) / vb,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1,
          strokeDashArray: el.strokeDashArray || null,
          strokeLineCap: 'round',
          strokeLineJoin: 'round'
        } as any);
        (obj as any).svgPathData = el.pathData;
        (obj as any).viewBox = vb;
      } else if (el.type === 'curvedtext' && el.curvedTextData) {
        obj = buildCurvedTextGroup({
          ...el.curvedTextData,
          left: el.x,
          top: el.y,
        });
        obj.set({ angle: el.rotation || 0, opacity: el.opacity ?? 1 });
      } else if (el.type === 'pentagon') {
        const points = [
          { x: 50, y: 0 },
          { x: 100, y: 38 },
          { x: 81, y: 100 },
          { x: 19, y: 100 },
          { x: 0, y: 38 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isPentagon = true;
      } else if (el.type === 'octagon') {
        const points = [
          { x: 29, y: 0 },
          { x: 71, y: 0 },
          { x: 100, y: 29 },
          { x: 100, y: 71 },
          { x: 71, y: 100 },
          { x: 29, y: 100 },
          { x: 0, y: 71 },
          { x: 0, y: 29 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isOctagon = true;
      } else if (el.type === 'ellipse') {
        obj = new fabric.Ellipse({
          id: el.id,
          left: el.x,
          top: el.y,
          rx: (el.width || 100) / 2,
          ry: (el.height || 60) / 2,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'diamond') {
        const points = [
          { x: 50, y: 0 },
          { x: 100, y: 50 },
          { x: 50, y: 100 },
          { x: 0, y: 50 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isDiamond = true;
      } else if (el.type === 'trapezoid') {
        const points = [
          { x: 25, y: 0 },
          { x: 75, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isTrapezoid = true;
      } else if (el.type === 'clipart') {
        const secureSrc = el.src.includes('?') 
          ? `${el.src}&ts=${Date.now()}` 
          : `${el.src}?ts=${Date.now()}`;
          
        fabric.Image.fromURL(secureSrc, (img) => {
          img.set({
            id: el.id,
            left: el.x,
            top: el.y,
            width: el.width || 150,
            height: el.height || 150,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            angle: el.rotation || 0,
            opacity: el.opacity ?? 1
          } as any);
          fCanvas.add(img);
          fCanvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
        return;
      }

      if (obj) {
        if (el.isLocked) {
          obj.set({
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
            isLocked: true
          } as any);
        }
        fCanvas.add(obj);
      }
    });

    fCanvas.requestRenderAll();
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyStepRef.current > 0 && canvas) {
      isUpdatingHistory.current = true;
      const prevStep = historyStepRef.current - 1;
      const stateObj = JSON.parse(historyRef.current[prevStep]);
      
      const canvasData = stateObj.canvasJson || stateObj;
      const bgData = stateObj.background;
      
      if (bgData) {
        setCoverBackground(bgData);
      }

      canvas.loadFromJSON(canvasData, () => {
        canvas.requestRenderAll();
        historyStepRef.current = prevStep;
        setHistoryStep(prevStep);
        isUpdatingHistory.current = false;
      });
    }
  };

  const handleRedo = () => {
    if (historyStepRef.current < historyRef.current.length - 1 && canvas) {
      isUpdatingHistory.current = true;
      const nextStep = historyStepRef.current + 1;
      const stateObj = JSON.parse(historyRef.current[nextStep]);
      
      const canvasData = stateObj.canvasJson || stateObj;
      const bgData = stateObj.background;
      
      if (bgData) {
        setCoverBackground(bgData);
      }

      canvas.loadFromJSON(canvasData, () => {
        canvas.requestRenderAll();
        historyStepRef.current = nextStep;
        setHistoryStep(nextStep);
        isUpdatingHistory.current = false;
      });
    }
  };

  // Ref to store the previous cover background state to avoid duplicate saves
  const prevBgRef = useRef(coverBackground);

  // Effect to watch changes in coverBackground and push to undo/redo history (debounced)
  useEffect(() => {
    if (!canvas) return;
    if (isUpdatingHistory.current) {
      prevBgRef.current = coverBackground;
      return;
    }

    // Check if the background state actually changed
    if (JSON.stringify(prevBgRef.current) !== JSON.stringify(coverBackground)) {
      const handler = setTimeout(() => {
        if (saveStateRef.current) {
          saveStateRef.current();
        }
        prevBgRef.current = coverBackground;
      }, 300); // 300ms debounce

      return () => {
        clearTimeout(handler);
      };
    }
  }, [coverBackground, canvas]);

  // Add Element Helpers
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("BOOK TITLE", {
      left: layout.frontCoverCenterPx - 80,
      top: layout.canvasHeight / 2 - 20,
      fontFamily: "Arial",
      fontSize: 32,
      fill: "#FFFFFF",
      textAlign: "center"
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const addHeading = () => {
    if (!canvas) return;
    const heading = new fabric.IText("Add Heading", {
      left: layout.frontCoverCenterPx - 120,
      top: layout.canvasHeight / 2 - 30,
      fontFamily: "Arial",
      fontSize: 48,
      fontWeight: "bold",
      fill: "#FFFFFF",
      textAlign: "center"
    });
    canvas.add(heading);
    canvas.setActiveObject(heading);
    canvas.requestRenderAll();
  };

  const addMultilineText = () => {
    if (!canvas) return;
    const textbox = new fabric.Textbox("Add paragraph text here. Resize the box to wrap text automatically, and format it.", {
      left: layout.frontCoverCenterPx - 150,
      top: layout.canvasHeight / 2 - 40,
      width: 300,
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#E2E8F0",
      textAlign: "left"
    });
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();
  };

  interface CurvedTextData {
    text: string;
    radius: number;
    flip: boolean;
    fontFamily: string;
    fontSize: number;
    fill: string;
  }

  // Fabric.js has no built-in text-on-a-path, so curved text is built as a
  // Group of individually positioned + rotated single-character Text
  // objects arranged along a circular arc. Editing content/radius/font
  // isn't a live in-place edit — the whole group is discarded and rebuilt
  // (see regenerateCurvedText below).
  const buildCurvedTextGroup = (config: CurvedTextData & { left: number; top: number }): fabric.Group => {
    const { text, radius, flip, fontFamily, fontSize, fill, left, top } = config;
    const chars = text.split('');
    // Degrees per character, scaled down for longer strings so they don't
    // overlap; capped so short strings don't spread across the whole circle.
    const anglePerChar = Math.min(18, 320 / Math.max(chars.length, 1));
    const totalArc = anglePerChar * (chars.length - 1);
    const startAngle = -totalArc / 2;

    const charObjects = chars.map((ch, i) => {
      const angleDeg = startAngle + i * anglePerChar;
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = radius * Math.sin(angleRad);
      const y = flip ? radius * Math.cos(angleRad) : -radius * Math.cos(angleRad);
      const rotation = flip ? -angleDeg : angleDeg;

      return new fabric.Text(ch === ' ' ? ' ' : ch, {
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        fontFamily,
        fontSize,
        fill,
        angle: rotation,
      });
    });

    const group = new fabric.Group(charObjects, { left, top });
    (group as any).isCurvedText = true;
    (group as any).curvedTextData = { text, radius, flip, fontFamily, fontSize, fill };
    return group;
  };

  const addCurvedText = () => {
    if (!canvas) return;
    const group = buildCurvedTextGroup({
      text: "CURVED TEXT",
      radius: 90,
      flip: false,
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#FFFFFF",
      left: layout.frontCoverCenterPx,
      top: layout.canvasHeight / 2,
    });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  };

  // Rebuilds the currently-selected curved-text group with partial changes
  // merged into its stored config, preserving its on-canvas position.
  const regenerateCurvedText = (overrides: Partial<CurvedTextData>) => {
    if (!canvas || !activeObject || !(activeObject as any).isCurvedText) return;
    const current = (activeObject as any).curvedTextData as CurvedTextData;
    const merged = { ...current, ...overrides };
    const newGroup = buildCurvedTextGroup({
      ...merged,
      left: activeObject.left || 0,
      top: activeObject.top || 0,
    });
    newGroup.set({ angle: activeObject.angle, opacity: activeObject.opacity });
    canvas.remove(activeObject);
    canvas.add(newGroup);
    canvas.setActiveObject(newGroup);
    setActiveObject(newGroup);
    canvas.requestRenderAll();
  };

  const addRectangle = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      width: 100,
      height: 100,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      radius: 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
  };

  const addTriangle = () => {
    if (!canvas) return;
    const triangle = new fabric.Triangle({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      width: 100,
      height: 100,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.requestRenderAll();
  };

  const addHexagon = () => {
    if (!canvas) return;
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 25 },
      { x: 100, y: 75 },
      { x: 50, y: 100 },
      { x: 0, y: 75 },
      { x: 0, y: 25 }
    ];
    const hexagon = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    (hexagon as any).isHexagon = true;
    hexagon.scaleToWidth(100);
    canvas.add(hexagon);
    canvas.setActiveObject(hexagon);
    canvas.requestRenderAll();
  };

  const addHeart = () => {
    if (!canvas) return;
    const heartPath = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z";
    const heart = new fabric.Path(heartPath, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    (heart as any).isHeart = true;
    heart.scaleToWidth(100);
    canvas.add(heart);
    canvas.setActiveObject(heart);
    canvas.requestRenderAll();
  };

  const addStar = () => {
    if (!canvas) return;
    const points = [
      { x: 350, y: 75 },
      { x: 379, y: 161 },
      { x: 469, y: 161 },
      { x: 397, y: 215 },
      { x: 423, y: 301 },
      { x: 350, y: 250 },
      { x: 277, y: 301 },
      { x: 303, y: 215 },
      { x: 231, y: 161 },
      { x: 321, y: 161 }
    ];
    const star = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    star.scaleToWidth(100);
    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.requestRenderAll();
  };

  const addLine = () => {
    if (!canvas) return;
    const line = new fabric.Line([0, 0, 150, 0], {
      left: layout.frontCoverCenterPx - 75,
      top: layout.canvasHeight / 2,
      stroke: "#000000",
      strokeWidth: 4
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  };

  const addPentagon = () => {
    if (!canvas) return;
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 38 },
      { x: 81, y: 100 },
      { x: 19, y: 100 },
      { x: 0, y: 38 }
    ];
    const pentagon = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    (pentagon as any).isPentagon = true;
    pentagon.scaleToWidth(100);
    canvas.add(pentagon);
    canvas.setActiveObject(pentagon);
    canvas.requestRenderAll();
  };

  const addOctagon = () => {
    if (!canvas) return;
    const points = [
      { x: 29, y: 0 },
      { x: 71, y: 0 },
      { x: 100, y: 29 },
      { x: 100, y: 71 },
      { x: 71, y: 100 },
      { x: 29, y: 100 },
      { x: 0, y: 71 },
      { x: 0, y: 29 }
    ];
    const octagon = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    (octagon as any).isOctagon = true;
    octagon.scaleToWidth(100);
    canvas.add(octagon);
    canvas.setActiveObject(octagon);
    canvas.requestRenderAll();
  };

  const addEllipse = () => {
    if (!canvas) return;
    const ellipse = new fabric.Ellipse({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 30,
      rx: 50,
      ry: 30,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    canvas.add(ellipse);
    canvas.setActiveObject(ellipse);
    canvas.requestRenderAll();
  };

  const addDiamond = () => {
    if (!canvas) return;
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 50 },
      { x: 50, y: 100 },
      { x: 0, y: 50 }
    ];
    const diamond = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    (diamond as any).isDiamond = true;
    diamond.scaleToWidth(100);
    canvas.add(diamond);
    canvas.setActiveObject(diamond);
    canvas.requestRenderAll();
  };

  const addTrapezoid = () => {
    if (!canvas) return;
    const points = [
      { x: 25, y: 0 },
      { x: 75, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ];
    const trapezoid = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 3
    });
    (trapezoid as any).isTrapezoid = true;
    trapezoid.scaleToWidth(100);
    canvas.add(trapezoid);
    canvas.setActiveObject(trapezoid);
    canvas.requestRenderAll();
  };

  const addClipart = (src: string) => {
    if (!canvas) return;
    // Add unique cache buster query parameter to bypass browser CORS cache issue
    const secureSrc = src.includes('?') 
      ? `${src}&ts=${Date.now()}` 
      : `${src}?ts=${Date.now()}`;
      
    fabric.Image.fromURL(secureSrc, (img) => {
      const imgW = img.width || 150;
      const imgH = img.height || 150;
      
      // Scale image to fit within a 200x200 bounding box proportionally
      const maxW = 200;
      const maxH = 200;
      const scale = Math.min(maxW / imgW, maxH / imgH);
      
      img.set({
        left: layout.frontCoverCenterPx - (imgW * scale) / 2,
        top: layout.canvasHeight / 2 - (imgH * scale) / 2,
        scaleX: scale,
        scaleY: scale
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const addVectorIcon = (pathString: string, fill: string, stroke: string, strokeWidth: number, strokeDashArray?: number[], viewBox = 24) => {
    if (!canvas) return;
    
    const path = new fabric.Path(pathString, {
      left: layout.frontCoverCenterPx - 40,
      top: layout.canvasHeight / 2 - 40,
      fill: fill || "transparent",
      stroke: stroke || "#000000",
      strokeWidth: strokeWidth ?? 2,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      strokeDashArray: strokeDashArray || undefined
    });
    
    // Scale path nicely
    path.scaleToWidth(80);
    
    // Set custom attributes for serialization
    (path as any).svgPathData = pathString;
    (path as any).viewBox = viewBox;
    if (strokeDashArray) {
      (path as any).strokeDashArray = strokeDashArray;
    }
    
    canvas.add(path);
    canvas.setActiveObject(path);
    canvas.requestRenderAll();
  };

  const bringToFront = () => {
    if (!canvas || !activeObject) return;
    activeObject.bringToFront();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const sendToBack = () => {
    if (!canvas || !activeObject) return;
    activeObject.sendToBack();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const bringForward = () => {
    if (!canvas || !activeObject) return;
    activeObject.bringForward();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const sendBackward = () => {
    if (!canvas || !activeObject) return;
    (activeObject as any).sendBackwards();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const toggleLockSelected = () => {
    if (!canvas || !activeObject) return;
    const lock = !(activeObject as any).isLocked;
    activeObject.set({
      lockMovementX: lock,
      lockMovementY: lock,
      lockScalingX: lock,
      lockScalingY: lock,
      lockRotation: lock,
      hasControls: !lock,
      isLocked: lock
    } as any);
    setIsObjectLocked(lock);
    canvas.discardActiveObject();
    canvas.setActiveObject(activeObject);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const copySelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone((cloned: any) => {
      setClipboard(cloned);
    });
  };

  const cutSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone((cloned: any) => {
      setClipboard(cloned);
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    });
  };

  const pasteSelected = () => {
    if (!canvas || !clipboard) return;
    clipboard.clone((cloned: any) => {
      canvas.discardActiveObject();
      cloned.set({
        left: (cloned.left || 0) + 15,
        top: (cloned.top || 0) + 15,
        id: `${cloned.type}-${Date.now()}`,
        evented: true,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject((obj: any) => {
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      clipboard.top += 15;
      clipboard.left += 15;
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  const duplicateSelected = () => {
    if (!canvas || !activeObject) return;
    activeObject.clone((cloned: any) => {
      cloned.set({
        left: (activeObject.left || 0) + 25,
        top: (activeObject.top || 0) + 25,
        id: `${activeObject.type}-${Date.now()}`
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  const handleSearchUnsplash = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/generate/unsplash?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok) {
        if (data.results) {
          setSearchResults(data.results.map((item: any) => ({
            name: item.description || item.alt_description || "Photo",
            thumb: item.urls.small,
            full: item.urls.regular
          })));
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchError(data.error || "Failed to search images");
      }
    } catch (err) {
      setSearchError("Failed to connect to search API");
    } finally {
      setIsSearching(false);
    }
  };

  const alignTextToSpine = (vAlignOverride?: 'top' | 'center' | 'bottom', rotOverride?: 90 | 270) => {
    if (!canvas || !activeObject) return;

    const vAlign = vAlignOverride || spineTextVAlign;
    const rot = rotOverride || spineTextRotation;
    
    // Safety margin of 0.0625" (1/16") inside spine fold on each side
    // Total reduction = 0.125" (1/8")
    const maxAllowedWidthPx = (layout.spineWidth - 0.125) * layout.scale; 

    // Set origin to center for exact centering on spine
    activeObject.set({
      originX: 'center',
      originY: 'center',
      angle: rot
    });
    
    // Scale down if thickness exceeds safety boundaries
    let boundingBox = activeObject.getBoundingRect();
    if (boundingBox.width > maxAllowedWidthPx) {
      const scaleFactor = maxAllowedWidthPx / boundingBox.width;
      activeObject.set({
        scaleX: (activeObject.scaleX || 1) * scaleFactor,
        scaleY: (activeObject.scaleY || 1) * scaleFactor
      });
      // Re-calculate bounding box after scaling
      boundingBox = activeObject.getBoundingRect();
    }

    // Calculate vertical position (top, center, bottom)
    // Keep 0.75" safe margin from top/bottom trim borders
    const vMarginPx = 0.75 * layout.scale;
    const textHeightPx = boundingBox.height; // rotated height (the length of the text)
    
    let topPos = layout.canvasHeight / 2;
    if (vAlign === 'top') {
      topPos = layout.trimTopPx + vMarginPx + (textHeightPx / 2);
    } else if (vAlign === 'bottom') {
      topPos = layout.trimBottomPx - vMarginPx - (textHeightPx / 2);
    }

    activeObject.set({
      left: layout.spineCenterPx,
      top: topPos
    });

    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const addBarcodePlaceholder = () => {
    if (!canvas) return;
    
    // Barcode dimensions: 2.0" wide by 1.2" high
    const bcW = 2.0 * layout.scale;
    const bcH = 1.2 * layout.scale;
    
    // Bottom-left corner of the back cover, keeping 0.375" margin from trim borders
    const margin = 0.375 * layout.scale;
    const left = layout.trimLeftPx + margin;
    const top = layout.trimBottomPx - margin - bcH;
    
    // Clean, solid white rectangle of size 2" x 1.2" with sharp corners and a light dashed reference border.
    // It contains absolutely no text, no numbers, and no dummy lines so that Amazon KDP can print the barcode on it.
    const barcodeRect = new fabric.Rect({
      left,
      top,
      width: bcW,
      height: bcH,
      fill: '#FFFFFF',
      stroke: '#CBD5E1',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      rx: 0,
      ry: 0,
      id: `barcode-${Date.now()}`,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false // Lock controls to keep the KDP-standard size perfect
    } as any);
    
    canvas.add(barcodeRect);
    canvas.setActiveObject(barcodeRect);
    canvas.requestRenderAll();
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    if (!canvas || !activeObject) return;
    
    const objWidth = activeObject.getBoundingRect().width;
    let targetX = 0;

    if (align === 'left') {
      targetX = layout.frontLiveLeftPx;
    } else if (align === 'center') {
      targetX = layout.frontCoverCenterPx - (objWidth / 2);
    } else if (align === 'right') {
      targetX = layout.frontLiveRightPx - objWidth;
    }

    activeObject.set({ left: targetX });
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const applyPresetColors = (back: string, front: string, type?: string, backStart?: string, backEnd?: string, frontStart?: string, frontEnd?: string) => {
    let newBg;
    if (type === 'gradient' && backStart && backEnd && frontStart && frontEnd) {
      newBg = {
        backCoverType: 'gradient' as const,
        backCoverGradientStart: backStart,
        backCoverGradientEnd: backEnd,
        frontCoverType: 'gradient' as const,
        frontCoverGradientStart: frontStart,
        frontCoverGradientEnd: frontEnd,
        backCoverColor: back,
        frontCoverColor: front,
        backCoverImage: '',
        frontCoverImage: '',
        fullCoverImage: ''
      };
    } else {
      newBg = {
        backCoverType: 'solid' as const,
        backCoverColor: back,
        backCoverGradientStart: back,
        backCoverGradientEnd: back,
        frontCoverType: 'solid' as const,
        frontCoverColor: front,
        frontCoverGradientStart: front,
        frontCoverGradientEnd: front,
        backCoverImage: '',
        frontCoverImage: '',
        fullCoverImage: ''
      };
    }
    coverBackgroundRef.current = newBg;
    setCoverBackground(newBg);
    if (canvas) canvas.renderAll();
  };

  const applyBackgroundImage = (url: string, target: 'full' | 'front' | 'back') => {
    if (!canvas) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      if (target === 'full') {
        fullCoverImageEl.current = img;
        setFullCoverImage(url);
        setBackCoverImage('');
        setFrontCoverImage('');
        backCoverImageEl.current = null;
        frontCoverImageEl.current = null;
      } else if (target === 'front') {
        frontCoverImageEl.current = img;
        setFrontCoverImage(url);
        setFullCoverImage('');
        fullCoverImageEl.current = null;
      } else if (target === 'back') {
        backCoverImageEl.current = img;
        setBackCoverImage(url);
        setFullCoverImage('');
        fullCoverImageEl.current = null;
      }
      canvas.renderAll();
      canvas.fire("object:modified");
    };
  };

  const handleClearCanvas = () => {
    if (!canvas) return;
    if (confirm("Are you sure you want to clear all layers from the cover?")) {
      // getObjects() returns a COPY of the internal array (this._objects.concat()),
      // so a while-loop re-checking objects.length here never terminates —
      // remove() mutates the canvas's real array, not this copy. Iterate the
      // copy directly instead.
      canvas.getObjects().forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

  // Applies a full cover template: sets the background, clears the canvas,
  // and adds the template's title/subtitle/decorative elements — resolved
  // against the CURRENT layout so positions land correctly regardless of
  // which trim size is selected.
  const applyTemplate = (template: CoverTemplate, photoUrl: string | null = null) => {
    if (!canvas) return;

    try {
      // No confirm() dialog here on purpose — it's a synchronous, blocking
      // native prompt, and since Cover Studio already has full undo/redo,
      // it's redundant friction (and can read as a frozen page if the user
      // isn't expecting a modal).
      // getObjects() returns a COPY of the internal array, so iterate it
      // directly rather than looping on objects.length (see handleClearCanvas).
      canvas.getObjects().forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();

      // Sync the ref synchronously (matching applyPresetColors' pattern) so
      // the immediate renderAll() below doesn't paint one frame of the stale
      // background — nothing else forces a repaint for a plain color/gradient
      // change. The real Unsplash photo (if fetched) becomes the front cover
      // background image; a dark overlay element (added in
      // resolveTemplateElements) keeps the title text legible on top of it.
      const newBg = {
        ...coverBackground,
        frontCoverColor: template.background.frontCoverColor,
        frontCoverType: template.background.frontCoverType,
        frontCoverGradientStart: template.background.frontCoverGradientStart,
        frontCoverGradientEnd: template.background.frontCoverGradientEnd,
        backCoverColor: template.background.backCoverColor,
        backCoverType: template.background.backCoverType,
        backCoverGradientStart: template.background.backCoverGradientStart,
        backCoverGradientEnd: template.background.backCoverGradientEnd,
        backCoverImage: '',
        frontCoverImage: photoUrl || '',
        fullCoverImage: '',
      };
      coverBackgroundRef.current = newBg;
      setCoverBackground(newBg);

      const resolvedElements = resolveTemplateElements(template, layout, !!photoUrl);
      importLegacyElements(canvas, resolvedElements, layout);
      canvas.renderAll();
      setActiveToolTab('elements');
    } catch (err) {
      console.error("Failed to apply cover template:", err);
    }
  };

  const handleGenerateCover = async () => {
    if (!canvas) return;
    setIsGenerating(true);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    
    setTimeout(() => {
      const dataURL = canvas.toDataURL({ 
        format: 'png', 
        multiplier: 3 
      });

      const doc = new jsPDF({ 
        orientation: "landscape", 
        unit: "in", 
        format: [layout.coverWidthInches, layout.coverHeightInches] 
      });

      doc.addImage(dataURL, 'PNG', 0, 0, layout.coverWidthInches, layout.coverHeightInches);
      doc.save(`KDP_Premium_Cover_${trimSize.w}x${trimSize.h}.pdf`);
      setIsGenerating(false);
    }, 300);
  };

  // Crops the front-cover and spine regions out of the full wraparound export
  // (excluding bleed) so the 3D mockup shows just those two faces, not the
  // whole flat back+spine+front strip.
  const handleOpenMockupPreview = () => {
    if (!canvas) return;
    setIsMockupOpen(true);
    setIsMockupLoading(true);
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    setTimeout(() => {
      const multiplier = 3;
      const fullDataUrl = canvas.toDataURL({ format: 'png', multiplier });

      const img = new Image();
      img.onload = () => {
        const cropRegion = (xPx: number, yPx: number, wPx: number, hPx: number): string => {
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = wPx;
          cropCanvas.height = hPx;
          const ctx = cropCanvas.getContext('2d');
          if (!ctx) return fullDataUrl;
          ctx.drawImage(img, xPx, yPx, wPx, hPx, 0, 0, wPx, hPx);
          return cropCanvas.toDataURL('image/png');
        };

        const frontX = layout.frontLiveLeftPx - layout.safeMarginPx; // = spineRightPx, the trimmed front-cover left edge
        const frontW = layout.trimRightPx - frontX;
        const frontH = layout.trimBottomPx - layout.trimTopPx;

        setMockupFrontUrl(cropRegion(frontX * multiplier, layout.trimTopPx * multiplier, frontW * multiplier, frontH * multiplier));
        if (layout.spineWidthPx > 2) {
          setMockupSpineUrl(cropRegion(layout.spineLeftPx * multiplier, layout.trimTopPx * multiplier, layout.spineWidthPx * multiplier, frontH * multiplier));
        } else {
          setMockupSpineUrl(null);
        }
        setIsMockupLoading(false);
      };
      img.src = fullDataUrl;
    }, 300);
  };

  // Bind keyboard shortcut handler references
  handlersRef.current = { 
    handleUndo, 
    handleRedo, 
    deleteSelected,
    copySelected,
    cutSelected,
    pasteSelected,
    duplicateSelected,
    toggleLockSelected,
    handleNudge: (key: string, shiftKey: boolean) => {
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      const nudgeAmount = shiftKey ? 10 : 1;
      const left = active.left || 0;
      const top = active.top || 0;

      const lowerKey = key.toLowerCase();
      if (lowerKey === 'arrowup') active.set({ top: top - nudgeAmount });
      if (lowerKey === 'arrowdown') active.set({ top: top + nudgeAmount });
      if (lowerKey === 'arrowleft') active.set({ left: left - nudgeAmount });
      if (lowerKey === 'arrowright') active.set({ left: left + nudgeAmount });

      canvas.requestRenderAll();
      canvas.fire("object:modified", { target: active });
    }
  };


  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* 1. Far Left Tool Picker Toolbar */}
      <div className="w-16 bg-slate-950 flex flex-col items-center py-6 gap-5 border-r border-slate-900 z-20 text-slate-400">
        <button
          onClick={() => setIsTemplateGalleryOpen(true)}
          title="Browse Cover Templates"
          className="p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] hover:bg-slate-900 hover:text-white"
        >
          <LayoutTemplate className="w-5 h-5"/>
        </button>
        <button
          onClick={() => setActiveToolTab(prev => prev === 'elements' ? null : 'elements')}
          title="Shapes & Text"
          className={`p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
            activeToolTab === 'elements' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Plus className="w-5 h-5"/>
        </button>
        <button
          onClick={() => setActiveToolTab(prev => prev === 'graphics' ? null : 'graphics')}
          title="Clipart Library"
          className={`p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
            activeToolTab === 'graphics' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Shapes className="w-5 h-5"/>
        </button>
        <button
          onClick={() => setActiveToolTab(prev => prev === 'presets' ? null : 'presets')}
          title="Background Presets"
          className={`p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
            activeToolTab === 'presets' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5"/>
        </button>
        <button
          onClick={() => setActiveToolTab(prev => prev === 'uploads' ? null : 'uploads')}
          title="Upload Custom Graphics"
          className={`p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
            activeToolTab === 'uploads' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Upload className="w-5 h-5"/>
        </button>
        <button
          onClick={() => setActiveToolTab(prev => prev === 'settings' ? null : 'settings')}
          title="Cover Specs"
          className={`p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
            activeToolTab === 'settings' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5"/>
        </button>

        <div className="mt-auto flex flex-col gap-4 border-t border-slate-900 pt-5 w-full px-2">
          <button
            onClick={() => setShowKdpGuides(!showKdpGuides)}
            title="Toggle KDP Layout Guides"
            className={`p-3 mx-auto rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
              showKdpGuides ? 'text-pink-400 bg-pink-500/10 border border-pink-500/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            <LayoutTemplate className="w-5 h-5"/>
          </button>
          <button
            onClick={handleOpenMockupPreview}
            title="Preview 3D Book Mockup"
            className="p-3 mx-auto rounded-2xl text-slate-500 hover:text-white hover:bg-slate-900 transition-all duration-200 ease-out active:scale-[0.94]"
          >
            <Box className="w-5 h-5"/>
          </button>
          <button
            onClick={handleGenerateCover}
            disabled={isGenerating}
            title="Compile & Download PDF Cover"
            className="p-3 mx-auto rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-200 ease-out active:scale-[0.94] shadow-md shadow-indigo-600/25 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {activeToolTab && (
        <div
          onClick={() => setActiveToolTab(null)}
          className="md:hidden absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-20 cursor-pointer"
        />
      )}

      {/* 2. Left Configuration Panel */}
      {activeToolTab && (
        <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col p-5 overflow-y-auto shrink-0 absolute md:relative left-16 top-0 h-full z-30 shadow-2xl md:shadow-none">
        
        {/* Contextual Edit Panel (Consolidated Sidebar Editor) */}
        {activeObject && (
          <div className="mb-5 bg-white p-3.5 rounded-2xl border border-slate-200 space-y-4 shadow-sm shrink-0">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Edit Selected</span>
              <button 
                onClick={() => {
                  canvas?.discardActiveObject();
                  setActiveObject(null);
                  canvas?.requestRenderAll();
                }}
                className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase"
              >
                Deselect
              </button>
            </div>

            {/* Text Options */}
            {(activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox') && (
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Text Content</label>
                  <textarea
                    value={objectText}
                    onChange={(e) => {
                      setObjectText(e.target.value);
                      updateActiveObjectProperty("text", e.target.value);
                    }}
                    className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-sans"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Font Family</label>
                  <select
                    value={objectFontFamily}
                    onChange={(e) => {
                      setObjectFontFamily(e.target.value);
                      updateActiveObjectProperty("fontFamily", e.target.value);
                    }}
                    className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-sans"
                    style={{ fontFamily: objectFontFamily }}
                  >
                    {FONT_CATEGORIES.map(({ category, fonts }) => (
                      <optgroup key={category} label={category}>
                        {fonts.map((font) => (
                          <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Font Size</label>
                    <input
                      type="number"
                      min="6"
                      max="300"
                      value={objectFontSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 12;
                        setObjectFontSize(val);
                        updateActiveObjectProperty("fontSize", val, false);
                      }}
                      onBlur={() => {
                        if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                      }}
                      className="w-full text-xs font-bold p-1.5 border border-slate-200 rounded-lg outline-none font-sans text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Alignment</label>
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => handleTextAlignment(align)}
                          className={`flex-1 py-1.5 text-[9px] transition-colors ${
                            objectTextAlign === align ? "bg-indigo-600 text-white font-bold" : "bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {align[0].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bold, Italic, Underline */}
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Text Style</label>
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={toggleBold}
                      className={`flex-1 py-1.5 text-xs font-bold transition-colors ${
                        objectFontWeight === "bold" ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      B
                    </button>
                    <button
                      onClick={toggleItalic}
                      className={`flex-1 py-1.5 text-xs italic transition-colors border-x border-slate-100 ${
                        objectFontStyle === "italic" ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      I
                    </button>
                    <button
                      onClick={toggleUnderline}
                      className={`flex-1 py-1.5 text-xs underline transition-colors ${
                        objectUnderline ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      U
                    </button>
                  </div>
                </div>

                {/* Spacing & Height */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Char Spacing</span>
                    <span className="text-slate-600 font-bold">{objectCharSpacing}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="300"
                    step="5"
                    value={objectCharSpacing}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setObjectCharSpacing(val);
                      updateActiveObjectProperty("charSpacing", val, false);
                    }}
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                  />
                </div>

                {/* Spine alignment (if applicable) */}
                {(activeObject as any).id?.startsWith('spine') && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Spine Text Alignment</span>
                    {pageCount < 80 ? (
                      <p className="text-[8px] font-black text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50 leading-normal">
                        ⚠️ Spine text requires 80+ pages. (Current: {pageCount})
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {(['top', 'center', 'bottom'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => {
                                setSpineTextVAlign(align);
                                alignTextToSpine(align, spineTextRotation);
                              }}
                              className={`flex-1 py-1 text-[9px] font-black rounded capitalize border transition-all ${
                                spineTextVAlign === align 
                                  ? 'bg-indigo-600 text-white border-indigo-600' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Curved / Arc Text Options */}
            {(activeObject as any).isCurvedText && (
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Text Content</label>
                  <input
                    type="text"
                    value={curvedTextValue}
                    onChange={(e) => {
                      setCurvedTextValue(e.target.value);
                      regenerateCurvedText({ text: e.target.value });
                    }}
                    className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Curve Radius: {curvedRadius}px</label>
                  <input
                    type="range"
                    min={30}
                    max={250}
                    value={curvedRadius}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurvedRadius(val);
                      regenerateCurvedText({ radius: val });
                    }}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setCurvedFlip(false); regenerateCurvedText({ flip: false }); }}
                    className={`p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${!curvedFlip ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    Arc Up
                  </button>
                  <button
                    onClick={() => { setCurvedFlip(true); regenerateCurvedText({ flip: true }); }}
                    className={`p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${curvedFlip ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    Arc Down
                  </button>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Font Family</label>
                  <select
                    value={curvedFontFamily}
                    onChange={(e) => {
                      setCurvedFontFamily(e.target.value);
                      regenerateCurvedText({ fontFamily: e.target.value });
                    }}
                    className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                    style={{ fontFamily: curvedFontFamily }}
                  >
                    {FONT_CATEGORIES.map(({ category, fonts }) => (
                      <optgroup key={category} label={category}>
                        {fonts.map((font) => (
                          <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Size</label>
                    <input
                      type="number"
                      value={curvedFontSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCurvedFontSize(val);
                        regenerateCurvedText({ fontSize: val });
                      }}
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Color</label>
                    <input
                      type="color"
                      value={curvedColor}
                      onChange={(e) => {
                        setCurvedColor(e.target.value);
                        regenerateCurvedText({ fill: e.target.value });
                      }}
                      className="w-full h-8 border border-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photoshop-style Image Adjustments */}
            {activeObject.type === 'image' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase">Image Adjustments</h4>
                  <button
                    onClick={() => {
                      setImgBrightness(0); setImgContrast(0); setImgSaturation(0); setImgHue(0);
                      setImgBlur(0); setImgSharpen(false); setImgPixelate(0); setImgNoise(0);
                      setImgGrayscale(false); setImgSepia(false); setImgInvert(false);
                      applyImageFilters({
                        brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0,
                        sharpen: false, pixelate: 0, noise: 0, grayscale: false, sepia: false, invert: false
                      }, true);
                    }}
                    className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Brightness</span>
                    <span className="text-slate-600 font-bold">{Math.round(imgBrightness * 100)}</span>
                  </div>
                  <input
                    type="range" min="-1" max="1" step="0.02" value={imgBrightness}
                    onChange={(e) => { const v = parseFloat(e.target.value); setImgBrightness(v); applyImageFilters({ brightness: v }, false); }}
                    onMouseUp={() => applyImageFilters({}, true)}
                    onTouchEnd={() => applyImageFilters({}, true)}
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Contrast</span>
                    <span className="text-slate-600 font-bold">{Math.round(imgContrast * 100)}</span>
                  </div>
                  <input
                    type="range" min="-1" max="1" step="0.02" value={imgContrast}
                    onChange={(e) => { const v = parseFloat(e.target.value); setImgContrast(v); applyImageFilters({ contrast: v }, false); }}
                    onMouseUp={() => applyImageFilters({}, true)}
                    onTouchEnd={() => applyImageFilters({}, true)}
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Saturation</span>
                    <span className="text-slate-600 font-bold">{Math.round(imgSaturation * 100)}</span>
                  </div>
                  <input
                    type="range" min="-1" max="1" step="0.02" value={imgSaturation}
                    onChange={(e) => { const v = parseFloat(e.target.value); setImgSaturation(v); applyImageFilters({ saturation: v }, false); }}
                    onMouseUp={() => applyImageFilters({}, true)}
                    onTouchEnd={() => applyImageFilters({}, true)}
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Hue</span>
                    <span className="text-slate-600 font-bold">{imgHue}°</span>
                  </div>
                  <input
                    type="range" min="-180" max="180" step="1" value={imgHue}
                    onChange={(e) => { const v = parseInt(e.target.value); setImgHue(v); applyImageFilters({ hue: v }, false); }}
                    onMouseUp={() => applyImageFilters({}, true)}
                    onTouchEnd={() => applyImageFilters({}, true)}
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Blur</span>
                    <span className="text-slate-600 font-bold">{Math.round(imgBlur * 100)}</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.02" value={imgBlur}
                    onChange={(e) => { const v = parseFloat(e.target.value); setImgBlur(v); applyImageFilters({ blur: v }, false); }}
                    onMouseUp={() => applyImageFilters({}, true)}
                    onTouchEnd={() => applyImageFilters({}, true)}
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Pixelate</span>
                    <span className="text-slate-600 font-bold">{imgPixelate}</span>
                  </div>
                  <input
                    type="range" min="0" max="30" step="1" value={imgPixelate}
                    onChange={(e) => { const v = parseInt(e.target.value); setImgPixelate(v); applyImageFilters({ pixelate: v }, false); }}
                    onMouseUp={() => applyImageFilters({}, true)}
                    onTouchEnd={() => applyImageFilters({}, true)}
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                    <span>Grain / Noise</span>
                    <span className="text-slate-600 font-bold">{imgNoise}</span>
                  </div>
                  <input
                    type="range" min="0" max="400" step="10" value={imgNoise}
                    onChange={(e) => { const v = parseInt(e.target.value); setImgNoise(v); applyImageFilters({ noise: v }, false); }}
                    onMouseUp={() => applyImageFilters({}, true)}
                    onTouchEnd={() => applyImageFilters({}, true)}
                    className="w-full accent-indigo-600 h-1 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => { const v = !imgGrayscale; setImgGrayscale(v); applyImageFilters({ grayscale: v }, true); }}
                    className={`py-1.5 rounded-lg text-[9px] font-black uppercase border transition-colors cursor-pointer ${imgGrayscale ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    Grayscale
                  </button>
                  <button
                    onClick={() => { const v = !imgSepia; setImgSepia(v); applyImageFilters({ sepia: v }, true); }}
                    className={`py-1.5 rounded-lg text-[9px] font-black uppercase border transition-colors cursor-pointer ${imgSepia ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => { const v = !imgInvert; setImgInvert(v); applyImageFilters({ invert: v }, true); }}
                    className={`py-1.5 rounded-lg text-[9px] font-black uppercase border transition-colors cursor-pointer ${imgInvert ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    Invert
                  </button>
                  <button
                    onClick={() => { const v = !imgSharpen; setImgSharpen(v); applyImageFilters({ sharpen: v }, true); }}
                    className={`py-1.5 rounded-lg text-[9px] font-black uppercase border transition-colors cursor-pointer ${imgSharpen ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    Sharpen
                  </button>
                </div>
              </div>
            )}

            {/* Colors (Fill & Border) */}
            {activeObject.type !== 'image' && !(activeObject as any).id?.startsWith('barcode') && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Fill Color</label>
                  <div className="flex items-center gap-1.5">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[8px] font-black uppercase">
                      <button
                        onClick={() => {
                          setObjectFillType('solid');
                          const solidColor = objectColor === "transparent" ? "#FFFFFF" : objectColor;
                          setObjectColor(solidColor);
                          updateActiveObjectProperty("fill", solidColor, true);
                        }}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${objectFillType === 'solid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                      >
                        Solid
                      </button>
                      <button
                        onClick={() => {
                          setObjectFillType('gradient');
                          applyGradientFill(objectGradientStart, objectGradientEnd, objectGradientAngle, true);
                        }}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${objectFillType === 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                      >
                        Gradient
                      </button>
                    </div>
                    {objectFillType === 'solid' && (
                      <button
                        onClick={() => {
                          const isTrans = objectColor === "transparent";
                          const newVal = isTrans ? "#FFFFFF" : "transparent";
                          setObjectColor(newVal);
                          updateActiveObjectProperty("fill", newVal, true);
                        }}
                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded cursor-pointer ${
                          objectColor === "transparent" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        None
                      </button>
                    )}
                  </div>
                </div>
                {objectFillType === 'solid' && objectColor !== "transparent" && (
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={objectColor.startsWith("#") ? objectColor : "#FFFFFF"}
                      onChange={(e) => {
                        setObjectColor(e.target.value);
                        updateActiveObjectProperty("fill", e.target.value, false);
                      }}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={objectColor}
                      onChange={(e) => {
                        setObjectColor(e.target.value);
                        updateActiveObjectProperty("fill", e.target.value, false);
                      }}
                      className="flex-1 text-xs font-semibold uppercase px-2 py-1 border border-slate-200 rounded-lg text-center font-mono"
                    />
                  </div>
                )}

                {objectFillType === 'gradient' && (
                  <div className="space-y-2 bg-white p-2 border border-slate-200 rounded-xl">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                        <div className="flex gap-1 items-center">
                          <input
                            type="color"
                            value={objectGradientStart}
                            onChange={(e) => {
                              setObjectGradientStart(e.target.value);
                              applyGradientFill(e.target.value, objectGradientEnd, objectGradientAngle, false);
                            }}
                            onBlur={() => applyGradientFill(objectGradientStart, objectGradientEnd, objectGradientAngle, true)}
                            className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                          />
                          <span className="text-[9px] font-black text-slate-400 uppercase truncate">{objectGradientStart}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 block mb-0.5 uppercase">Color 2</label>
                        <div className="flex gap-1 items-center">
                          <input
                            type="color"
                            value={objectGradientEnd}
                            onChange={(e) => {
                              setObjectGradientEnd(e.target.value);
                              applyGradientFill(objectGradientStart, e.target.value, objectGradientAngle, false);
                            }}
                            onBlur={() => applyGradientFill(objectGradientStart, objectGradientEnd, objectGradientAngle, true)}
                            className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                          />
                          <span className="text-[9px] font-black text-slate-400 uppercase truncate">{objectGradientEnd}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase">
                        <span>Angle</span>
                        <span>{objectGradientAngle}°</span>
                      </div>
                      <input
                        type="range" min="0" max="360" step="1" value={objectGradientAngle}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setObjectGradientAngle(val);
                          applyGradientFill(objectGradientStart, objectGradientEnd, val, false);
                        }}
                        onMouseUp={() => applyGradientFill(objectGradientStart, objectGradientEnd, objectGradientAngle, true)}
                        onTouchEnd={() => applyGradientFill(objectGradientStart, objectGradientEnd, objectGradientAngle, true)}
                        className="w-full accent-indigo-600 h-1 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Border Settings */}
                {activeObject.type !== 'i-text' && activeObject.type !== 'text' && activeObject.type !== 'textbox' && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Border Color</label>
                      <button
                        onClick={() => {
                          const isTrans = objectStrokeColor === "transparent";
                          const newVal = isTrans ? "#000000" : "transparent";
                          setObjectStrokeColor(newVal);
                          updateActiveObjectProperty("stroke", newVal, true);
                        }}
                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded cursor-pointer ${
                          objectStrokeColor === "transparent" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        None
                      </button>
                    </div>
                    {objectStrokeColor !== "transparent" && (
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={objectStrokeColor.startsWith("#") ? objectStrokeColor : "#000000"}
                          onChange={(e) => {
                            setObjectStrokeColor(e.target.value);
                            updateActiveObjectProperty("stroke", e.target.value, false);
                          }}
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={objectStrokeColor}
                          onChange={(e) => {
                            setObjectStrokeColor(e.target.value);
                            updateActiveObjectProperty("stroke", e.target.value, false);
                          }}
                          className="flex-1 text-xs font-semibold uppercase px-2 py-1 border border-slate-200 rounded-lg text-center font-mono"
                        />
                      </div>
                    )}
                    {objectStrokeColor !== "transparent" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                          <span>Border Weight</span>
                          <span>{objectStrokeWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={objectStrokeWidth}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setObjectStrokeWidth(val);
                            updateActiveObjectProperty("strokeWidth", val, false);
                          }}
                          className="w-full accent-indigo-600 h-1 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* General Properties */}
            <div className="space-y-3 pt-2.5 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                  <span>Opacity</span>
                  <span>{Math.round(objectOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={objectOpacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setObjectOpacity(val);
                    updateActiveObjectProperty("opacity", val, false);
                  }}
                  className="w-full accent-indigo-600 h-1 cursor-pointer"
                />
              </div>

              {/* Blend Mode (Photoshop-style compositing) */}
              {!(activeObject as any).id?.startsWith('barcode') && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Blend Mode</label>
                  <select
                    value={objectBlendMode}
                    onChange={(e) => {
                      setObjectBlendMode(e.target.value);
                      updateActiveObjectProperty("globalCompositeOperation", e.target.value, true);
                    }}
                    className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {BLEND_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Exact dimensions */}
              {!(activeObject as any).id?.startsWith('barcode') && (
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Width (px)</label>
                    <input
                      type="number"
                      min="1"
                      value={objectWidth}
                      onChange={(e) => handleExactWidth(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded-lg outline-none font-sans text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Height (px)</label>
                    <input
                      type="number"
                      min="1"
                      value={objectHeight}
                      onChange={(e) => handleExactHeight(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded-lg outline-none font-sans text-center"
                    />
                  </div>
                </div>
              )}

              {/* Flips */}
              {activeObject.type !== 'i-text' && activeObject.type !== 'text' && activeObject.type !== 'textbox' && (
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Flip Object</label>
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white text-center">
                    <button
                      onClick={toggleFlipX}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase transition-colors ${
                        objectFlipX ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Flip H
                    </button>
                    <button
                      onClick={toggleFlipY}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase transition-colors border-l border-slate-100 ${
                        objectFlipY ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Flip V
                    </button>
                  </div>
                </div>
              )}

              {/* Shadows */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={objectHasShadow}
                    onChange={(e) => {
                      setObjectHasShadow(e.target.checked);
                      updateActiveObjectShadow(e.target.checked, objectShadowColor, objectShadowBlur, objectShadowOffsetX, objectShadowOffsetY);
                    }}
                    className="rounded text-indigo-500 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[9px] font-black text-slate-400 uppercase">Enable Layer Shadow</span>
                </label>
                
                {objectHasShadow && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="col-span-2">
                      <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Shadow Color</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={objectShadowColor.startsWith('rgba') ? '#000000' : objectShadowColor}
                          onChange={(e) => {
                            setObjectShadowColor(e.target.value);
                            updateActiveObjectShadow(true, e.target.value, objectShadowBlur, objectShadowOffsetX, objectShadowOffsetY, false);
                          }}
                          className="w-5 h-5 rounded cursor-pointer border border-slate-200"
                        />
                        <input
                          type="text"
                          value={objectShadowColor}
                          onChange={(e) => {
                            setObjectShadowColor(e.target.value);
                            updateActiveObjectShadow(true, e.target.value, objectShadowBlur, objectShadowOffsetX, objectShadowOffsetY, false);
                          }}
                          className="flex-1 text-[8px] font-bold p-0.5 border border-slate-200 rounded font-mono text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Blur ({objectShadowBlur}px)</label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={objectShadowBlur}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setObjectShadowBlur(val);
                          updateActiveObjectShadow(true, objectShadowColor, val, objectShadowOffsetX, objectShadowOffsetY, false);
                        }}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Offset X ({objectShadowOffsetX}px)</label>
                      <input
                        type="range"
                        min="-15"
                        max="15"
                        value={objectShadowOffsetX}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setObjectShadowOffsetX(val);
                          updateActiveObjectShadow(true, objectShadowColor, objectShadowBlur, val, objectShadowOffsetY, false);
                        }}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Alignments */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (!canvas || !activeObject) return;
                    canvas.centerObjectH(activeObject);
                    canvas.requestRenderAll();
                    canvas.fire("object:modified", { target: activeObject });
                  }}
                  className="py-1 border border-slate-200 rounded-lg text-[9px] font-black uppercase hover:bg-slate-50 transition-all text-slate-700 cursor-pointer"
                >
                  Center H
                </button>
                <button
                  onClick={() => {
                    if (!canvas || !activeObject) return;
                    canvas.centerObjectV(activeObject);
                    canvas.requestRenderAll();
                    canvas.fire("object:modified", { target: activeObject });
                  }}
                  className="py-1 border border-slate-200 rounded-lg text-[9px] font-black uppercase hover:bg-slate-50 transition-all text-slate-700 cursor-pointer"
                >
                  Center V
                </button>
              </div>

              {/* Layer Placement */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (canvas && activeObject) {
                      activeObject.bringToFront();
                      canvas.requestRenderAll();
                    }
                  }}
                  className="py-1 border border-slate-200 rounded-lg text-[9px] font-black uppercase hover:bg-slate-50 transition-all text-slate-700 cursor-pointer"
                >
                  Bring Front
                </button>
                <button
                  onClick={() => {
                    if (canvas && activeObject) {
                      activeObject.sendToBack();
                      canvas.requestRenderAll();
                    }
                  }}
                  className="py-1 border border-slate-200 rounded-lg text-[9px] font-black uppercase hover:bg-slate-50 transition-all text-slate-700 cursor-pointer"
                >
                  Send Back
                </button>
              </div>

              {/* Lock & Edit Actions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <button 
                  onClick={toggleLockSelected}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-black border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isObjectLocked 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isObjectLocked ? "🔓 Unlock Layer" : "🔒 Lock Layer"}
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button 
                    onClick={copySelected}
                    disabled={isObjectLocked}
                    className="py-1 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    Copy
                  </button>
                  <button 
                    onClick={duplicateSelected}
                    disabled={isObjectLocked}
                    className="py-1 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    Duplicate
                  </button>
                  <button 
                    onClick={deleteSelected}
                    className="col-span-2 py-1 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Delete Layer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeToolTab === 'elements' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Library Assets</h3>
              <div className="flex items-center gap-1 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                <svg className="w-2.5 h-2.5 animate-pulse" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"></circle></svg>
                <span>Autosave</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Text Layer */}
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Text Styles</span>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={addHeading} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-indigo-400 hover:shadow-sm transition-all text-slate-700 cursor-pointer">
                    <span className="text-sm font-black text-indigo-500 w-4 text-center">H</span>
                    <span>Add Heading (Large)</span>
                  </button>
                  <button onClick={addText} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-indigo-400 hover:shadow-sm transition-all text-slate-700 cursor-pointer">
                    <Type className="w-4 h-4 text-indigo-500"/>
                    <span>Add Simple Text (Single Line)</span>
                  </button>
                  <button onClick={addMultilineText} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-indigo-400 hover:shadow-sm transition-all text-slate-700 cursor-pointer">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span>Add Paragraph (Multiline)</span>
                  </button>
                  <button onClick={addCurvedText} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-indigo-400 hover:shadow-sm transition-all text-slate-700 cursor-pointer">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15a8 8 0 0 1 16 0" />
                    </svg>
                    <span>Add Curved / Arc Text</span>
                  </button>
                </div>
              </div>

              {/* Shapes Grid */}
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Shapes</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={addRectangle} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <Square className="w-4 h-4 text-amber-500"/> Rect
                  </button>
                  <button onClick={addCircle} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <CircleIcon className="w-4 h-4 text-sky-500"/> Circle
                  </button>
                  <button onClick={addTriangle} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 22h20L12 2z" />
                    </svg>
                    Triangle
                  </button>
                  <button onClick={addHexagon} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2l9 5.196v10.392l-9 5.196-9-5.196V7.196L12 2z" />
                    </svg>
                    Hexagon
                  </button>
                  <button onClick={addPentagon} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2l9.5 6.9-3.6 11.1H6.1L2.5 8.9 12 2z" />
                    </svg>
                    Pentagon
                  </button>
                  <button onClick={addOctagon} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 2h8l6 6v8l-6 6H8l-6-6V8l6-6z" />
                    </svg>
                    Octagon
                  </button>
                  <button onClick={addEllipse} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <ellipse cx="12" cy="12" rx="10" ry="6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Ellipse
                  </button>
                  <button onClick={addDiamond} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 12l10 10 10-10L12 2z" />
                    </svg>
                    Diamond
                  </button>
                  <button onClick={addTrapezoid} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 4h12l4 16H2L6 4z" />
                    </svg>
                    Trapezoid
                  </button>
                  <button onClick={addStar} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20"/> Star
                  </button>
                  <button onClick={addHeart} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-red-500 fill-red-500/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Heart
                  </button>
                </div>
              </div>

              {/* Utility / Barcode */}
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Utilities</span>
                <div className="space-y-2">
                  <button onClick={addLine} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <Ruler className="w-4 h-4 text-rose-500"/> Add Line Divider
                  </button>
                  <button onClick={addBarcodePlaceholder} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <Grid className="w-4 h-4 text-slate-500"/> Add Barcode Placeholder
                  </button>

                  {/* KDP Barcode Guidelines Help Card */}
                  <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-xl space-y-2 mt-2">
                    <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider block">KDP Barcode Guidelines:</span>
                    <ul className="list-disc pl-3.5 text-[9px] font-semibold text-slate-600 space-y-1 leading-normal">
                      <li>
                        <strong>Clear Barcode Space:</strong> Keep the lower-right corner of the back cover completely clear (blank 2.0″ wide by 1.2″ high).
                      </li>
                      <li>
                        <strong>No-Design Zone:</strong> Avoid placing logos, text, or shapes in this zone. You can use the barcode placeholder to align your design.
                      </li>
                      <li>
                        <strong>Single Cover PDF:</strong> Export your final cover as a single combined PDF (back, spine, and front).
                      </li>
                      <li>
                        <strong>KDP Settings:</strong> When uploading to KDP, select <strong>"No, my cover file does not include a barcode"</strong> so KDP prints it automatically.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={snapToGrid} 
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-black text-slate-700 flex items-center gap-1">Snap to Grid (10px)</span>
              </label>
            </div>

            {/* Canvas Layers Manager */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Canvas Layers ({layers.length})</h4>
              {layers.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No layers added yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {layers.map((layer: any, idx) => {
                    const isSelected = activeObject === layer;
                    let icon = "📝";
                    let label = "Layer";
                    
                    if (layer.type === 'i-text' || layer.type === 'text') {
                      icon = "🔤";
                      label = layer.text ? (layer.text.length > 15 ? `${layer.text.substring(0, 15)}...` : layer.text) : "Text";
                    } else if (layer.type === 'rect') {
                      if (layer.id?.startsWith('barcode')) {
                        icon = "📊";
                        label = "Barcode Placeholder";
                      } else {
                        icon = "⏹️";
                        label = "Rectangle";
                      }
                    } else if (layer.type === 'circle') {
                      icon = "⚪";
                      label = "Circle";
                    } else if (layer.type === 'line') {
                      icon = "➖";
                      label = "Line Divider";
                    } else if (layer.type === 'polygon' || layer.type === 'star') {
                      icon = "⭐";
                      label = "Star Shape";
                    } else if (layer.type === 'image') {
                      icon = "🖼️";
                      label = "Image/Clipart";
                    } else if (layer.type === 'group') {
                      if (layer.id?.startsWith('barcode')) {
                        icon = "📊";
                        label = "Barcode Placeholder";
                      } else {
                        icon = "📦";
                        label = "Group";
                      }
                    }
                    
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all text-xs font-semibold ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm select-none">{icon}</span>
                        <span 
                          onClick={() => {
                            if (canvas) {
                              canvas.setActiveObject(layer);
                              canvas.requestRenderAll();
                            }
                          }}
                          className="flex-1 truncate cursor-pointer select-none leading-none pr-1"
                          title={label}
                        >
                          {label}
                        </span>
                        
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => {
                              if (canvas) {
                                layer.bringForward();
                                canvas.requestRenderAll();
                                canvas.fire("object:modified", { target: layer });
                              }
                            }}
                            title="Move Up"
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 active:scale-95"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (canvas) {
                                layer.sendBackwards();
                                canvas.requestRenderAll();
                                canvas.fire("object:modified", { target: layer });
                              }
                            }}
                            title="Move Down"
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 active:scale-95"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (canvas) {
                                canvas.remove(layer);
                                if (activeObject === layer) {
                                  canvas.discardActiveObject();
                                  setActiveObject(null);
                                }
                                canvas.requestRenderAll();
                                canvas.fire("object:modified", { target: layer });
                              }
                            }}
                            title="Delete Layer"
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 active:scale-95"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeToolTab === 'graphics' && (
          <div className="space-y-4">
            {/* Sub-tabs for KDP Icons & Unsplash Photos */}
            <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/40 text-[10px] font-black uppercase">
              <button 
                onClick={() => setGraphicsSubTab('kdp-icons')}
                className={`flex-1 py-1 rounded-md text-center transition-all ${graphicsSubTab === 'kdp-icons' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                KDP Icons
              </button>
              <button 
                onClick={() => setGraphicsSubTab('unsplash')}
                className={`flex-1 py-1 rounded-md text-center transition-all ${graphicsSubTab === 'unsplash' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Search Photos
              </button>
            </div>

            {graphicsSubTab === 'kdp-icons' ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {KDP_ICONS_LIBRARY.map((category, catIdx) => (
                  <details 
                    key={catIdx} 
                    className="group border border-slate-200 rounded-xl overflow-hidden bg-white [&_summary::-webkit-details-marker]:hidden" 
                    open={catIdx === 0}
                  >
                    <summary className="flex items-center justify-between p-3 cursor-pointer select-none bg-slate-55 border-b border-slate-100 hover:bg-slate-100/50 transition-colors">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{category.category}</span>
                      <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    </summary>
                    <div className="p-3 bg-white">
                      <div className="grid grid-cols-4 gap-2">
                        {category.icons.map((icon, iconIdx) => (
                          <button
                            key={iconIdx}
                            onClick={() => addVectorIcon(icon.path, icon.fill, icon.stroke, icon.strokeWidth, (icon as any).strokeDashArray, icon.viewBox)}
                            title={icon.name}
                            className="aspect-square flex items-center justify-center p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95 text-slate-500 cursor-pointer"
                          >
                            <svg 
                              viewBox={`0 0 ${icon.viewBox || 24} ${icon.viewBox || 24}`} 
                              className="w-7 h-7 stroke-current fill-none" 
                              style={{ fill: icon.fill !== 'transparent' ? 'currentColor' : 'none' }}
                            >
                              <path 
                                d={icon.path} 
                                strokeWidth={icon.strokeWidth || 2} 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeDasharray={icon.strokeDashArray ? icon.strokeDashArray.join(' ') : undefined} 
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Unsplash Image Search</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search covers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUnsplash()}
                      className="flex-1 text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-amber-400 outline-none bg-white"
                    />
                    <button
                      onClick={handleSearchUnsplash}
                      disabled={isSearching}
                      className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black"
                    >
                      {isSearching ? "..." : "Search"}
                    </button>
                  </div>
                  {searchError && (
                    <p className="text-[9px] text-red-500 font-semibold mt-1 bg-red-55/40 p-2 rounded-lg leading-normal">
                      {searchError}
                    </p>
                  )}
                </div>

                {/* Display Unsplash Results if Search matches */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Search Results</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                      {searchResults.map((clip, i) => (
                        <div
                          key={i}
                          className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all p-1"
                        >
                          <img src={clip.thumb} alt={clip.name} crossOrigin="anonymous" className="w-full h-full object-cover rounded-lg" />
                          
                          {/* Hover Actions Menu */}
                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1.5 p-2 z-10">
                            <button
                              onClick={() => addClipart(clip.full)}
                              className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider"
                            >
                              Add Layer
                            </button>
                            <button
                              onClick={() => applyBackgroundImage(clip.full, 'full')}
                              className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                            >
                              Full BG
                            </button>
                            <button
                              onClick={() => applyBackgroundImage(clip.full, 'front')}
                              className="w-full py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                            >
                              Front BG
                            </button>
                            <button
                              onClick={() => applyBackgroundImage(clip.full, 'back')}
                              className="w-full py-1 bg-teal-600 hover:bg-teal-600 text-white rounded text-[9px] font-black uppercase tracking-wider"
                            >
                              Back BG
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Premium Schematics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CLIPARTS.map((clip, i) => (
                      <div 
                        key={i} 
                        className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all p-1"
                      >
                        <img src={clip.src} alt={clip.name} crossOrigin="anonymous" className="w-full h-full object-cover rounded-lg" />
                        <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-[8px] text-white text-center font-bold px-1 py-0.5 rounded truncate group-hover:hidden">{clip.name}</span>
                        
                        {/* Hover Actions Menu */}
                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1.5 p-2 z-10">
                          <button
                            onClick={() => addClipart(clip.src)}
                            className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider"
                          >
                            Add Layer
                          </button>
                          <button
                            onClick={() => applyBackgroundImage(clip.src, 'full')}
                            className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                          >
                            Full BG
                          </button>
                          <button
                            onClick={() => applyBackgroundImage(clip.src, 'front')}
                            className="w-full py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                          >
                            Front BG
                          </button>
                          <button
                            onClick={() => applyBackgroundImage(clip.src, 'back')}
                            className="w-full py-1 bg-teal-600 hover:bg-teal-600 text-white rounded text-[9px] font-black uppercase tracking-wider"
                          >
                            Back BG
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeToolTab === 'presets' && (
          <div className="space-y-4">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Preset Styles</h3>
            <div className="space-y-2">
              {BACKGROUNDS.map((bg, i) => (
                <button 
                  key={i} 
                  onClick={() => applyPresetColors(bg.back, bg.front, bg.type, bg.backStart, bg.backEnd, bg.frontStart, bg.frontEnd)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all text-left flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-black text-slate-700">{bg.name}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="w-4 h-4 rounded border border-slate-200 block" style={{ backgroundColor: bg.type === 'gradient' ? bg.backStart : bg.back }} />
                      <span className="w-4 h-4 rounded border border-slate-200 block" style={{ backgroundColor: bg.type === 'gradient' ? bg.frontEnd : bg.front }} />
                      <span className="text-[9px] text-slate-400 font-bold uppercase self-center">{bg.type}</span>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <div className="h-px bg-slate-200 my-4" />

            <div className="space-y-4">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Custom Gradient & Colors</h3>
              
              {/* Back Cover Customization */}
              <div className="space-y-2 border-b border-slate-200 pb-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 block">Back Cover Background</label>
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40 text-[9px] font-black uppercase">
                    <button 
                      onClick={() => setBackCoverType('solid')}
                      className={`px-2 py-1 rounded-md transition-all ${backCoverType === 'solid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Solid
                    </button>
                    <button 
                      onClick={() => setBackCoverType('gradient')}
                      className={`px-2 py-1 rounded-md transition-all ${backCoverType === 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {backCoverType === 'solid' ? (
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={backCoverColor} 
                      onChange={(e) => setBackCoverColor(e.target.value)} 
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white shadow-sm" 
                    />
                    <input 
                      type="text" 
                      value={backCoverColor} 
                      onChange={(e) => setBackCoverColor(e.target.value)} 
                      className="flex-1 text-xs font-bold uppercase p-2 border border-slate-200 rounded-xl text-center font-mono" 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2 border rounded-xl">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={backCoverGradientStart} 
                          onChange={(e) => setBackCoverGradientStart(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{backCoverGradientStart}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 2</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={backCoverGradientEnd} 
                          onChange={(e) => setBackCoverGradientEnd(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{backCoverGradientEnd}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Front Cover Customization */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 block">Front Cover Background</label>
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40 text-[9px] font-black uppercase">
                    <button 
                      onClick={() => setFrontCoverType('solid')}
                      className={`px-2 py-1 rounded-md transition-all ${frontCoverType === 'solid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Solid
                    </button>
                    <button 
                      onClick={() => setFrontCoverType('gradient')}
                      className={`px-2 py-1 rounded-md transition-all ${frontCoverType === 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {frontCoverType === 'solid' ? (
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={frontCoverColor} 
                      onChange={(e) => setFrontCoverColor(e.target.value)} 
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white shadow-sm" 
                    />
                    <input 
                      type="text" 
                      value={frontCoverColor} 
                      onChange={(e) => setFrontCoverColor(e.target.value)} 
                      className="flex-1 text-xs font-bold uppercase p-2 border border-slate-200 rounded-xl text-center font-mono" 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2 border rounded-xl">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={frontCoverGradientStart} 
                          onChange={(e) => setFrontCoverGradientStart(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{frontCoverGradientStart}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 2</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={frontCoverGradientEnd} 
                          onChange={(e) => setFrontCoverGradientEnd(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{frontCoverGradientEnd}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeToolTab === 'uploads' && (
          <div className="space-y-5">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Custom Graphics</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Upload Local Image</label>
              <label className="w-full p-3 bg-white border border-dashed border-slate-300 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-2 hover:border-amber-400 hover:bg-slate-50/50 cursor-pointer transition-all text-slate-600">
                <Upload className="w-5 h-5 text-indigo-500"/>
                <span>Choose Image File</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event: any) => {
                        setUploadedImages(prev => [...prev, event.target.result]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden" 
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Add Image by URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Paste image URL..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 text-xs font-semibold p-2 border border-slate-200 rounded-xl focus:border-amber-400 outline-none"
                />
                <button 
                  onClick={() => {
                    if (imageUrlInput.trim()) {
                      setUploadedImages(prev => [...prev, imageUrlInput.trim()]);
                      setImageUrlInput('');
                    }
                  }}
                  className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black font-sans"
                >
                  Add
                </button>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded Assets</p>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((src, i) => (
                    <div 
                      key={i} 
                      className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all p-1"
                    >
                      <img src={src} alt="UploadedAsset" className="w-full h-full object-cover rounded-lg" />
                      
                      {/* Hover Actions Menu */}
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1.5 p-2 z-10">
                        <button
                          onClick={() => addClipart(src)}
                          className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Add Layer
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(src, 'full')}
                          className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Full BG
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(src, 'front')}
                          className="w-full py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Front BG
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(src, 'back')}
                          className="w-full py-1 bg-teal-600 hover:bg-teal-600 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Back BG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeToolTab === 'settings' && (
          <div className="space-y-5">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Layout Canvas Specs</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Book Trim Size</label>
                <select 
                  value={trimSize.label} 
                  onChange={(e) => {
                    const size = TRIM_SIZES.find(s => s.label === e.target.value);
                    if (size) setTrimSize(size);
                  }}
                  className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl"
                >
                  {TRIM_SIZES.map((sz, i) => (
                    <option key={i} value={sz.label}>{sz.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Paper Type (Spine Factor)</label>
                <select 
                  value={paperType} 
                  onChange={(e) => setPaperType(e.target.value as any)}
                  className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="white">White Paper (0.002252"/pg)</option>
                  <option value="cream">Cream Paper (0.002500"/pg)</option>
                  <option value="color">Color Paper (0.002347"/pg)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Interior Pages Count ({pageCount})</label>
                <input 
                  type="range" 
                  min="24" 
                  max="600" 
                  value={pageCount} 
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-ew-resize bg-slate-200 rounded"
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Spine size: {layout.spineWidth.toFixed(4)}" inches</p>
              </div>

              {/* KDP Gutter Reference Card */}
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 space-y-1.5 mt-2">
                <span className="text-[9px] font-black text-amber-800 uppercase block tracking-wider">📐 KDP Interior Guidelines</span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-slate-600 font-semibold leading-normal">
                  <span>Page Count:</span>
                  <span className="font-bold text-slate-800">{pageCount} pages</span>
                  
                  <span>Inside Gutter:</span>
                  <span className="font-bold text-slate-800">{getKdpGutterReference(pageCount).gutter}</span>
                  
                  <span>Outside (No Bleed):</span>
                  <span className="font-bold text-slate-800">{getKdpGutterReference(pageCount).outsideNoBleed}</span>
                  
                  <span>Outside (With Bleed):</span>
                  <span className="font-bold text-slate-800">{getKdpGutterReference(pageCount).outsideBleed}</span>
                </div>
              </div>

              {/* Active Background Images Clear Actions */}
              {(backCoverImage || frontCoverImage || fullCoverImage) && (
                <div className="space-y-2 border-b border-slate-200 pb-3">
                  <label className="text-xs font-bold text-slate-600 block">Active Image Backgrounds</label>
                  <div className="space-y-1.5">
                    {fullCoverImage && (
                      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[10px]">
                        <span className="font-semibold text-indigo-950 truncate max-w-[150px]">Full Cover BG Image</span>
                        <button onClick={() => setFullCoverImage('')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Clear</button>
                      </div>
                    )}
                    {backCoverImage && (
                      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[10px]">
                        <span className="font-semibold text-indigo-950 truncate max-w-[150px]">Back Cover BG Image</span>
                        <button onClick={() => setBackCoverImage('')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Clear</button>
                      </div>
                    )}
                    {frontCoverImage && (
                      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[10px]">
                        <span className="font-semibold text-indigo-950 truncate max-w-[150px]">Front Cover BG Image</span>
                        <button onClick={() => setFrontCoverImage('')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Clear</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="h-px bg-slate-200 my-4" />

              {/* Back Cover Customization */}
              <div className="space-y-2 border-b border-slate-200 pb-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 block">Back Cover Background</label>
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40 text-[9px] font-black uppercase">
                    <button 
                      onClick={() => setBackCoverType('solid')}
                      className={`px-2 py-1 rounded-md transition-all ${backCoverType === 'solid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Solid
                    </button>
                    <button 
                      onClick={() => setBackCoverType('gradient')}
                      className={`px-2 py-1 rounded-md transition-all ${backCoverType === 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {backCoverType === 'solid' ? (
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={backCoverColor} 
                      onChange={(e) => setBackCoverColor(e.target.value)} 
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white shadow-sm" 
                    />
                    <input 
                      type="text" 
                      value={backCoverColor} 
                      onChange={(e) => setBackCoverColor(e.target.value)} 
                      className="flex-1 text-xs font-bold uppercase p-2 border border-slate-200 rounded-xl text-center font-mono" 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2 border rounded-xl">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={backCoverGradientStart} 
                          onChange={(e) => setBackCoverGradientStart(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{backCoverGradientStart}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 2</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={backCoverGradientEnd} 
                          onChange={(e) => setBackCoverGradientEnd(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{backCoverGradientEnd}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Front Cover Customization */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 block">Front Cover Background</label>
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40 text-[9px] font-black uppercase">
                    <button 
                      onClick={() => setFrontCoverType('solid')}
                      className={`px-2 py-1 rounded-md transition-all ${frontCoverType === 'solid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Solid
                    </button>
                    <button 
                      onClick={() => setFrontCoverType('gradient')}
                      className={`px-2 py-1 rounded-md transition-all ${frontCoverType === 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {frontCoverType === 'solid' ? (
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={frontCoverColor} 
                      onChange={(e) => setFrontCoverColor(e.target.value)} 
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white shadow-sm" 
                    />
                    <input 
                      type="text" 
                      value={frontCoverColor} 
                      onChange={(e) => setFrontCoverColor(e.target.value)} 
                      className="flex-1 text-xs font-bold uppercase p-2 border border-slate-200 rounded-xl text-center font-mono" 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2 border rounded-xl">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={frontCoverGradientStart} 
                          onChange={(e) => setFrontCoverGradientStart(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{frontCoverGradientStart}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 2</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={frontCoverGradientEnd} 
                          onChange={(e) => setFrontCoverGradientEnd(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{frontCoverGradientEnd}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      )}

      {/* 3. FABRIC WORKSPACE */}
      <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 relative overflow-auto min-w-0">
        {/* Spine details helper */}
        <div className="mb-2 sm:mb-0 sm:absolute sm:top-4 bg-slate-950/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-800 text-[9px] sm:text-[10px] font-black uppercase text-amber-400 tracking-widest shadow-md z-20 max-w-full text-center truncate">
          Trim Size: {trimSize.w}" x {trimSize.h}" | Spine Width: {layout.spineWidth.toFixed(3)}"
        </div>

        {/* Global Canvas Control Bar */}
        <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 bg-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-full border border-slate-200 shadow-sm z-10 select-none max-w-full overflow-x-auto">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all duration-150 active:scale-[0.94] flex items-center gap-1.5"
          >
            <Undo2 className="w-4 h-4"/>
            <span className="text-[10px] font-black uppercase tracking-wider">Undo</span>
          </button>

          <button
            onClick={handleRedo}
            disabled={historyStep === history.length - 1}
            title="Redo (Ctrl+Y)"
            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all duration-150 active:scale-[0.94] flex items-center gap-1.5"
          >
            <Redo2 className="w-4 h-4"/>
            <span className="text-[10px] font-black uppercase tracking-wider">Redo</span>
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button
            onClick={deleteSelected}
            disabled={!activeObject}
            title="Erase / Delete Selected Layer (Delete)"
            className="p-2 rounded-full text-red-600 hover:bg-red-50 disabled:opacity-30 transition-all duration-150 active:scale-[0.94] flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4"/>
            <span className="text-[10px] font-black uppercase tracking-wider">Erase</span>
          </button>

          <button
            onClick={handleClearCanvas}
            disabled={layers.length === 0}
            title="Clear All Layers"
            className="p-2 rounded-full text-slate-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 transition-all duration-150 active:scale-[0.94] flex items-center gap-1.5"
          >
            <Eraser className="w-4 h-4"/>
            <span className="text-[10px] font-black uppercase tracking-wider">Clear All</span>
          </button>
        </div>

        {/* Responsive parent container to calculate scale */}
        <div ref={containerRef} className="flex-1 w-full h-full min-h-0 overflow-hidden flex items-center justify-center relative">
          {/* Scaled canvas container */}
          <div
            style={{
              transform: `scale(${scaleRatio})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease',
              boxShadow: "var(--shadow-soft-lg)"
            }}
            className="relative bg-white rounded-sm ring-1 ring-slate-300 overflow-hidden cursor-default flex-shrink-0"
          >
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Instructions Bar */}
        <div className="mt-4 flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white py-2.5 px-6 rounded-full border border-slate-200 shadow-sm">
          <span>Left: Back Cover</span>
          <span className="text-amber-500">Center: Spine</span>
          <span>Right: Front Cover</span>
        </div>
      </div>

      <TemplateGalleryModal
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={(template, photoUrl) => {
          applyTemplate(template, photoUrl);
          setIsTemplateGalleryOpen(false);
        }}
      />

      <CoverMockup3DModal
        isOpen={isMockupOpen}
        onClose={() => setIsMockupOpen(false)}
        frontImageDataUrl={mockupFrontUrl}
        spineImageDataUrl={mockupSpineUrl}
        frontAspect={trimSize.w / trimSize.h}
        spineWidthInches={layout.spineWidth}
        frontWidthInches={trimSize.w}
        isLoading={isMockupLoading}
      />
    </div>
  );
}
