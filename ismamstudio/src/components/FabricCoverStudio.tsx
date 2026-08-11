"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fabric } from "fabric";
import { 
  Type, Square, Circle as CircleIcon, Star, Ruler, 
  Trash2, Undo2, Redo2, Loader2, Download, Check, Settings,
  Sparkles, Shapes, Upload, LayoutTemplate, Grid, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Plus, Eraser, Lock, Unlock, Copy, Scissors, Clipboard, ChevronsUp, ChevronsDown,
  Bold, Italic, Underline, AlignJustify, Box, Layers as LayersIcon,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround, History, Share2, Pencil,
  Image as ImageIcon, ZoomIn, ZoomOut, Group as GroupIcon, Ungroup as UngroupIcon, Store,
  Paintbrush, ClipboardPaste, ImageOff, RefreshCw, FlipHorizontal, FlipVertical, SlidersHorizontal, Pipette,
  Keyboard, X as XIcon
} from "lucide-react";
import { calculateKdpLayout, KdpSpecs, KdpLayoutResult } from "@/app/utils/kdpLayout";
import { initFabricSnapping } from "@/hooks/useFabricSnap";
import { COVER_TEMPLATES, resolveTemplateElements, CoverTemplate } from "@/lib/coverTemplates";
import TemplateGalleryModal from "@/components/TemplateGalleryModal";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import CoverMockup3DModal from "@/components/CoverMockup3DModal";
import MarketplaceThumbnailPreviewModal from "@/components/MarketplaceThumbnailPreviewModal";
import SeriesBrandingModal from "@/components/SeriesBrandingModal";
import BackgroundRemoverModal from "@/components/BackgroundRemoverModal";
import FontPicker from "@/components/FontPicker";
import DesktopRecommendedBanner from "@/components/DesktopRecommendedBanner";
import { loadGoogleFontFamilies } from "@/lib/loadGoogleFont";
import { COVER_TEXTURES, TEXTURE_CATEGORIES, renderTexture, CoverTexture } from "@/lib/coverTextures";
import VersionHistoryModal from "@/components/VersionHistoryModal";
import { CoverVersion } from "@/lib/coverVersions";
import { BrandKit, loadBrandKit, addBrandColor, removeBrandColor, addBrandFont, removeBrandFont } from "@/lib/brandKit";
import { relayoutLegacyElements, layoutsDiffer } from "@/lib/coverRelayout";
import ShareReviewModal from "@/components/ShareReviewModal";

// Text-on-a-path shapes. "arc" is the original circular layout; the rest are
// sampled parametric curves (see samplePathPoints).
type PathShape = 'arc' | 'wave' | 'bump' | 'valley' | 'slant';

const PATH_SHAPE_OPTIONS: { value: PathShape; label: string }[] = [
  { value: 'arc', label: 'Circle' },
  { value: 'bump', label: 'Arch' },
  { value: 'valley', label: 'Valley' },
  { value: 'wave', label: 'Wave' },
  { value: 'slant', label: 'Slant' },
];

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
  },
  {
    category: "Nature & Weather",
    icons: [
      { name: "Sun", path: "M 8,12 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0 M12 2v2 M12 20v2 m4.93 4.93 1.41 1.41 m17.66 17.66 1.41 1.41 M2 12h2 M20 12h2 m6.34 17.66-1.41 1.41 m19.07 4.93-1.41 1.41", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Moon", path: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cloud", path: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cloud Rain", path: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242 M16 14v6 M8 14v6 M12 16v6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cloud Snow", path: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242 M8 15h.01 M8 19h.01 M12 17h.01 M12 21h.01 M16 15h.01 M16 19h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cloud Lightning", path: "M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973 m13 12-3 5h4l-3 5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Wind", path: "M12.8 19.6A2 2 0 1 0 14 16H2 M17.5 8a2.5 2.5 0 1 1 2 4H2 M9.8 4.4A2 2 0 1 1 11 8H2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Rainbow", path: "M22 17a10 10 0 0 0-20 0 M6 17a6 6 0 0 1 12 0 M10 17a2 2 0 0 1 4 0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Snowflake", path: "m10 20-1.25-2.5L6 18 M10 4 8.75 6.5 6 6 m14 20 1.25-2.5L18 18 m14 4 1.25 2.5L18 6 m17 21-3-6h-4 m17 3-3 6 1.5 3 M2 12h6.5L10 9 m20 10-1.5 2 1.5 2 M22 12h-6.5L14 15 m4 10 1.5 2L4 14 m7 21 3-6-1.5-3 m7 3 3 6h4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Leaf", path: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Trees", path: "M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z M7 16v6 M13 19v3 M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Flower", path: "M 9,12 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5 M12 7.5V9 M7.5 12H9 M16.5 12H15 M12 16.5V15 m8 8 1.88 1.88 M14.12 9.88 16 8 m8 16 1.88-1.88 M14.12 14.12 16 16", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Flower 2", path: "M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1 M 10,8 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 M12 10v12 M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Sprout", path: "M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3 M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4 M5 21h14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Mountain", path: "m8 3 4 8 5-5 5 15H2L8 3z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Mountain Snow", path: "m8 3 4 8 5-5 5 15H2L8 3z M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Waves Horizontal", path: "M2 12q2.5 2 5 0t5 0 5 0 5 0 M2 19q2.5 2 5 0t5 0 5 0 5 0 M2 5q2.5 2 5 0t5 0 5 0 5 0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Droplet", path: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Droplets", path: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Sunrise", path: "M12 2v8 m4.93 10.93 1.41 1.41 M2 18h2 M20 18h2 m19.07 10.93-1.41 1.41 M22 22H2 m8 6 4-4 4 4 M16 18a4 4 0 0 0-8 0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Sunset", path: "M12 10V2 m4.93 10.93 1.41 1.41 M2 18h2 M20 18h2 m19.07 10.93-1.41 1.41 M22 22H2 m16 6-4 4-4-4 M16 18a4 4 0 0 0-8 0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Flame", path: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Thermometer", path: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Umbrella", path: "M12 13v7a2 2 0 0 0 4 0 M12 2v2 M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Food & Drink",
    icons: [
      { name: "Coffee", path: "M10 2v2 M14 2v2 M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1 M6 2v2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cup Soda", path: "m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8 M5 8h14 M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0 m12 8 1-6h2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Wine", path: "M8 22h8 M7 10h10 M12 15v7 M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Beer", path: "M17 11h1a3 3 0 0 1 0 6h-1 M9 12v6 M13 12v6 M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Pizza", path: "m12 14-1 1 m13.75 18.25-1.25 1.42 M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12 M18.8 9.3a1 1 0 0 0 2.1 7.7 M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Sandwich", path: "m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777 M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25 M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9 m6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2 M 3,11 h 18 a 1,1 0 0 1 1,1 v 2 a 1,1 0 0 1 -1,1 h -18 a 1,1 0 0 1 -1,-1 v -2 a 1,1 0 0 1 1,-1 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cake", path: "M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8 M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1 M2 21h20 M7 8v3 M12 8v3 M17 8v3 M7 4h.01 M12 4h.01 M17 4h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cookie", path: "M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5 M8.5 8.5v.01 M16 15.5v.01 M12 12v.01 M11 17v.01 M7 14v.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Apple", path: "M12 6.528V3a1 1 0 0 1 1-1h0 M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cherry", path: "M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12 M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Grape", path: "M22 5V2l-5.89 5.89 M 13.600000000000001,15.89 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 5.109999999999999,7.4 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 9.35,11.65 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 10.91,5.85 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 15.149999999999999,10.09 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 3.5599999999999996,13.2 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 7.800000000000001,17.44 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 2,19 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Banana", path: "M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5 M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11.5 2 13 2c3.22 0 5 5.5 5 8 0 6.5-4.2 12-10.49 12C5.11 22 2 22 2 20c0-1.5 1.14-1.55 3.15-2.11Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Carrot", path: "M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46 M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Fish", path: "M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z M18 12v.5 M16 17.93a9.77 9.77 0 0 1 0-11.86 M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33 M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4 m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Egg", path: "M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Milk", path: "M8 2h8 M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2 M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Utensils", path: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Utensils Crossed", path: "m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8 M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7 m2.1 21.8 6.4-6.3 m19 5-7 7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Chef Hat", path: "M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z M6 17h12", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ice Cream Cone", path: "m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11 M17 7A5 5 0 0 0 7 7 M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Candy", path: "M10 7v10.9 M14 6.1V17 M16 7V3a1 1 0 0 1 1.707-.707 2.5 2.5 0 0 0 2.152.717 1 1 0 0 1 1.131 1.131 2.5 2.5 0 0 0 .717 2.152A1 1 0 0 1 21 8h-4 M16.536 7.465a5 5 0 0 0-7.072 0l-2 2a5 5 0 0 0 0 7.07 5 5 0 0 0 7.072 0l2-2a5 5 0 0 0 0-7.07 M8 17v4a1 1 0 0 1-1.707.707 2.5 2.5 0 0 0-2.152-.717 1 1 0 0 1-1.131-1.131 2.5 2.5 0 0 0-.717-2.152A1 1 0 0 1 3 16h4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Soup", path: "M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z M7 21h10 M19.5 12 22 6 M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62 M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62 M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Salad", path: "M7 21h10 M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1 m13 12 4-4 M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Popcorn", path: "M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4 M10 22 9 8 m14 22 1-14 M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Travel & Places",
    icons: [
      { name: "Plane", path: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Car", path: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2 M 5,17 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 M9 17h6 M 15,17 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Tram Front", path: "M 6,3 h 12 a 2,2 0 0 1 2,2 v 12 a 2,2 0 0 1 -2,2 h -12 a 2,2 0 0 1 -2,-2 v -12 a 2,2 0 0 1 2,-2 z M4 11h16 M12 3v8 m8 19-2 3 m18 22-2-3 M8 15h.01 M16 15h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ship", path: "M12 10.189V14 M12 2v3 M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6 M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76 M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Bike", path: "M 15,17.5 a 3.5,3.5 0 1,0 7,0 a 3.5,3.5 0 1,0 -7,0 M 2,17.5 a 3.5,3.5 0 1,0 7,0 a 3.5,3.5 0 1,0 -7,0 M 14,5 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0 M12 17.5V14l-3-3 4-3 2 3h2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Bus", path: "M8 6v6 M15 6v6 M2 12h19.6 M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3 M 5,18 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 M9 18h5 M 14,18 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Rocket", path: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5 M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09 M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Compass", path: "M 2,12 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Map", path: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z M15 5.764v15 M9 3.236v15", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Map Pin", path: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0 M 9,10 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Globe", path: "M 2,12 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20 M2 12h20", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Luggage", path: "M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14 M10 20h4 M 14,20 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 M 6,20 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Tent", path: "M3.5 21 14 3 M20.5 21 10 3 M15.5 21 12 15l-3.5 6 M2 21h20", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Tree Palm", path: "M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4 M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3 M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35 M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Anchor", path: "M12 6v16 m19 13 2-1a9 9 0 0 1-18 0l2 1 M9 11h6 M 10,4 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Sailboat", path: "M10 2v15 M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Backpack", path: "M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z M8 10h8 M8 18h8 M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6 M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Camera", path: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z M 9,13 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Binoculars", path: "M10 10h4 M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3 M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z M 22 16 L 2 16 M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ferris Wheel", path: "M 10,12 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 M12 2v4 m6.8 15-3.5 2 m20.7 7-3.5 2 M6.8 9 3.3 7 m20.7 17-3.5-2 m9 22 3-8 3 8 M8 22h8 M18 18.7a9 9 0 1 0-12 0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Landmark", path: "M10 18v-7 M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z M14 18v-7 M18 18v-7 M3 22h18 M6 18v-7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Castle", path: "M10 5V3 M14 5V3 M15 21v-3a3 3 0 0 0-6 0v3 M18 3v8 M18 5H6 M22 11H2 M22 9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9 M6 3v8", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Church", path: "M10 9h4 M12 7v5 M14 21v-3a2 2 0 0 0-4 0v3 m18 9 3.52 2.147a1 1 0 0 1 .48.854V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6.999a1 1 0 0 1 .48-.854L6 9 M6 21V7a1 1 0 0 1 .376-.782l5-3.999a1 1 0 0 1 1.249.001l5 4A1 1 0 0 1 18 7v14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Holidays & Seasonal",
    icons: [
      { name: "Gift", path: "M12 7v14 M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8 M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5 M 4,7 h 16 a 1,1 0 0 1 1,1 v 2 a 1,1 0 0 1 -1,1 h -16 a 1,1 0 0 1 -1,-1 v -2 a 1,1 0 0 1 1,-1 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Party Popper", path: "M5.8 11.3 2 22l10.7-3.79 M4 3h.01 M22 8h.01 M15 2h.01 M22 20h.01 m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10 m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17 m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7 M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cake Slice", path: "M16 13H3 M16 17H3 m7.2 7.9-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6 M 7,7 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Sparkles", path: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z M20 2v4 M22 4h-4 M 2,20 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Star", path: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Heart", path: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Candy Cane", path: "m10.8 5 2.111 4.223 M17.75 7 15 2.1 m4.874 14.647 2.12 4.24 M5.7 21a2 2 0 0 1-3.5-2l8.6-14a6 6 0 0 1 10.4 6 2 2 0 1 1-3.464-2 2 2 0 1 0-3.464-2z m7.906 9.712 2.005 4.411", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Trees", path: "M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z M7 16v6 M13 19v3 M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ghost", path: "M9 10h.01 M15 10h.01 M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Bell", path: "M10.268 21a2 2 0 0 0 3.464 0 M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Egg", path: "M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Clover", path: "M16.17 7.83 2 22 M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 1 1 12 19.98a2.827 2.827 0 1 1-4.17-3.81A1 1 0 1 1 4 12 m7.83 7.83 8.34 8.34", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Gem", path: "M10.5 3 8 9l4 13 4-13-2.5-6 M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z M2 9h20", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Crown", path: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z M5 21h14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ribbon", path: "M12 11.22C11 9.997 10 9 10 8a2 2 0 0 1 4 0c0 1-.998 2.002-2.01 3.22 m12 18 2.57-3.5 M6.243 9.016a7 7 0 0 1 11.507-.009 M9.35 14.53 12 11.22 M9.35 14.53C7.728 12.246 6 10.221 6 7a6 5 0 0 1 12 0c-.005 3.22-1.778 5.235-3.43 7.5l3.557 4.527a1 1 0 0 1-.203 1.43l-1.894 1.36a1 1 0 0 1-1.384-.215L12 18l-2.679 3.593a1 1 0 0 1-1.39.213l-1.865-1.353a1 1 0 0 1-.203-1.422z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Business & Finance",
    icons: [
      { name: "Briefcase", path: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16 M 4,6 h 16 a 2,2 0 0 1 2,2 v 10 a 2,2 0 0 1 -2,2 h -16 a 2,2 0 0 1 -2,-2 v -10 a 2,2 0 0 1 2,-2 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Building", path: "M12 10h.01 M12 14h.01 M12 6h.01 M16 10h.01 M16 14h.01 M16 6h.01 M8 10h.01 M8 14h.01 M8 6h.01 M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3 M 6,2 h 12 a 2,2 0 0 1 2,2 v 16 a 2,2 0 0 1 -2,2 h -12 a 2,2 0 0 1 -2,-2 v -16 a 2,2 0 0 1 2,-2 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Building 2", path: "M10 12h4 M10 8h4 M14 21v-3a2 2 0 0 0-4 0v3 M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2 M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Handshake", path: "m11 17 2 2a1 1 0 1 0 3-3 m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4 m21 3 1 11h-2 M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3 M3 4h8", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Trending Up", path: "M16 7h6v6 m22 7-8.5 8.5-5-5L2 17", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Trending Down", path: "M16 17h6v-6 m22 17-8.5-8.5-5 5L2 7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Chart Line", path: "M3 3v16a2 2 0 0 0 2 2h16 m19 9-5 5-4-4-3 3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Chart Bar", path: "M3 3v16a2 2 0 0 0 2 2h16 M7 16h8 M7 11h12 M7 6h3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Chart Pie", path: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z M21.21 15.89A10 10 0 1 1 8 2.83", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Target", path: "M 2,12 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 M 6,12 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 M 10,12 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Wallet", path: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1 M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Credit Card", path: "M 4,5 h 16 a 2,2 0 0 1 2,2 v 10 a 2,2 0 0 1 -2,2 h -16 a 2,2 0 0 1 -2,-2 v -10 a 2,2 0 0 1 2,-2 z M 2,10 L 22,10", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Banknote", path: "M 4,6 h 16 a 2,2 0 0 1 2,2 v 8 a 2,2 0 0 1 -2,2 h -16 a 2,2 0 0 1 -2,-2 v -8 a 2,2 0 0 1 2,-2 z M 10,12 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 M6 12h.01M18 12h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Coins", path: "M13.744 17.736a6 6 0 1 1-7.48-7.48 M15 6h1v4 m6.134 14.768.866-.5 2 3.464 M 10,8 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Receipt", path: "M12 17V7 M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8 M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Calculator", path: "M 6,2 h 12 a 2,2 0 0 1 2,2 v 16 a 2,2 0 0 1 -2,2 h -12 a 2,2 0 0 1 -2,-2 v -16 a 2,2 0 0 1 2,-2 z M 8,6 L 16,6 M 16,14 L 16,18 M16 10h.01 M12 10h.01 M8 10h.01 M12 14h.01 M8 14h.01 M12 18h.01 M8 18h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Presentation", path: "M2 3h20 M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3 m7 21 5-5 5 5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Badge Check", path: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z m9 12 2 2 4-4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Award", path: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526 M 6,8 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Trophy", path: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978 M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978 M18 9h1.5a1 1 0 0 0 0-5H18 M4 22h16 M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z M6 9H4.5a1 1 0 0 1 0-5H6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Medal", path: "M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15 M11 12 5.12 2.2 m13 12 5.88-9.8 M8 7h8 M 7,17 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 M12 18v-2h-.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Health & Fitness",
    icons: [
      { name: "Heart Pulse", path: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5 M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Activity", path: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Dumbbell", path: "M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z m2.5 21.5 1.4-1.4 m20.1 3.9 1.4-1.4 M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z m9.6 14.4 4.8-4.8", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Stethoscope", path: "M11 2v2 M5 2v2 M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1 M8 15a6 6 0 0 0 12 0v-3 M 18,10 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Pill", path: "m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z m8.5 8.5 7 7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Syringe", path: "m18 2 4 4 m17 7 3-3 M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5 m9 11 4 4 m5 19-3 3 m14 4 6 6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Bandage", path: "M10 10.01h.01 M10 14.01h.01 M14 10.01h.01 M14 14.01h.01 M18 6v12 M6 6v12 M 4,6 h 16 a 2,2 0 0 1 2,2 v 8 a 2,2 0 0 1 -2,2 h -16 a 2,2 0 0 1 -2,-2 v -8 a 2,2 0 0 1 2,-2 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Brain", path: "M12 18V5 M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4 M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5 M17.997 5.125a4 4 0 0 1 2.526 5.77 M18 18a4 4 0 0 0 2-7.464 M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517 M6 18a4 4 0 0 1-2-7.464 M6.003 5.125a4 4 0 0 0-2.526 5.77", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Eye", path: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0 M 9,12 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Footprints", path: "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z M16 17h4 M4 13h4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Bike", path: "M 15,17.5 a 3.5,3.5 0 1,0 7,0 a 3.5,3.5 0 1,0 -7,0 M 2,17.5 a 3.5,3.5 0 1,0 7,0 a 3.5,3.5 0 1,0 -7,0 M 14,5 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0 M12 17.5V14l-3-3 4-3 2 3h2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Timer", path: "M 10,2 L 14,2 M 12,14 L 15,11 M 4,14 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Flame", path: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Salad", path: "M7 21h10 M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1 m13 12 4-4 M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Home & Family",
    icons: [
      { name: "House", path: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8 M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Sofa", path: "M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3 M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z M4 18v2 M20 18v2 M12 4v9", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Bed", path: "M2 4v16 M2 8h18a2 2 0 0 1 2 2v10 M2 17h20 M6 8v9", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Bath", path: "M10 4 8 6 M17 19v2 M2 12h20 M7 19v2 M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Lamp", path: "M12 12v6 M4.077 10.615A1 1 0 0 0 5 12h14a1 1 0 0 0 .923-1.385l-3.077-7.384A2 2 0 0 0 15 2H9a2 2 0 0 0-1.846 1.23Z M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Key", path: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4 m21 2-9.6 9.6 M 2,15.5 a 5.5,5.5 0 1,0 11,0 a 5.5,5.5 0 1,0 -11,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Door Open", path: "M11 20H2 M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z M11 4H8a2 2 0 0 0-2 2v14 M14 12h.01 M22 20h-3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Baby", path: "M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5 M15 12h.01 M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1 M9 12h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Users", path: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3.128a4 4 0 0 1 0 7.744 M22 21v-2a4 4 0 0 0-3-3.87 M 5,7 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "User", path: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M 8,7 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "User Round", path: "M 7,8 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 M20 21a8 8 0 0 0-16 0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Smile", path: "M 2,12 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 M8 14s1.5 2 4 2 4-2 4-2 M 9,9 L 9.01,9 M 15,9 L 15.01,9", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Cake", path: "M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8 M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1 M2 21h20 M7 8v3 M12 8v3 M17 8v3 M7 4h.01 M12 4h.01 M17 4h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Gift", path: "M12 7v14 M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8 M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5 M 4,7 h 16 a 1,1 0 0 1 1,1 v 2 a 1,1 0 0 1 -1,1 h -16 a 1,1 0 0 1 -1,-1 v -2 a 1,1 0 0 1 1,-1 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Flower 2", path: "M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1 M 10,8 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 M12 10v12 M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Tree Pine", path: "m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z M12 22v-3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Arrows & Dividers",
    icons: [
      { name: "Arrow Right", path: "M5 12h14 m12 5 7 7-7 7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Arrow Left", path: "m12 19-7-7 7-7 M19 12H5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Arrow Up", path: "m5 12 7-7 7 7 M12 19V5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Arrow Down", path: "M12 5v14 m19 12-7 7-7-7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Arrow Up Right", path: "M7 7h10v10 M7 17 17 7", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Chevron Right", path: "m9 18 6-6-6-6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Chevrons Right", path: "m6 17 5-5-5-5 m13 17 5-5-5-5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Minus", path: "M5 12h14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Plus", path: "M5 12h14 M12 5v14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "X", path: "M18 6 6 18 m6 6 12 12", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Check", path: "M20 6 9 17l-5-5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Asterisk", path: "M12 6v12 M17.196 9 6.804 15 m6.804 9 10.392 6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Hash", path: "M 4,9 L 20,9 M 4,15 L 20,15 M 10,3 L 8,21 M 16,3 L 14,21", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "At Sign", path: "M 8,12 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0 M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Circle", path: "M 2,12 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Square", path: "M 5,3 h 14 a 2,2 0 0 1 2,2 v 14 a 2,2 0 0 1 -2,2 h -14 a 2,2 0 0 1 -2,-2 v -14 a 2,2 0 0 1 2,-2 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Triangle", path: "M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Diamond", path: "M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Awards & Achievement",
    icons: [
      { name: "Award", path: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526 M 6,8 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Trophy", path: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978 M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978 M18 9h1.5a1 1 0 0 0 0-5H18 M4 22h16 M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z M6 9H4.5a1 1 0 0 1 0-5H6", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Medal", path: "M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15 M11 12 5.12 2.2 m13 12 5.88-9.8 M8 7h8 M 7,17 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0 M12 18v-2h-.5", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Crown", path: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z M5 21h14", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Star", path: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Badge", path: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Badge Check", path: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z m9 12 2 2 4-4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Ribbon", path: "M12 11.22C11 9.997 10 9 10 8a2 2 0 0 1 4 0c0 1-.998 2.002-2.01 3.22 m12 18 2.57-3.5 M6.243 9.016a7 7 0 0 1 11.507-.009 M9.35 14.53 12 11.22 M9.35 14.53C7.728 12.246 6 10.221 6 7a6 5 0 0 1 12 0c-.005 3.22-1.778 5.235-3.43 7.5l3.557 4.527a1 1 0 0 1-.203 1.43l-1.894 1.36a1 1 0 0 1-1.384-.215L12 18l-2.679 3.593a1 1 0 0 1-1.39.213l-1.865-1.353a1 1 0 0 1-.203-1.422z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Flag", path: "M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Target", path: "M 2,12 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 M 6,12 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 M 10,12 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Rocket", path: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5 M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09 M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Zap", path: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Lightbulb", path: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Flame", path: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Technology & Gaming",
    icons: [
      { name: "Laptop", path: "M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z M20.054 15.987H3.946", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Smartphone", path: "M 7,2 h 10 a 2,2 0 0 1 2,2 v 16 a 2,2 0 0 1 -2,2 h -10 a 2,2 0 0 1 -2,-2 v -16 a 2,2 0 0 1 2,-2 z M12 18h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Gamepad 2", path: "M 6,11 L 10,11 M 8,9 L 8,13 M 15,12 L 15.01,12 M 18,10 L 18.01,10 M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Joystick", path: "M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2Z M6 15v-2 M12 15V9 M 9,6 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Headphones", path: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Monitor", path: "M 4,3 h 16 a 2,2 0 0 1 2,2 v 10 a 2,2 0 0 1 -2,2 h -16 a 2,2 0 0 1 -2,-2 v -10 a 2,2 0 0 1 2,-2 z M 8,21 L 16,21 M 12,17 L 12,21", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Mouse", path: "M 12,2 h 0 a 7,7 0 0 1 7,7 v 6 a 7,7 0 0 1 -7,7 h -0 a 7,7 0 0 1 -7,-7 v -6 a 7,7 0 0 1 7,-7 z M12 6v4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Keyboard", path: "M10 8h.01 M12 12h.01 M14 8h.01 M16 12h.01 M18 8h.01 M6 8h.01 M7 16h10 M8 12h.01 M 4,4 h 16 a 2,2 0 0 1 2,2 v 12 a 2,2 0 0 1 -2,2 h -16 a 2,2 0 0 1 -2,-2 v -12 a 2,2 0 0 1 2,-2 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Wifi", path: "M12 20h.01 M2 8.82a15 15 0 0 1 20 0 M5 12.859a10 10 0 0 1 14 0 M8.5 16.429a5 5 0 0 1 7 0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Battery", path: "M 22 14 L 22 10 M 4,6 h 12 a 2,2 0 0 1 2,2 v 8 a 2,2 0 0 1 -2,2 h -12 a 2,2 0 0 1 -2,-2 v -8 a 2,2 0 0 1 2,-2 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Camera", path: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z M 9,13 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Video", path: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5 M 4,6 h 10 a 2,2 0 0 1 2,2 v 8 a 2,2 0 0 1 -2,2 h -10 a 2,2 0 0 1 -2,-2 v -8 a 2,2 0 0 1 2,-2 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Mic", path: "M12 19v3 M19 10v2a7 7 0 0 1-14 0v-2 M 12,2 h 0 a 3,3 0 0 1 3,3 v 7 a 3,3 0 0 1 -3,3 h -0 a 3,3 0 0 1 -3,-3 v -7 a 3,3 0 0 1 3,-3 z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Speaker", path: "M 6,2 h 12 a 2,2 0 0 1 2,2 v 16 a 2,2 0 0 1 -2,2 h -12 a 2,2 0 0 1 -2,-2 v -16 a 2,2 0 0 1 2,-2 z M12 6h.01 M 8,14 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0 M12 14h.01", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Puzzle", path: "M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
  {
    category: "Music & Arts",
    icons: [
      { name: "Music", path: "M9 18V5l12-2v13 M 3,18 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 15,16 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Music 2", path: "M 4,18 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0 M12 18V2l7 4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Music 3", path: "M 8,18 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0 M16 18V2", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Music 4", path: "M9 18V5l12-2v13 m9 9 12-2 M 3,18 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0 M 15,16 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Guitar", path: "m11.9 12.1 4.514-4.514 M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z m6 16 2 2 M8.23 9.85A3 3 0 0 1 11 8a5 5 0 0 1 5 5 3 3 0 0 1-1.85 2.77l-.92.38A2 2 0 0 0 12 18a4 4 0 0 1-4 4 6 6 0 0 1-6-6 4 4 0 0 1 4-4 2 2 0 0 0 1.85-1.23z", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Piano", path: "M18.5 8c-1.4 0-2.6-.8-3.2-2A6.87 6.87 0 0 0 2 9v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8.5C22 9.6 20.4 8 18.5 8 M2 14h20 M6 14v4 M10 14v4 M14 14v4 M18 14v4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Mic Vocal", path: "m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12 M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5 M 11,7 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Headphones", path: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Palette", path: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z M 13,6.5 a 0.5,0.5 0 1,0 1,0 a 0.5,0.5 0 1,0 -1,0 M 17,10.5 a 0.5,0.5 0 1,0 1,0 a 0.5,0.5 0 1,0 -1,0 M 6,12.5 a 0.5,0.5 0 1,0 1,0 a 0.5,0.5 0 1,0 -1,0 M 8,7.5 a 0.5,0.5 0 1,0 1,0 a 0.5,0.5 0 1,0 -1,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Paintbrush", path: "m14.622 17.897-10.68-2.913 M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Brush", path: "m11 10 3 3 M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Pen Tool", path: "M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18 m2.3 2.3 7.286 7.286 M 9,11 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Pencil", path: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z m15 5 4 4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 },
      { name: "Drama", path: "M10 11h.01 M14 6h.01 M18 6h.01 M6.5 13.1h.01 M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3 M17.4 9.9c-.8.8-2 .8-2.8 0 M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7 M9.1 16.5c.3-1.1 1.4-1.7 2.4-1.4", fill: "transparent", stroke: "#000000", strokeWidth: 2, viewBox: 24 }
    ]
  },
];

const BACKGROUNDS = [
  { name: "Midnight Space", back: "#05070F", front: "#0F172A", type: 'gradient', backStart: '#020617', backEnd: '#0f172a', frontStart: '#0f172a', frontEnd: '#1e1b4b' },
  { name: "Watercolor Sunset", back: "#FEF08A", front: "#FECDD3", type: 'gradient', backStart: '#fef08a', backEnd: '#fde047', frontStart: '#fde047', frontEnd: '#fecdd3' },
  { name: "Botanical Forest", back: "#064E3B", front: "#022C22", type: 'gradient', backStart: '#064e3b', backEnd: '#022c22', frontStart: '#022c22', frontEnd: '#022c22' },
  { name: "Vintage Cream", back: "#FEF3C7", front: "#FDE68A", type: 'solid', backStart: '#FEF3C7', backEnd: '#FEF3C7', frontStart: '#FDE68A', frontEnd: '#FDE68A' },
  { name: "Cyberpunk Glow", back: "#030712", front: "#3B0764", type: 'gradient', backStart: '#030712', backEnd: '#111827', frontStart: '#111827', frontEnd: '#3b0764' }
];

// 1-click "Designer Themes" palettes for the Background Presets panel. Each
// applies a front/back gradient plus recolors existing text/shape strokes for
// instant harmony (see applyDesignerPalette). This type + array were
// referenced by that function and the JSX below since the feature was first
// added, but never actually defined — with typescript.ignoreBuildErrors
// masking the resulting compile error, that shipped straight to production
// as a guaranteed crash on every click.
interface DesignerPalette {
  id: string;
  name: string;
  category: string;
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  accentColor: string;
  textColor: string;
}

const DESIGNER_PALETTES: DesignerPalette[] = [
  { id: "midnight-gold", name: "Midnight Gold", category: "Elegant", bgColor: "#16213e", gradientStart: "#16213e", gradientEnd: "#0f3460", accentColor: "#e5a91d", textColor: "#f5f5f5" },
  { id: "emerald-noir", name: "Emerald Noir", category: "Elegant", bgColor: "#0d1f1a", gradientStart: "#0d1f1a", gradientEnd: "#1b4332", accentColor: "#52b788", textColor: "#f0fdf4" },
  { id: "royal-amethyst", name: "Royal Amethyst", category: "Bold", bgColor: "#3c096c", gradientStart: "#5a189a", gradientEnd: "#240046", accentColor: "#ffd60a", textColor: "#ffffff" },
  { id: "sunset-blaze", name: "Sunset Blaze", category: "Bold", bgColor: "#f7931e", gradientStart: "#f7931e", gradientEnd: "#c1440e", accentColor: "#2b2d42", textColor: "#ffffff" },
  { id: "ocean-breeze", name: "Ocean Breeze", category: "Fresh", bgColor: "#90e0ef", gradientStart: "#90e0ef", gradientEnd: "#00b4d8", accentColor: "#023e8a", textColor: "#03045e" },
  { id: "blush-romance", name: "Blush Romance", category: "Pastel", bgColor: "#ffccd5", gradientStart: "#ffccd5", gradientEnd: "#ffe5ec", accentColor: "#c9184a", textColor: "#590d22" },
  { id: "crimson-noir", name: "Crimson Noir", category: "Dark", bgColor: "#240000", gradientStart: "#240000", gradientEnd: "#660000", accentColor: "#ff3333", textColor: "#ffffff" },
  { id: "sage-minimalist", name: "Sage Minimalist", category: "Minimal", bgColor: "#d8e2dc", gradientStart: "#d8e2dc", gradientEnd: "#ece4db", accentColor: "#6b705c", textColor: "#3d3d3d" },
  { id: "cosmic-nebula", name: "Cosmic Nebula", category: "Vibrant", bgColor: "#2a0845", gradientStart: "#2a0845", gradientEnd: "#6441a5", accentColor: "#ff007f", textColor: "#ffffff" },
  { id: "golden-hour", name: "Golden Hour", category: "Warm", bgColor: "#ffb703", gradientStart: "#ffb703", gradientEnd: "#fb8500", accentColor: "#023e8a", textColor: "#ffffff" },
  { id: "nordic-frost", name: "Nordic Frost", category: "Clean", bgColor: "#0284c7", gradientStart: "#0284c7", gradientEnd: "#0369a1", accentColor: "#f0f9ff", textColor: "#ffffff" },
  { id: "vintage-leather", name: "Vintage Leather", category: "Classic", bgColor: "#3d2314", gradientStart: "#4a2c17", gradientEnd: "#231209", accentColor: "#d4af37", textColor: "#fef3c7" },
  { id: "cyberpunk-neon", name: "Cyberpunk Neon", category: "Vibrant", bgColor: "#0f051d", gradientStart: "#0f051d", gradientEnd: "#290a59", accentColor: "#00f5d4", textColor: "#ffffff" },
  { id: "terracotta-earth", name: "Terracotta Earth", category: "Warm", bgColor: "#b45309", gradientStart: "#b45309", gradientEnd: "#78350f", accentColor: "#fef3c7", textColor: "#ffffff" },
  { id: "rosewood-velvet", name: "Rosewood Velvet", category: "Elegant", bgColor: "#4c0519", gradientStart: "#4c0519", gradientEnd: "#881337", accentColor: "#fbcfe8", textColor: "#ffffff" },
];

const TRIM_SIZES = [
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

// A background photo scaled to the bare minimum that covers its frame has
// zero pan room in whichever axis its aspect ratio already matches the
// frame's -- scaling a bit past that minimum guarantees real drag room in
// both directions regardless of the photo's own aspect ratio.
const BACKGROUND_PAN_OVERSCAN = 1.3;

// Canva-style smart alignment: how close (in canvas px) an edge/center has to
// get to a candidate line before it snaps and shows the pink guide.
const SNAP_THRESHOLD = 6;

export interface CoverBackgroundState {
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
  backCoverTextureId: string;
  frontCoverTextureId: string;
  fullCoverTextureId: string;
  // Pan offset (in canvas px, from center) for repositioning a "cover-fit"
  // background photo within its frame without ever leaving a gap at the edges.
  backCoverImageOffsetX: number;
  backCoverImageOffsetY: number;
  frontCoverImageOffsetX: number;
  frontCoverImageOffsetY: number;
  fullCoverImageOffsetX: number;
  fullCoverImageOffsetY: number;
}

interface FabricCoverStudioProps {
  trimSize: { label: string; w: number; h: number };
  setTrimSize: (size: any) => void;
  pageCount: number;
  setPageCount: (cnt: number) => void;

  coverBackground: CoverBackgroundState;
  setCoverBackground: React.Dispatch<React.SetStateAction<CoverBackgroundState>>;

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
      base.fontWeight = obj.fontWeight;
      // Spine text is positioned from its center, so x/y above mean something
      // different than for the default top-left origin — persist the origin or
      // the text jumps on reload.
      base.originX = obj.originX;
      base.originY = obj.originY;
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
  // A newly-picked photo resets its pan offset to 0 (centered) -- an offset
  // tuned for the previous photo's aspect ratio wouldn't mean anything for a
  // different image.
  const setBackCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverImage: val, backCoverImageOffsetX: 0, backCoverImageOffsetY: 0 };
    setCoverBackground(prev => ({ ...prev, backCoverImage: val, backCoverImageOffsetX: 0, backCoverImageOffsetY: 0 }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverImage: val, frontCoverImageOffsetX: 0, frontCoverImageOffsetY: 0 };
    setCoverBackground(prev => ({ ...prev, frontCoverImage: val, frontCoverImageOffsetX: 0, frontCoverImageOffsetY: 0 }));
    if (canvas) canvas.renderAll();
  };
  const setFullCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, fullCoverImage: val, fullCoverImageOffsetX: 0, fullCoverImageOffsetY: 0 };
    setCoverBackground(prev => ({ ...prev, fullCoverImage: val, fullCoverImageOffsetX: 0, fullCoverImageOffsetY: 0 }));
    if (canvas) canvas.renderAll();
  };

  // Drag-to-pan state for background photos (front/back/full cover), which
  // paint directly onto the canvas outside Fabric's object model (see
  // paintCoverBackground) and so need their own mouse handling rather than
  // Fabric's normal object drag.
  const bgDragRef = useRef<{
    region: 'front' | 'back' | 'full';
    startPointerX: number; startPointerY: number;
    startOffsetX: number; startOffsetY: number;
  } | null>(null);

  // Populated during object:moving (canvas-init effect) with the canvas-space
  // positions of any alignment lines the dragged object just snapped to,
  // cleared on mouse:up; drawn in the before:render/after:render effect's
  // after:render handler alongside the KDP guides.
  const alignGuidesRef = useRef<{ vertical: number[]; horizontal: number[] }>({ vertical: [], horizontal: [] });

  const getBackgroundRegionRect = (region: 'front' | 'back' | 'full') => {
    if (region === 'full') return { destX: 0, destY: 0, destW: layout.canvasWidth, destH: layout.canvasHeight };
    if (region === 'back') return { destX: 0, destY: 0, destW: layout.spineLeftPx, destH: layout.canvasHeight };
    return { destX: layout.spineRightPx, destY: 0, destW: layout.canvasWidth - layout.spineRightPx, destH: layout.canvasHeight };
  };

  const clampBackgroundOffset = (region: 'front' | 'back' | 'full', img: HTMLImageElement, offsetX: number, offsetY: number) => {
    const { destW, destH } = getBackgroundRegionRect(region);
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    if (!imgW || !imgH) return { x: 0, y: 0 };
    // Scaling to the bare minimum that covers the frame leaves zero pan room
    // in whichever axis the image's aspect ratio already matches the frame's
    // -- BACKGROUND_PAN_OVERSCAN scales a bit past that minimum so there's
    // always real drag room in both directions, not just one.
    const coverScale = Math.max(destW / imgW, destH / imgH) * BACKGROUND_PAN_OVERSCAN;
    const maxOffsetX = Math.max(0, (imgW * coverScale - destW) / 2);
    const maxOffsetY = Math.max(0, (imgH * coverScale - destH) / 2);
    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY)),
    };
  };

  const setBackgroundImageOffset = (region: 'front' | 'back' | 'full', offsetX: number, offsetY: number) => {
    const key = region === 'front' ? 'frontCoverImageOffsetX' : region === 'back' ? 'backCoverImageOffsetX' : 'fullCoverImageOffsetX';
    const keyY = region === 'front' ? 'frontCoverImageOffsetY' : region === 'back' ? 'backCoverImageOffsetY' : 'fullCoverImageOffsetY';
    coverBackgroundRef.current = { ...coverBackgroundRef.current, [key]: offsetX, [keyY]: offsetY };
    setCoverBackground(prev => ({ ...prev, [key]: offsetX, [keyY]: offsetY }));
  };

  const getBackgroundImageEl = (region: 'front' | 'back' | 'full') =>
    region === 'front' ? frontCoverImageEl.current : region === 'back' ? backCoverImageEl.current : fullCoverImageEl.current;

  // Shared by the drag-to-pan mouse handlers and the right-click context menu
  // (to offer "Remove Background Photo" when right-clicking directly on one).
  const regionForPointer = (x: number, y: number): 'front' | 'back' | 'full' | null => {
    const bg = coverBackgroundRef.current;
    if (bg.fullCoverImage && fullCoverImageEl.current) return 'full';
    if (x < layout.spineLeftPx && bg.backCoverImage && backCoverImageEl.current) return 'back';
    if (x > layout.spineRightPx && bg.frontCoverImage && frontCoverImageEl.current) return 'front';
    return null;
  };

  // Ref to hold saveState function to call it when coverBackground updates
  const saveStateRef = useRef<() => void>(() => {});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scaleRatio, setScaleRatio] = useState(1);
  // Multiplies on top of scaleRatio (the auto fit-to-container ratio) so
  // users can zoom in for precision work (e.g. spine text) without changing
  // the underlying full-resolution canvas dimensions.
  const [userZoom, setUserZoom] = useState(1);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  // Fabric.js renders text with whatever font is available at the moment it
  // draws — it doesn't know when a webfont finishes downloading. With 50+
  // fonts now loading async, without this any text already placed with a
  // not-yet-loaded font would silently stay on the fallback font.
  useEffect(() => {
    if (!canvas || typeof document === 'undefined' || !document.fonts?.ready) return;
    // Resolves asynchronously, by which point a trim-size change may have
    // replaced (and disposed) this canvas.
    document.fonts.ready.then(() => {
      if (isCanvasAlive(canvas)) canvas.requestRenderAll();
    });
  }, [canvas]);

  // fabric.Canvas.dispose() tears down the 2D contexts but the instance stays
  // referenced by React state until the replacement commits, so anything that
  // might run in that window has to check the canvas is still usable.
  const isCanvasAlive = (c: fabric.Canvas | null): c is fabric.Canvas =>
    !!c && !!c.getContext();

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [clipboard, setClipboard] = useState<any>(null);
  const [copiedStyle, setCopiedStyle] = useState<Record<string, any> | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit>({ colors: [], fonts: [] });
  useEffect(() => { setBrandKit(loadBrandKit()); }, []);
  const [isObjectLocked, setIsObjectLocked] = useState(false);
  // Right-click context menu: x/y are viewport (fixed-position) screen
  // coordinates for placing the floating menu, independent of the canvas's
  // own CSS zoom scale. hasTarget tracks whether the right-click landed on
  // an object (object actions) or empty canvas (paste only).
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; hasTarget: boolean; bgRegion: 'front' | 'back' | 'full' | null } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const imageAdjustmentsRef = useRef<HTMLDivElement>(null);
  const [activeToolTab, setActiveToolTab] = useState<'elements' | 'shapes' | 'graphics' | 'presets' | 'uploads' | 'draw' | 'settings' | null>('elements');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [drawingWidth, setDrawingWidth] = useState(4);
  const [brushType, setBrushType] = useState<'pen' | 'marker' | 'highlighter'>('pen');

  // Canva-style pen/marker/highlighter picker -- all three are the same
  // fabric.PencilBrush, just with different width/opacity/line-cap defaults.
  // Highlighter's translucency comes from baking alpha into the brush's own
  // rgba color (Fabric brushes have no separate opacity property).
  const BRUSH_PRESETS: Record<typeof brushType, { width: number; alpha: number; cap: CanvasLineCap }> = {
    pen: { width: 4, alpha: 1, cap: 'round' },
    marker: { width: 14, alpha: 1, cap: 'round' },
    highlighter: { width: 22, alpha: 0.35, cap: 'butt' },
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const applyBrushSettings = (type: typeof brushType, color: string, width: number) => {
    if (!canvas || !canvas.freeDrawingBrush) return;
    const preset = BRUSH_PRESETS[type];
    canvas.freeDrawingBrush.color = hexToRgba(color, preset.alpha);
    canvas.freeDrawingBrush.width = width;
    (canvas.freeDrawingBrush as any).strokeLineCap = preset.cap;
  };

  const toggleDrawingMode = (forceState?: boolean) => {
    if (!canvas) return;
    const nextMode = forceState !== undefined ? forceState : !isDrawingMode;
    setIsDrawingMode(nextMode);
    canvas.isDrawingMode = nextMode;
    if (nextMode) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      applyBrushSettings(brushType, drawingColor, drawingWidth);
    }
  };

  const handleBrushTypeChange = (type: typeof brushType) => {
    setBrushType(type);
    const presetWidth = BRUSH_PRESETS[type].width;
    setDrawingWidth(presetWidth);
    applyBrushSettings(type, drawingColor, presetWidth);
  };

  const handleDrawingColorChange = (color: string) => {
    setDrawingColor(color);
    applyBrushSettings(brushType, color, drawingWidth);
  };

  const handleDrawingWidthChange = (width: number) => {
    setDrawingWidth(width);
    applyBrushSettings(brushType, drawingColor, width);
  };
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [graphicsSubTab, setGraphicsSubTab] = useState<'kdp-icons' | 'unsplash'>('kdp-icons');

  // 3D Mockup Preview states
  const [isMockupOpen, setIsMockupOpen] = useState(false);
  const [isMockupLoading, setIsMockupLoading] = useState(false);
  const [mockupFrontUrl, setMockupFrontUrl] = useState<string | null>(null);
  const [mockupSpineUrl, setMockupSpineUrl] = useState<string | null>(null);

  // Marketplace Thumbnail Preview states
  const [isThumbPreviewOpen, setIsThumbPreviewOpen] = useState(false);
  const [isThumbPreviewLoading, setIsThumbPreviewLoading] = useState(false);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null);

  // Series Branding (batch export) state
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);

  // Background Remover (in-panel) state
  const [isBgRemoverOpen, setIsBgRemoverOpen] = useState(false);
  const [bgRemoverImageSrc, setBgRemoverImageSrc] = useState<string | null>(null);

  // Which cover region the texture swatches apply to
  const [textureTarget, setTextureTarget] = useState<'full' | 'front' | 'back'>('full');

  // How many objects are in the current selection — drives the multi-object
  // align/distribute controls, which only make sense for 2+ (3+ to distribute).
  const [selectionCount, setSelectionCount] = useState(0);

  // Named version history (checkpoints, distinct from step-by-step undo/redo)
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);

  // Read-only review links for clients / co-authors
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Smart resize — remap the design when the cover geometry changes. Mirrored
  // into a ref because the canvas-init effect that consumes it deliberately
  // doesn't re-run on this toggle.
  const [autoRelayout, setAutoRelayout] = useState(true);
  const autoRelayoutRef = useRef(autoRelayout);
  useEffect(() => { autoRelayoutRef.current = autoRelayout; }, [autoRelayout]);
  const lastImportLayoutRef = useRef<KdpLayoutResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setActiveToolTab(null);
    }
  }, []);

  const applyDesignerPalette = (palette: DesignerPalette) => {
    if (!canvas) return;
    const newBg = {
      ...coverBackground,
      frontCoverColor: palette.bgColor,
      frontCoverType: 'gradient' as const,
      frontCoverGradientStart: palette.gradientStart,
      frontCoverGradientEnd: palette.gradientEnd,
      backCoverColor: palette.bgColor,
      backCoverType: 'gradient' as const,
      backCoverGradientStart: palette.gradientStart,
      backCoverGradientEnd: palette.gradientEnd,
    };
    coverBackgroundRef.current = newBg;
    setCoverBackground(newBg);

    // Auto-recolor text & shape elements for instant color harmony
    canvas.getObjects().forEach((obj) => {
      if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
        obj.set({ fill: palette.textColor });
      } else if (obj.type === 'path' || obj.type === 'rect' || obj.type === 'circle') {
        if ((obj as any).stroke && (obj as any).stroke !== 'transparent') {
          obj.set({ stroke: palette.accentColor });
        }
      }
    });

    canvas.requestRenderAll();
  };

  const handleAutoAlignSpineText = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || (active.type !== 'i-text' && active.type !== 'text' && active.type !== 'textbox')) {
      alert("Please select a text layer first to auto-align down the spine!");
      return;
    }

    const spineCenterPx = layout.spineLeftPx + layout.spineWidthPx / 2;
    const spineCenterY = layout.canvasHeight / 2;

    active.set({
      left: spineCenterPx,
      top: spineCenterY,
      angle: 90,
      originX: 'center',
      originY: 'center'
    });

    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: active });
  };

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
  const [curvedPathShape, setCurvedPathShape] = useState<PathShape>('arc');
  const [curvedPathWidth, setCurvedPathWidth] = useState(300);
  const [curvedPathAmplitude, setCurvedPathAmplitude] = useState(40);
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
  const [objectPosX, setObjectPosX] = useState(0);
  const [objectPosY, setObjectPosY] = useState(0);
  const [objectAngle, setObjectAngle] = useState(0);
  const [objectFlipX, setObjectFlipX] = useState(false);
  const [objectFlipY, setObjectFlipY] = useState(false);

  // Spine Text Alignment States
  const [spineTextVAlign, setSpineTextVAlign] = useState<'top' | 'center' | 'bottom'>('center');
  const [spineTextRotation, setSpineTextRotation] = useState<90 | 270>(90);
  // True when the last spine fit had to scale the text down to stay inside the
  // spine folds / trim margins — surfaced in the panel so it isn't a silent change.
  const [spineTextWasShrunk, setSpineTextWasShrunk] = useState(false);

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
      // Designs saved before path shapes existed have no pathShape — those are circular.
      setCurvedPathShape(data.pathShape || 'arc');
      setCurvedPathWidth(data.pathWidth ?? 300);
      setCurvedPathAmplitude(data.pathAmplitude ?? 40);
    }
  }, [activeObject]);

  const updateActiveObjectProperty = (property: string, value: any, saveHistory = true) => {
    if (!canvas || !activeObject) return;
    activeObject.set({ [property]: value });

    // Spine text has to stay inside the spine folds and trim margins, so any
    // edit that changes its rendered size re-runs the fit instead of letting a
    // longer title silently overflow the cover.
    const isSpineText = (activeObject as any).id?.startsWith('spine');
    if (isSpineText && ['text', 'fontSize', 'fontFamily', 'fontWeight', 'charSpacing'].includes(property)) {
      refitSpineTextRef.current?.();
      return;
    }

    canvas.requestRenderAll();
    if (saveHistory) {
      canvas.fire("object:modified", { target: activeObject });
    }
  };

  // Native browser eyedropper (Chrome/Edge only -- no polyfill exists for
  // Firefox/Safari, so callers must check eyedropperSupported before showing
  // the button at all) -- lets a color be sampled from anywhere on screen,
  // including a photo on the canvas, not just from a preset palette.
  const eyedropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;
  const pickColorFromScreen = async (property: 'fill' | 'stroke', setter: (v: string) => void) => {
    if (!eyedropperSupported) return;
    try {
      const result = await new (window as any).EyeDropper().open();
      setter(result.sRGBHex);
      updateActiveObjectProperty(property, result.sRGBHex, true);
    } catch {
      // User pressed Escape / cancelled the pick -- nothing to do.
    }
  };

  // alignTextToSpine is declared further down; this ref lets the earlier
  // property-update path call it without reordering the whole component.
  const refitSpineTextRef = useRef<(() => void) | null>(null);

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

  // Canva-style one-click text effects: curated shadow/stroke/fill combos on
  // top of the existing manual shadow controls, rather than a distinct effect
  // system -- so a preset can always be fine-tuned afterward with the same
  // sliders. Restricted to properties fabric.Text/IText already supports
  // natively (stroke/shadow), even though the manual "Border Settings" panel
  // hides those controls for text objects.
  const applyTextEffectPreset = (preset: 'none' | 'shadow' | 'lift' | 'hollow' | 'neon' | 'background') => {
    if (!canvas || !activeObject) return;
    const currentFill = (typeof activeObject.fill === 'string' && activeObject.fill !== 'transparent')
      ? activeObject.fill as string
      : '#000000';
    // Every preset starts from a clean slate so switching between them (e.g.
    // Background -> Neon) doesn't leave a stray highlight box or outline behind.
    (activeObject as any).set({ shadow: undefined, stroke: undefined, strokeWidth: 0, textBackgroundColor: '' });
    setObjectHasShadow(false);

    if (preset === 'hollow') {
      activeObject.set({ fill: 'transparent', stroke: currentFill, strokeWidth: 2 });
      setObjectColor('transparent');
      setObjectStrokeColor(currentFill);
      setObjectStrokeWidth(2);
    } else if (preset === 'background') {
      // Highlight box behind the text, per line (fabric.Text's native
      // textBackgroundColor) -- picks a contrasting color off the fill's
      // rough lightness so it stays readable without a manual color control.
      const r = parseInt(currentFill.slice(1, 3), 16) || 0;
      const g = parseInt(currentFill.slice(3, 5), 16) || 0;
      const b = parseInt(currentFill.slice(5, 7), 16) || 0;
      const isLightFill = (r * 299 + g * 587 + b * 114) / 1000 > 150;
      (activeObject as any).set({ textBackgroundColor: isLightFill ? '#000000' : '#FFFFFF' });
    } else if (preset !== 'none') {
      const config = preset === 'shadow'
        ? { color: 'rgba(0,0,0,0.45)', blur: 6, offsetX: 3, offsetY: 3 }
        : preset === 'lift'
        ? { color: 'rgba(0,0,0,0.35)', blur: 22, offsetX: 0, offsetY: 8 }
        : { color: currentFill, blur: 18, offsetX: 0, offsetY: 0 }; // neon
      activeObject.set({ shadow: new fabric.Shadow(config) });
      setObjectHasShadow(true);
      setObjectShadowColor(config.color);
      setObjectShadowBlur(config.blur);
      setObjectShadowOffsetX(config.offsetX);
      setObjectShadowOffsetY(config.offsetY);
    }
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
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

  // Canva-style one-click photo filter presets -- tuned combinations of the
  // same brightness/contrast/saturation/hue/grayscale/sepia filters the
  // manual sliders below control, so a preset is just a starting point the
  // sliders can still fine-tune afterward. Blur/sharpen/pixelate/noise are
  // left untouched since those are compositing effects, not color grading.
  const IMAGE_FILTER_PRESETS = {
    original: { brightness: 0, contrast: 0, saturation: 0, hue: 0, grayscale: false, sepia: false, invert: false },
    bw: { brightness: 0, contrast: 0.05, saturation: 0, hue: 0, grayscale: true, sepia: false, invert: false },
    vintage: { brightness: 0.04, contrast: -0.08, saturation: -0.2, hue: 8, grayscale: false, sepia: true, invert: false },
    warm: { brightness: 0.05, contrast: 0, saturation: 0.15, hue: 12, grayscale: false, sepia: false, invert: false },
    cool: { brightness: 0.02, contrast: 0, saturation: 0.05, hue: -18, grayscale: false, sepia: false, invert: false },
    fade: { brightness: 0.08, contrast: -0.25, saturation: -0.15, hue: 0, grayscale: false, sepia: false, invert: false },
  } as const;

  const applyImageFilterPreset = (name: keyof typeof IMAGE_FILTER_PRESETS) => {
    const preset = IMAGE_FILTER_PRESETS[name];
    setImgBrightness(preset.brightness);
    setImgContrast(preset.contrast);
    setImgSaturation(preset.saturation);
    setImgHue(preset.hue);
    setImgGrayscale(preset.grayscale);
    setImgSepia(preset.sepia);
    setImgInvert(preset.invert);
    applyImageFilters(preset, true);
  };

  const handleOpenBgRemover = () => {
    if (!canvas || !activeObject || activeObject.type !== "image") return;
    const img = activeObject as fabric.Image;
    const src = img.getSrc();
    if (!src) return;
    setBgRemoverImageSrc(src);
    setIsBgRemoverOpen(true);
  };

  const handleApplyBgRemoval = (dataUrl: string) => {
    if (!canvas || !activeObject || activeObject.type !== "image") return;
    const img = activeObject as fabric.Image;
    // Preserve the on-canvas display size — the processed image may have
    // slightly different pixel dimensions than the original due to the
    // background remover's internal downscale cap for very large photos.
    const displayWidth = img.getScaledWidth();
    const displayHeight = img.getScaledHeight();
    img.setSrc(
      dataUrl,
      () => {
        img.set({
          scaleX: displayWidth / (img.width || displayWidth),
          scaleY: displayHeight / (img.height || displayHeight),
        });
        if (img.filters && img.filters.length > 0) img.applyFilters();
        canvas.requestRenderAll();
        canvas.fire("object:modified", { target: img });
      },
      { crossOrigin: "anonymous" }
    );
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

  const handleExactPosX = (val: number) => {
    if (!canvas || !activeObject) return;
    setObjectPosX(val);
    activeObject.set({ left: val });
    activeObject.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const handleExactPosY = (val: number) => {
    if (!canvas || !activeObject) return;
    setObjectPosY(val);
    activeObject.set({ top: val });
    activeObject.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const handleExactAngle = (val: number) => {
    if (!canvas || !activeObject) return;
    const normalized = ((val % 360) + 360) % 360;
    setObjectAngle(normalized);
    activeObject.rotate(normalized);
    activeObject.setCoords();
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
      if ((e.ctrlKey || e.metaKey) && e.altKey && key === 'c') {
        e.preventDefault();
        handlersRef.current.copyStyleFromActive();
      } else if ((e.ctrlKey || e.metaKey) && e.altKey && key === 'v') {
        e.preventDefault();
        handlersRef.current.pasteStyleToActive();
      } else if ((e.ctrlKey || e.metaKey) && key === 'z') {
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

  // Cover Finish is a reminder note only -- KDP's laminate choice (matte vs
  // glossy) is picked separately at upload time and has no effect on spine
  // width or any layout math, unlike paper type.
  const [coverFinish, setCoverFinish] = useState<'matte' | 'glossy'>('matte');

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

    // Helper to sync dimensions/position during scaling/moving/rotating
    const syncActiveObjectDimensions = () => {
      const active = fCanvas.getActiveObject();
      if (active) {
        setObjectWidth(Math.round((active.width || 0) * (active.scaleX || 1)));
        setObjectHeight(Math.round((active.height || 0) * (active.scaleY || 1)));
        setObjectPosX(Math.round(active.left || 0));
        setObjectPosY(Math.round(active.top || 0));
        setObjectAngle(Math.round(active.angle || 0));
      }
    };

    fCanvas.on("object:scaling", syncActiveObjectDimensions);
    fCanvas.on("object:moving", syncActiveObjectDimensions);
    fCanvas.on("object:rotating", syncActiveObjectDimensions);

    // Smart alignment guides: snaps the dragged object's edges/center to the
    // canvas center or another object's edges/center, matching Canva's pink
    // snap-line behavior. Runs against getBoundingRect(true) so it accounts
    // for the object's current rotation/scale, not just its raw left/top.
    const handleObjectMovingSnap = (opt: any) => {
      const obj = opt.target;
      if (!obj) return;
      const rect = obj.getBoundingRect(true);
      const objXs = [rect.left, rect.left + rect.width / 2, rect.left + rect.width];
      const objYs = [rect.top, rect.top + rect.height / 2, rect.top + rect.height];

      // KDP guide lines (trim/bleed, spine edges, and both covers' safety-zone
      // boundaries) are snap candidates too, alongside canvas center and other
      // objects -- these are the lines that actually matter for a book cover,
      // since content bleeding past them is the most common KDP rejection.
      const candidateXs = [
        0, layout.canvasWidth / 2, layout.canvasWidth,
        layout.trimLeftPx, layout.trimRightPx,
        layout.spineLeftPx, layout.spineRightPx, layout.spineCenterPx,
        layout.backLiveLeftPx, layout.backLiveRightPx, layout.backCoverCenterPx,
        layout.frontLiveLeftPx, layout.frontLiveRightPx, layout.frontCoverCenterPx,
      ];
      const candidateYs = [
        0, layout.canvasHeight / 2, layout.canvasHeight,
        layout.trimTopPx, layout.trimBottomPx,
        layout.backLiveTopPx, layout.backLiveBottomPx,
        layout.frontLiveTopPx, layout.frontLiveBottomPx,
      ];
      fCanvas.getObjects().forEach((other) => {
        if (other === obj) return;
        const r = other.getBoundingRect(true);
        candidateXs.push(r.left, r.left + r.width / 2, r.left + r.width);
        candidateYs.push(r.top, r.top + r.height / 2, r.top + r.height);
      });

      let bestDx = 0, bestDxDist = SNAP_THRESHOLD, vLine: number | null = null;
      for (const ox of objXs) for (const cx of candidateXs) {
        const d = Math.abs(ox - cx);
        if (d < bestDxDist) { bestDxDist = d; bestDx = cx - ox; vLine = cx; }
      }
      let bestDy = 0, bestDyDist = SNAP_THRESHOLD, hLine: number | null = null;
      for (const oy of objYs) for (const cy of candidateYs) {
        const d = Math.abs(oy - cy);
        if (d < bestDyDist) { bestDyDist = d; bestDy = cy - oy; hLine = cy; }
      }

      if (bestDx !== 0 || bestDy !== 0) {
        obj.set({ left: (obj.left || 0) + bestDx, top: (obj.top || 0) + bestDy });
        obj.setCoords();
      }
      alignGuidesRef.current = {
        vertical: vLine !== null ? [vLine] : [],
        horizontal: hLine !== null ? [hLine] : [],
      };
      fCanvas.requestRenderAll();
    };
    const clearAlignGuides = () => {
      if (!alignGuidesRef.current.vertical.length && !alignGuidesRef.current.horizontal.length) return;
      alignGuidesRef.current = { vertical: [], horizontal: [] };
      fCanvas.requestRenderAll();
    };
    fCanvas.on("object:moving", handleObjectMovingSnap);
    fCanvas.on("mouse:up", clearAlignGuides);

    // Selection events
    const syncSelection = (e: any) => {
      const obj = e.selected ? e.selected[0] : null;
      setActiveObject(obj);
      setSelectionCount(fCanvas.getActiveObjects().length);
      if (obj) {
        setObjectWidth(Math.round((obj.width || 0) * (obj.scaleX || 1)));
        setObjectHeight(Math.round((obj.height || 0) * (obj.scaleY || 1)));
        setObjectPosX(Math.round(obj.left || 0));
        setObjectPosY(Math.round(obj.top || 0));
        setObjectAngle(Math.round(obj.angle || 0));
      }
    };
    fCanvas.on("selection:created", syncSelection);
    fCanvas.on("selection:updated", syncSelection);
    fCanvas.on("selection:cleared", () => {
      setActiveObject(null);
      setSelectionCount(0);
      setSpineTextWasShrunk(false);
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

    // A saved design may reference a font outside the curated 66 (picked via the
    // full-catalog FontPicker in an earlier session) — load those before/alongside
    // import so text doesn't silently render in a fallback font after a reload.
    const restoredFonts = new Set<string>();
    for (const el of initialElements || []) {
      if (el?.fontFamily) restoredFonts.add(el.fontFamily);
      if (el?.curvedTextData?.fontFamily) restoredFonts.add(el.curvedTextData.fontFamily);
    }
    if (restoredFonts.size > 0) loadGoogleFontFamilies(Array.from(restoredFonts));

    // Smart resize: this effect re-runs (and rebuilds the canvas) whenever the
    // trim size, page count or paper type changes the cover geometry. Without a
    // remap the saved elements would be re-imported at coordinates meant for the
    // old canvas, so a 6x9 layout would land wrong on an 8.5x11. Transform the
    // element data rather than the built objects so asynchronously loaded
    // images go through the same mapping.
    const previousLayout = lastImportLayoutRef.current;
    const shouldRelayout =
      autoRelayoutRef.current && previousLayout && layoutsDiffer(previousLayout, layout);
    const elementsToImport = shouldRelayout
      ? relayoutLegacyElements(initialElements, previousLayout!, layout)
      : initialElements;
    lastImportLayoutRef.current = layout;

    // Initial elements import (translation from Konva element nodes to Fabric objects).
    // Adding each object fires object:added -> saveState, which serializes the
    // canvas and persists the remapped coordinates — so no explicit save here.
    // (Calling onSaveWorkspace directly at this point re-renders the parent
    // mid-effect and makes other effects render against the just-disposed canvas.)
    importLegacyElements(fCanvas, elementsToImport, layout);

    // Initial layers load
    updateLayers();

    return () => {
      fCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.canvasWidth, layout.canvasHeight]);

  // Handle snap-to-grid & guides alignment
  useEffect(() => {
    if (!isCanvasAlive(canvas)) return;

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

  // Paints the wraparound cover's background (solid/gradient fills, then any
  // uploaded background photos) onto an arbitrary 2D context at 1x scale —
  // the caller should ctx.scale(multiplier, multiplier) first for a
  // higher-resolution target. Shared by the live canvas's before:render hook
  // below AND by every export path (handleGenerateCover, the 3D mockup
  // crop, series batch export): Fabric's multiplier-based toDataURL()
  // renders through an internal clone that never fires bound render event
  // listeners, so without this the exported/mocked-up/batched covers come
  // out with the background missing (solid color fills and photos alike).
  // Draws an image to cover a rect edge-to-edge (like CSS background-size:
  // cover) with no distortion, clipped so it can never spill outside the
  // rect even while panned. offsetX/offsetY shift which part of the image
  // is visible; drawCoverImage itself doesn't clamp them (see
  // clampBackgroundOffset) since a stale/unclamped offset from before a
  // trim-size change should still render sanely rather than throw.
  const drawCoverImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    destX: number, destY: number, destW: number, destH: number,
    offsetX: number, offsetY: number
  ) => {
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    if (!imgW || !imgH) return;
    const coverScale = Math.max(destW / imgW, destH / imgH) * BACKGROUND_PAN_OVERSCAN;
    const scaledW = imgW * coverScale;
    const scaledH = imgH * coverScale;
    const maxOffsetX = Math.max(0, (scaledW - destW) / 2);
    const maxOffsetY = Math.max(0, (scaledH - destH) / 2);
    const clampedOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX));
    const clampedOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY));

    ctx.save();
    ctx.beginPath();
    ctx.rect(destX, destY, destW, destH);
    ctx.clip();
    ctx.drawImage(
      img,
      destX - (scaledW - destW) / 2 + clampedOffsetX,
      destY - (scaledH - destH) / 2 + clampedOffsetY,
      scaledW,
      scaledH
    );
    ctx.restore();
  };

  const paintCoverBackground = (ctx: CanvasRenderingContext2D) => {
    const bg = coverBackgroundRef.current || coverBackground;
    ctx.save();
    try {
      const backColor = bg.backCoverColor || "#0f172a";
      const frontColor = bg.frontCoverColor || "#0f172a";
      const backStart = bg.backCoverGradientStart || backColor;
      const backEnd = bg.backCoverGradientEnd || backColor;
      const frontStart = bg.frontCoverGradientStart || frontColor;
      const frontEnd = bg.frontCoverGradientEnd || frontColor;

      if (bg.backCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, layout.spineLeftPx, 0);
        grad.addColorStop(0, backStart);
        grad.addColorStop(1, backEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = backColor;
      }
      ctx.fillRect(0, 0, layout.spineLeftPx, layout.canvasHeight);

      if (bg.backCoverType === 'gradient' && bg.frontCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(layout.spineLeftPx, 0, layout.spineRightPx, 0);
        grad.addColorStop(0, backEnd);
        grad.addColorStop(1, frontStart);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = backColor;
      }
      ctx.fillRect(layout.spineLeftPx, 0, layout.spineWidthPx, layout.canvasHeight);

      if (bg.frontCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(layout.spineRightPx, 0, layout.canvasWidth, 0);
        grad.addColorStop(0, frontStart);
        grad.addColorStop(1, frontEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = frontColor;
      }
      ctx.fillRect(layout.spineRightPx, 0, layout.canvasWidth - layout.spineRightPx, layout.canvasHeight);

      if (fullCoverImageEl.current) {
        drawCoverImage(ctx, fullCoverImageEl.current, 0, 0, layout.canvasWidth, layout.canvasHeight,
          bg.fullCoverImageOffsetX || 0, bg.fullCoverImageOffsetY || 0);
      }
      if (backCoverImageEl.current) {
        drawCoverImage(ctx, backCoverImageEl.current, 0, 0, layout.spineLeftPx, layout.canvasHeight,
          bg.backCoverImageOffsetX || 0, bg.backCoverImageOffsetY || 0);
      }
      if (frontCoverImageEl.current) {
        drawCoverImage(ctx, frontCoverImageEl.current, layout.spineRightPx, 0, layout.canvasWidth - layout.spineRightPx, layout.canvasHeight,
          bg.frontCoverImageOffsetX || 0, bg.frontCoverImageOffsetY || 0);
      }
    } catch (err) {
      console.warn("Cover background paint fallback:", err);
    } finally {
      ctx.restore();
    }
  };

  // Renders a fabric canvas to a data URL that includes the custom-painted
  // background (see paintCoverBackground's comment for why this can't just
  // be canvas.toDataURL({multiplier})). Composites Fabric's own
  // objects-only multiplied render on top of a manually-painted background
  // layer at the same resolution.
  const exportCanvasWithBackground = (targetCanvas: fabric.Canvas, multiplier: number): Promise<string> => {
    return new Promise((resolve) => {
      const objectsOnlyDataUrl = targetCanvas.toDataURL({ format: 'png', multiplier });
      const img = new Image();
      img.onload = () => {
        const compositeEl = document.createElement('canvas');
        compositeEl.width = layout.canvasWidth * multiplier;
        compositeEl.height = layout.canvasHeight * multiplier;
        const ctx = compositeEl.getContext('2d');
        if (!ctx) { resolve(objectsOnlyDataUrl); return; }
        ctx.scale(multiplier, multiplier);
        paintCoverBackground(ctx);
        ctx.drawImage(img, 0, 0, layout.canvasWidth, layout.canvasHeight);
        resolve(compositeEl.toDataURL('image/png'));
      };
      img.src = objectsOnlyDataUrl;
    });
  };

  // Background painting and KDP Guides rendering in Fabric's before:render and after:render
  useEffect(() => {
    // Changing the trim size / page count rebuilds the fabric canvas, and the
    // init effect runs first — so on that render this effect still sees the
    // previous, already-disposed instance. Touching it throws inside fabric
    // (its 2D context is gone), which used to take the whole studio down.
    // Bailing is safe: `canvas` is a dependency, so this re-runs against the
    // new instance as soon as setCanvas commits.
    if (!isCanvasAlive(canvas)) return;

    // Remove legacy render listeners
    canvas.off("before:render");
    canvas.off("after:render");
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");

    // Paint backgrounds BEFORE drawing objects (so they sit behind all elements)
    canvas.on("before:render", () => {
      const ctx = canvas.getContext();
      if (!ctx) return;
      paintCoverBackground(ctx);
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

        // Labels — stacked on a fixed vertical cadence rather than each
        // computed independently from its own box's corner. On a narrow
        // spine, spineLeftPx/frontLiveLeftPx/bleedPx all land close together,
        // so independently-positioned labels used to overlap into unreadable
        // mush; three distinct lines stay legible regardless of spine width.
        ctx.font = "bold 9px sans-serif";
        const labelBaseY = layout.bleedPx - 4;
        ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
        ctx.fillText("TRIM LINE", layout.bleedPx + 4, labelBaseY);
        ctx.fillStyle = "rgba(244, 63, 94, 0.6)";
        ctx.fillText("SPINE AREA", layout.spineLeftPx + 4, labelBaseY + 11);
        ctx.fillStyle = "rgba(249, 115, 22, 0.6)";
        ctx.fillText("SAFETY ZONE", layout.frontLiveLeftPx + 4, labelBaseY + 22);

        ctx.restore();
      }

      // Smart alignment guide lines -- drawn regardless of showKdpGuides
      // since they're a drag-time aid, not a togglable layout guide.
      const guides = alignGuidesRef.current;
      if (guides.vertical.length || guides.horizontal.length) {
        ctx.save();
        ctx.strokeStyle = "#FF3EA5";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        guides.vertical.forEach((x) => {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, layout.canvasHeight);
          ctx.stroke();
        });
        guides.horizontal.forEach((y) => {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(layout.canvasWidth, y);
          ctx.stroke();
        });
        ctx.restore();
      }
    });

    // Background photos are painted straight onto the canvas (above) rather
    // than added as Fabric objects, so they get their own drag-to-pan mouse
    // handling here instead of Fabric's normal per-object dragging. Only
    // starts a pan when the click didn't land on an actual Fabric object
    // (opt.target), so decorative images/text on top keep working normally.
    // (regionForPointer is defined at component scope, shared with the
    // right-click context menu's "Remove Background Photo" option.)

    canvas.on("mouse:down", (opt: any) => {
      if (opt.target) return;
      const pointer = canvas.getPointer(opt.e);
      const region = regionForPointer(pointer.x, pointer.y);
      if (!region) return;
      const bg = coverBackgroundRef.current;
      const startOffsetX = region === 'front' ? (bg.frontCoverImageOffsetX || 0) : region === 'back' ? (bg.backCoverImageOffsetX || 0) : (bg.fullCoverImageOffsetX || 0);
      const startOffsetY = region === 'front' ? (bg.frontCoverImageOffsetY || 0) : region === 'back' ? (bg.backCoverImageOffsetY || 0) : (bg.fullCoverImageOffsetY || 0);
      bgDragRef.current = { region, startPointerX: pointer.x, startPointerY: pointer.y, startOffsetX, startOffsetY };
      // Suppress Fabric's own rubber-band selection box, which would
      // otherwise also try to start on this same empty-canvas mousedown.
      canvas.selection = false;
      canvas.defaultCursor = 'grabbing';
      canvas.setCursor('grabbing');
    });

    canvas.on("mouse:move", (opt: any) => {
      const drag = bgDragRef.current;
      if (!drag) {
        if (!opt.target) {
          const pointer = canvas.getPointer(opt.e);
          const hovering = regionForPointer(pointer.x, pointer.y);
          canvas.defaultCursor = hovering ? 'grab' : 'default';
        }
        return;
      }
      const img = getBackgroundImageEl(drag.region);
      if (!img) return;
      const pointer = canvas.getPointer(opt.e);
      const rawOffsetX = drag.startOffsetX + (pointer.x - drag.startPointerX);
      const rawOffsetY = drag.startOffsetY + (pointer.y - drag.startPointerY);
      const clamped = clampBackgroundOffset(drag.region, img, rawOffsetX, rawOffsetY);
      coverBackgroundRef.current = {
        ...coverBackgroundRef.current,
        ...(drag.region === 'front' ? { frontCoverImageOffsetX: clamped.x, frontCoverImageOffsetY: clamped.y }
          : drag.region === 'back' ? { backCoverImageOffsetX: clamped.x, backCoverImageOffsetY: clamped.y }
          : { fullCoverImageOffsetX: clamped.x, fullCoverImageOffsetY: clamped.y }),
      };
      canvas.requestRenderAll();
    });

    canvas.on("mouse:up", () => {
      const drag = bgDragRef.current;
      if (!drag) return;
      bgDragRef.current = null;
      canvas.selection = true;
      canvas.defaultCursor = 'grab';
      const bg = coverBackgroundRef.current;
      const finalOffsetX = drag.region === 'front' ? (bg.frontCoverImageOffsetX || 0) : drag.region === 'back' ? (bg.backCoverImageOffsetX || 0) : (bg.fullCoverImageOffsetX || 0);
      const finalOffsetY = drag.region === 'front' ? (bg.frontCoverImageOffsetY || 0) : drag.region === 'back' ? (bg.backCoverImageOffsetY || 0) : (bg.fullCoverImageOffsetY || 0);
      // Commit to React state (persists/saves) only once, at drag end —
      // matching Fabric's own object:modified-on-release pattern rather than
      // firing a state update on every intermediate frame of the drag.
      setBackgroundImageOffset(drag.region, finalOffsetX, finalOffsetY);
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
          fontWeight: el.fontWeight || 'normal',
          textAlign: el.align || 'center',
          originX: el.originX || 'left',
          originY: el.originY || 'top',
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
        const secureSrc = el.src.startsWith('data:')
          ? el.src
          : el.src.includes('?')
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

  // Named version checkpoints. The snapshot payload deliberately matches the
  // undo/redo state shape (same custom-prop list passed to toJSON) plus the
  // trim/page settings, since those change the canvas geometry too.
  const buildVersionSnapshot = () => ({
    pageCount,
    trimSize,
    background: coverBackgroundRef.current,
    canvasJson: canvas ? canvas.toJSON(['isCurvedText', 'curvedTextData']) : null,
  });

  // Review links carry a flattened preview rather than the editable design.
  // Rendered at 1x and re-encoded as JPEG: a 3x PNG is ~12MB, far too large to
  // put in a database row, and this only has to be good enough to review.
  const buildSharePreview = async (): Promise<string> => {
    if (!canvas) throw new Error("Canvas not ready");
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const pngUrl = await exportCanvasWithBackground(canvas, 1);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const el = document.createElement('canvas');
        el.width = img.width;
        el.height = img.height;
        const ctx = el.getContext('2d');
        if (!ctx) return reject(new Error("No 2D context"));
        ctx.drawImage(img, 0, 0);
        resolve(el.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error("Failed to render preview"));
      img.src = pngUrl;
    });
  };

  const restoreVersion = (version: CoverVersion) => {
    if (!canvas || !version.canvasJson) return;
    isUpdatingHistory.current = true;

    if (version.trimSize) setTrimSize(version.trimSize);
    if (version.pageCount) setPageCount(version.pageCount);
    if (version.background) {
      coverBackgroundRef.current = version.background;
      setCoverBackground(version.background);
    }

    canvas.loadFromJSON(version.canvasJson, () => {
      canvas.requestRenderAll();
      isUpdatingHistory.current = false;
      // Push the restored state onto the undo stack so the restore itself
      // is undoable rather than silently replacing history.
      saveStateRef.current?.();
    });
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

  // Spine text is a normal IText tagged with a "spine" id, which is what
  // unlocks the spine alignment controls and the auto-fit behaviour. It's
  // created pre-rotated and centered on the spine, then immediately fitted.
  const addSpineText = () => {
    if (!canvas) return;
    const text = new fabric.IText("BOOK TITLE", {
      id: `spine-text-${Date.now()}`,
      originX: 'center',
      originY: 'center',
      left: layout.spineCenterPx,
      top: layout.canvasHeight / 2,
      angle: spineTextRotation,
      fontFamily: "Arial",
      fontSize: 28,
      fontWeight: "bold",
      fill: "#FFFFFF",
      textAlign: "center"
    } as any);
    canvas.add(text);
    canvas.setActiveObject(text);
    setActiveObject(text);
    canvas.requestRenderAll();
    // Fit immediately so it never lands overflowing a thin spine.
    fitSpineTextObject(text);
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
    /** Omitted on designs saved before path shapes existed — those stay circular. */
    pathShape?: PathShape;
    /** Horizontal extent of the non-circular paths */
    pathWidth?: number;
    /** How pronounced the curve is */
    pathAmplitude?: number;
  }

  // Samples a parametric path centered on the origin, then walks it by arc
  // length so letters keep even spacing around the bends (stepping the raw
  // parameter instead would bunch them up where the curve is steep).
  const samplePathPoints = (shape: PathShape, width: number, amplitude: number) => {
    const STEPS = 400;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const x = (t - 0.5) * width;
      let y = 0;
      if (shape === 'wave') y = -amplitude * Math.sin(2 * Math.PI * t);
      else if (shape === 'bump') y = -amplitude * Math.sin(Math.PI * t);
      else if (shape === 'valley') y = amplitude * Math.sin(Math.PI * t);
      else if (shape === 'slant') y = (t - 0.5) * 2 * amplitude;
      points.push({ x, y });
    }

    const cumulative: number[] = [0];
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      cumulative.push(cumulative[i - 1] + Math.hypot(dx, dy));
    }

    const total = cumulative[cumulative.length - 1];

    // Position + tangent angle at a given distance along the path
    const at = (distance: number) => {
      const d = Math.max(0, Math.min(total, distance));
      let i = 1;
      while (i < cumulative.length - 1 && cumulative[i] < d) i++;
      const segLength = cumulative[i] - cumulative[i - 1] || 1;
      const f = (d - cumulative[i - 1]) / segLength;
      const p0 = points[i - 1];
      const p1 = points[i];
      return {
        x: p0.x + (p1.x - p0.x) * f,
        y: p0.y + (p1.y - p0.y) * f,
        angle: (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI,
      };
    };

    return { total, at };
  };

  const buildPathTextChars = (config: CurvedTextData): fabric.Text[] => {
    const { text, fontFamily, fontSize, fill } = config;
    const shape = config.pathShape || 'wave';
    const width = config.pathWidth ?? 300;
    const amplitude = config.pathAmplitude ?? 40;
    const { total, at } = samplePathPoints(shape, width, amplitude);

    // Build each glyph first so its real advance width drives the spacing.
    const chars = text.split('').map(
      (ch) => new fabric.Text(ch, { fontFamily, fontSize, fill, originX: 'center', originY: 'center' })
    );
    const widths = chars.map((c) => c.width || fontSize * 0.5);
    const textLength = widths.reduce((sum, w) => sum + w, 0);

    // Center the string along the path.
    let cursor = Math.max(0, (total - textLength) / 2);
    chars.forEach((charObj, i) => {
      const { x, y, angle } = at(cursor + widths[i] / 2);
      charObj.set({ left: x, top: y, angle });
      cursor += widths[i];
    });

    return chars;
  };

  // Fabric.js has no built-in text-on-a-path, so curved text is built as a
  // Group of individually positioned + rotated single-character Text
  // objects arranged along a circular arc. Editing content/radius/font
  // isn't a live in-place edit — the whole group is discarded and rebuilt
  // (see regenerateCurvedText below).
  const buildCurvedTextGroup = (config: CurvedTextData & { left: number; top: number }): fabric.Group => {
    const { text, radius, flip, fontFamily, fontSize, fill, left, top } = config;

    // Non-circular paths follow the sampled-path layout instead. The circular
    // branch below is kept as-is so designs saved before path shapes existed
    // render exactly as they did.
    if (config.pathShape && config.pathShape !== 'arc') {
      const pathChars = buildPathTextChars(config);
      const pathGroup = new fabric.Group(pathChars, { left, top });
      (pathGroup as any).isCurvedText = true;
      (pathGroup as any).curvedTextData = {
        text, radius, flip, fontFamily, fontSize, fill,
        pathShape: config.pathShape,
        pathWidth: config.pathWidth ?? 300,
        pathAmplitude: config.pathAmplitude ?? 40,
      };
      return pathGroup;
    }

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
    (group as any).curvedTextData = {
      text, radius, flip, fontFamily, fontSize, fill,
      pathShape: 'arc' as PathShape,
      pathWidth: config.pathWidth ?? 300,
      pathAmplitude: config.pathAmplitude ?? 40,
    };
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
    // Add unique cache buster query parameter to bypass browser CORS cache issue.
    // Skip for data: URLs (local uploads) — appending a query string corrupts them.
    const secureSrc = src.startsWith('data:')
      ? src
      : src.includes('?')
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

  const isTextLikeObject = (o: fabric.Object | null | undefined): boolean =>
    !!o && (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox');

  // Captures the subset of style properties that make sense to hand off to
  // another object (fill/stroke/opacity/shadow/blend, plus the text-specific
  // ones when the source is text) -- geometry (position/size/rotation) is
  // deliberately excluded since "style" shouldn't move or resize anything.
  const copyStyleFromActive = () => {
    if (!activeObject) return;
    const o = activeObject as any;
    const style: Record<string, any> = {
      fill: o.fill,
      stroke: o.stroke,
      strokeWidth: o.strokeWidth,
      strokeDashArray: o.strokeDashArray,
      opacity: o.opacity,
      shadow: o.shadow ? new fabric.Shadow(o.shadow) : null,
      globalCompositeOperation: o.globalCompositeOperation,
    };
    if (isTextLikeObject(activeObject)) {
      Object.assign(style, {
        fontFamily: o.fontFamily,
        fontSize: o.fontSize,
        fontWeight: o.fontWeight,
        fontStyle: o.fontStyle,
        underline: o.underline,
        charSpacing: o.charSpacing,
        textAlign: o.textAlign,
        lineHeight: o.lineHeight,
      });
    }
    setCopiedStyle(style);
  };

  const pasteStyleToActive = () => {
    if (!canvas || !activeObject || !copiedStyle) return;
    const { fontFamily, fontSize, fontWeight, fontStyle, underline, charSpacing, textAlign, lineHeight, ...common } = copiedStyle;
    activeObject.set(common);
    if (isTextLikeObject(activeObject)) {
      (activeObject as any).set({ fontFamily, fontSize, fontWeight, fontStyle, underline, charSpacing, textAlign, lineHeight });
    }
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  // Swaps the underlying image source in place via Fabric's own setSrc, which
  // keeps the object's current position/scale/rotation/crop untouched --
  // unlike removing and re-adding a fresh image, which would reset all of it.
  const handleReplaceImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file || !canvas || !activeObject || activeObject.type !== "image") return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      (activeObject as fabric.Image).setSrc(event.target.result, () => {
        canvas.requestRenderAll();
        canvas.fire("object:modified", { target: activeObject });
      }, { crossOrigin: "anonymous" });
    };
    reader.readAsDataURL(file);
  };

  const jumpToImageAdjustments = () => {
    imageAdjustmentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Right-clicking an object selects it first (matching standard design-tool
  // behavior) and opens a floating menu at the cursor; right-clicking empty
  // canvas offers Paste (plus Remove Background Photo if the click landed on
  // one). e.clientX/Y are used directly for menu placement since the menu
  // itself is fixed-position (viewport coordinates), unaffected by the
  // canvas's own CSS zoom transform -- finding the actual target object
  // still goes through Fabric's own findTarget, which (like getPointer)
  // correctly compensates for that zoom.
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canvas) return;
    const target = canvas.findTarget(e.nativeEvent as any, false);
    let bgRegion: 'front' | 'back' | 'full' | null = null;
    if (target) {
      canvas.setActiveObject(target);
      canvas.requestRenderAll();
    } else {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      const pointer = canvas.getPointer(e.nativeEvent as any);
      bgRegion = regionForPointer(pointer.x, pointer.y);
    }
    // Clamp so the menu never renders partly off-screen when right-clicking
    // near the viewport's right or bottom edge (rough estimate of the
    // menu's own footprint since it isn't measured yet at this point).
    const menuWidth = 190, menuHeight = 340;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);
    setContextMenu({ x: Math.max(8, x), y: Math.max(8, y), hasTarget: !!target, bgRegion });
  };

  // Close the context menu on any click elsewhere, Escape, or scroll --
  // only registered while it's actually open, matching the standard
  // dropdown/menu dismissal pattern. Clicks inside the menu itself are
  // ignored here so a mousedown on a menu button doesn't unmount it before
  // that button's own onClick (which fires later, on mouseup) can run --
  // each menu action closes the menu itself after running.
  useEffect(() => {
    if (!contextMenu) return;
    const close = (e?: MouseEvent) => {
      if (e && contextMenuRef.current && contextMenuRef.current.contains(e.target as Node)) return;
      setContextMenu(null);
    };
    const closeOnEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null); };
    const closeOnScroll = () => setContextMenu(null);
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [contextMenu]);

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

  const fitSpineTextObject = (
    target: fabric.Object,
    vAlignOverride?: 'top' | 'center' | 'bottom',
    rotOverride?: 90 | 270
  ) => {
    if (!canvas) return;
    const activeObject = target;

    const vAlign = vAlignOverride || spineTextVAlign;
    const rot = rotOverride || spineTextRotation;

    // Safety margin of 0.0625" (1/16") inside spine fold on each side
    // Total reduction = 0.125" (1/8")
    const maxAllowedWidthPx = (layout.spineWidth - 0.125) * layout.scale;
    // Keep 0.75" safe margin from top/bottom trim borders
    const vMarginPx = 0.75 * layout.scale;
    const maxAllowedLengthPx = (layout.trimBottomPx - layout.trimTopPx) - vMarginPx * 2;

    // Reset to unscaled before measuring so the fit is idempotent — otherwise
    // re-running it (which now happens on every spine text edit) would compound
    // the shrink factor and never grow back when the title gets shorter. Size
    // is therefore driven purely by fontSize, with this as a pure fit on top.
    activeObject.set({
      originX: 'center',
      originY: 'center',
      angle: rot,
      scaleX: 1,
      scaleY: 1
    });

    // fabric.Text caches its measured width/height and only recomputes them on
    // the next render, so measuring straight after a text/font change would use
    // the previous string's dimensions and skip the fit entirely.
    const remeasure = () => {
      const asText = activeObject as any;
      if (typeof asText.initDimensions === 'function') asText.initDimensions();
      activeObject.setCoords();
      return activeObject.getBoundingRect();
    };

    // Once rotated 90/270, the bounding box's width is the text's thickness
    // (must fit between the spine folds) and its height is the text's length
    // (must fit between the top/bottom margins). A long title overflows the
    // second one, so fit against both and take whichever is more restrictive.
    let boundingBox = remeasure();
    const widthScale = boundingBox.width > maxAllowedWidthPx ? maxAllowedWidthPx / boundingBox.width : 1;
    const lengthScale = boundingBox.height > maxAllowedLengthPx ? maxAllowedLengthPx / boundingBox.height : 1;
    const fitScale = Math.min(widthScale, lengthScale);

    if (fitScale < 1) {
      activeObject.set({ scaleX: fitScale, scaleY: fitScale });
      boundingBox = remeasure();
    }
    setSpineTextWasShrunk(fitScale < 1);

    // Calculate vertical position (top, center, bottom)
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

  const alignTextToSpine = (vAlignOverride?: 'top' | 'center' | 'bottom', rotOverride?: 90 | 270) => {
    if (!activeObject) return;
    fitSpineTextObject(activeObject, vAlignOverride, rotOverride);
  };

  refitSpineTextRef.current = () => alignTextToSpine();

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

  // Multi-object align/distribute. While objects sit inside an ActiveSelection
  // their left/top are relative to that group's center, so discarding the
  // selection first (which bakes absolute coordinates back onto each object)
  // is what makes plain left/top math correct here. The selection is rebuilt
  // afterwards so the user's selection isn't lost.
  const withUngroupedSelection = (fn: (objects: fabric.Object[]) => void) => {
    if (!canvas) return;
    const objects = canvas.getActiveObjects();
    if (objects.length < 2) return;

    canvas.discardActiveObject();
    objects.forEach(obj => obj.setCoords());
    fn(objects);
    objects.forEach(obj => obj.setCoords());

    const selection = new fabric.ActiveSelection(objects, { canvas });
    canvas.setActiveObject(selection);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: selection });
  };

  const alignSelection = (edge: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => {
    withUngroupedSelection((objects) => {
      const rects = objects.map(obj => ({ obj, rect: obj.getBoundingRect(true, true) }));
      const minX = Math.min(...rects.map(r => r.rect.left));
      const maxX = Math.max(...rects.map(r => r.rect.left + r.rect.width));
      const minY = Math.min(...rects.map(r => r.rect.top));
      const maxY = Math.max(...rects.map(r => r.rect.top + r.rect.height));
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      for (const { obj, rect } of rects) {
        // getBoundingRect can differ from left/top (stroke, rotation, origin),
        // so shift by the delta rather than assigning an absolute position.
        if (edge === 'left') obj.set({ left: (obj.left || 0) + (minX - rect.left) });
        else if (edge === 'right') obj.set({ left: (obj.left || 0) + (maxX - (rect.left + rect.width)) });
        else if (edge === 'centerX') obj.set({ left: (obj.left || 0) + (midX - (rect.left + rect.width / 2)) });
        else if (edge === 'top') obj.set({ top: (obj.top || 0) + (minY - rect.top) });
        else if (edge === 'bottom') obj.set({ top: (obj.top || 0) + (maxY - (rect.top + rect.height)) });
        else if (edge === 'centerY') obj.set({ top: (obj.top || 0) + (midY - (rect.top + rect.height / 2)) });
      }
    });
  };

  const distributeSelection = (axis: 'horizontal' | 'vertical') => {
    withUngroupedSelection((objects) => {
      if (objects.length < 3) return;
      const rects = objects.map(obj => ({ obj, rect: obj.getBoundingRect(true, true) }));
      const isH = axis === 'horizontal';
      const start = (r: { left: number; top: number }) => (isH ? r.left : r.top);
      const size = (r: { width: number; height: number }) => (isH ? r.width : r.height);

      rects.sort((a, b) => start(a.rect) - start(b.rect));

      const first = rects[0];
      const last = rects[rects.length - 1];
      const span = start(last.rect) + size(last.rect) - start(first.rect);
      const totalSize = rects.reduce((sum, r) => sum + size(r.rect), 0);
      // Equal gaps between edges, with the outermost two objects staying put.
      const gap = (span - totalSize) / (rects.length - 1);

      let cursor = start(first.rect) + size(first.rect) + gap;
      for (let i = 1; i < rects.length - 1; i++) {
        const { obj, rect } = rects[i];
        if (isH) obj.set({ left: (obj.left || 0) + (cursor - rect.left) });
        else obj.set({ top: (obj.top || 0) + (cursor - rect.top) });
        cursor += size(rect) + gap;
      }
    });
  };

  // Combines the current multi-selection into one permanent fabric.Group so
  // it can be moved/resized as a single unit and stays that way after
  // deselecting (unlike the transient ActiveSelection align/distribute use).
  // toGroup()/toActiveSelection() below set canvas._activeObject directly
  // (bypassing setActiveObject's event-firing path), so a follow-up
  // setActiveObject() call is a same-object no-op that fires nothing — the
  // sidebar's selection state has to be synced by hand instead of via events.
  const groupSelection = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') return;
    const group = (active as fabric.ActiveSelection).toGroup();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: group });
    setActiveObject(group);
    setSelectionCount(1);
    setObjectWidth(Math.round((group.width || 0) * (group.scaleX || 1)));
    setObjectHeight(Math.round((group.height || 0) * (group.scaleY || 1)));
  };

  // Splits a user-created group back into its individual objects. Curved
  // text is also internally a fabric.Group (see addCurvedText) but must stay
  // grouped for its path-following logic to keep working, so it's excluded.
  const ungroupSelection = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'group' || (active as any).isCurvedText) return;
    const selection = (active as fabric.Group).toActiveSelection();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: selection });
    setActiveObject(selection.getObjects()[0] || null);
    setSelectionCount(selection.getObjects().length);
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
        fullCoverImage: '',
        backCoverTextureId: '',
        frontCoverTextureId: '',
        fullCoverTextureId: '',
        backCoverImageOffsetX: 0, backCoverImageOffsetY: 0,
        frontCoverImageOffsetX: 0, frontCoverImageOffsetY: 0,
        fullCoverImageOffsetX: 0, fullCoverImageOffsetY: 0
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
        fullCoverImage: '',
        backCoverTextureId: '',
        frontCoverTextureId: '',
        fullCoverTextureId: '',
        backCoverImageOffsetX: 0, backCoverImageOffsetY: 0,
        frontCoverImageOffsetX: 0, frontCoverImageOffsetY: 0,
        fullCoverImageOffsetX: 0, fullCoverImageOffsetY: 0
      };
    }
    coverBackgroundRef.current = newBg;
    setCoverBackground(newBg);
    if (canvas) canvas.renderAll();
  };

  const applyBackgroundImage = (url: string, target: 'full' | 'front' | 'back', textureId = '') => {
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
      // Texture ids mirror whichever image slots this just set, so the saved
      // project can store a 12-byte id instead of a multi-megabyte data URL.
      const nextIds =
        target === 'full'
          ? { fullCoverTextureId: textureId, frontCoverTextureId: '', backCoverTextureId: '' }
          : target === 'front'
            ? { frontCoverTextureId: textureId, fullCoverTextureId: '' }
            : { backCoverTextureId: textureId, fullCoverTextureId: '' };
      coverBackgroundRef.current = { ...coverBackgroundRef.current, ...nextIds };
      setCoverBackground(prev => ({ ...prev, ...nextIds }));

      canvas.renderAll();
      canvas.fire("object:modified");
    };
  };

  // Textures are generated at the export resolution of the region they'll fill
  // (the export path multiplies the on-screen canvas by 3), so the grain stays
  // crisp in the final PDF instead of being upscaled from a screen-size render.
  const applyTexture = (texture: CoverTexture, target: 'full' | 'front' | 'back') => {
    const exportMultiplier = 3;
    const regionWidthPx =
      target === 'full'
        ? layout.canvasWidth
        : target === 'front'
          ? layout.canvasWidth - layout.spineRightPx
          : layout.spineLeftPx;

    const dataUrl = renderTexture(
      texture,
      regionWidthPx * exportMultiplier,
      layout.canvasHeight * exportMultiplier
    );
    applyBackgroundImage(dataUrl, target, texture.id);
  };

  const clearBackgroundImage = (target: 'full' | 'front' | 'back') => {
    if (target === 'full') {
      fullCoverImageEl.current = null;
      setFullCoverImage('');
    } else if (target === 'front') {
      frontCoverImageEl.current = null;
      setFrontCoverImage('');
    } else {
      backCoverImageEl.current = null;
      setBackCoverImage('');
    }
    const key = `${target}CoverTextureId` as const;
    coverBackgroundRef.current = { ...coverBackgroundRef.current, [key]: '' };
    setCoverBackground(prev => ({ ...prev, [key]: '' }));
    if (canvas) {
      canvas.renderAll();
      canvas.fire("object:modified");
    }
  };

  // A saved project stores only the texture id, so regenerate the actual pixels
  // once the canvas exists. Deterministic seeding means this reproduces exactly
  // the texture the user originally picked.
  const restoredTexturesRef = useRef(false);
  useEffect(() => {
    if (!canvas || restoredTexturesRef.current) return;
    const bg = coverBackgroundRef.current;
    const pending: [string | undefined, 'full' | 'front' | 'back', string][] = [
      [bg.fullCoverTextureId, 'full', bg.fullCoverImage],
      [bg.frontCoverTextureId, 'front', bg.frontCoverImage],
      [bg.backCoverTextureId, 'back', bg.backCoverImage],
    ];
    const needsRestore = pending.some(([id, , image]) => id && !image);
    if (!needsRestore) return;
    restoredTexturesRef.current = true;

    for (const [id, target, image] of pending) {
      if (!id || image) continue;
      const texture = COVER_TEXTURES.find(t => t.id === id);
      if (texture) applyTexture(texture, target);
    }
  }, [canvas]);

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

  // Zoom multiplies on top of the auto fit-to-container scaleRatio, so 100%
  // always means "fit to screen" regardless of window size.
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.25;
  const zoomIn = () => setUserZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100));
  const zoomOut = () => setUserZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100));
  const resetZoom = () => setUserZoom(1);

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
        backCoverTextureId: '',
        frontCoverTextureId: '',
        fullCoverTextureId: '',
        backCoverImageOffsetX: 0, backCoverImageOffsetY: 0,
        frontCoverImageOffsetX: 0, frontCoverImageOffsetY: 0,
        fullCoverImageOffsetX: 0, fullCoverImageOffsetY: 0,
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
    
    setTimeout(async () => {
      const dataURL = await exportCanvasWithBackground(canvas, 3);
      const { jsPDF } = await import("jspdf");

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

    setTimeout(async () => {
      const multiplier = 3;
      const fullDataUrl = await exportCanvasWithBackground(canvas, multiplier);

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

  // Crops out just the front-cover region (same trim math as the 3D mockup)
  // for the marketplace thumbnail preview — only the front cover shows up in
  // search results / product thumbnails, so the spine/back aren't needed.
  const handleOpenThumbPreview = () => {
    if (!canvas) return;
    setIsThumbPreviewOpen(true);
    setIsThumbPreviewLoading(true);
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    setTimeout(async () => {
      const multiplier = 3;
      const fullDataUrl = await exportCanvasWithBackground(canvas, multiplier);

      const img = new Image();
      img.onload = () => {
        const frontX = layout.frontLiveLeftPx - layout.safeMarginPx;
        const frontW = layout.trimRightPx - frontX;
        const frontH = layout.trimBottomPx - layout.trimTopPx;

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = frontW * multiplier;
        cropCanvas.height = frontH * multiplier;
        const ctx = cropCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            img,
            frontX * multiplier, layout.trimTopPx * multiplier, frontW * multiplier, frontH * multiplier,
            0, 0, frontW * multiplier, frontH * multiplier
          );
          setThumbPreviewUrl(cropCanvas.toDataURL('image/png'));
        }
        setIsThumbPreviewLoading(false);
      };
      img.src = fullDataUrl;
    }, 300);
  };

  // The text object whose content will be swapped per book when batch-
  // exporting a series: prefer whichever text object is currently selected,
  // otherwise fall back to the first text-like object found on the canvas.
  const findSeriesTargetObject = (): fabric.Object | null => {
    if (!canvas) return null;
    const isTextLike = (o: fabric.Object) => o.type === 'i-text' || o.type === 'text' || o.type === 'textbox';
    if (activeObject && isTextLike(activeObject)) return activeObject;
    return canvas.getObjects().find(isTextLike) || null;
  };

  const seriesTargetPreviewText = (() => {
    const obj = findSeriesTargetObject();
    return obj ? (obj as fabric.IText).text || "" : null;
  })();

  // Batch-exports the current design as a ZIP of separate KDP-ready cover
  // PDFs, one per title, everything else (background, fonts, decorations,
  // layout) held identical. Each title is rendered on a detached, off-DOM
  // fabric.Canvas cloned from the current design's JSON so the user's live
  // canvas is never disturbed mid-batch.
  const handleGenerateSeries = async (titles: string[]) => {
    if (!canvas) return;
    const targetObj = findSeriesTargetObject();
    if (!targetObj) throw new Error("No text object found to swap per title.");

    // Tag the live object so we can find its counterpart after
    // loadFromJSON reconstructs a fresh object graph on the temp canvas.
    (targetObj as any).seriesTitleMarker = true;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    const snapshot = canvas.toJSON(['isCurvedText', 'curvedTextData', 'seriesTitleMarker']);
    delete (targetObj as any).seriesTitleMarker;
    canvas.requestRenderAll();

    const [{ default: JSZip }, { jsPDF: JsPdfCtor }] = await Promise.all([
      import("jszip"),
      import("jspdf"),
    ]);
    const zip = new JSZip();

    const renderOne = (title: string): Promise<Blob> => {
      return new Promise((resolve) => {
        const tempEl = document.createElement('canvas');
        const tempCanvas = new fabric.Canvas(tempEl, {
          width: layout.canvasWidth,
          height: layout.canvasHeight,
        });
        tempCanvas.loadFromJSON(snapshot, async () => {
          const marked = tempCanvas.getObjects().find((o: any) => o.seriesTitleMarker);
          if (marked) {
            (marked as fabric.IText).set('text', title);
          }
          tempCanvas.renderAll();
          const dataUrl = await exportCanvasWithBackground(tempCanvas, 3);
          const doc = new JsPdfCtor({ orientation: "landscape", unit: "in", format: [layout.coverWidthInches, layout.coverHeightInches] });
          doc.addImage(dataUrl, 'PNG', 0, 0, layout.coverWidthInches, layout.coverHeightInches);
          tempCanvas.dispose();
          resolve(doc.output('blob'));
        });
      });
    };

    for (let i = 0; i < titles.length; i++) {
      const blob = await renderOne(titles[i]);
      const safeName = titles[i].replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 60) || `book-${i + 1}`;
      zip.file(`${safeName}.pdf`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `series-covers-${titles.length}-books.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    setIsSeriesModalOpen(false);
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
    copyStyleFromActive,
    pasteStyleToActive,
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
    <div className="flex flex-1 overflow-hidden h-full relative">
      <div className="absolute top-0 inset-x-0 z-40">
        <DesktopRecommendedBanner message="For the best cover design experience, we recommend using a laptop or desktop screen." />
      </div>
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
          onClick={() => setActiveToolTab(prev => prev === 'shapes' ? null : 'shapes')}
          title="Shapes"
          className={`p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
            activeToolTab === 'shapes' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Shapes className="w-5 h-5"/>
        </button>
        <button
          onClick={() => setActiveToolTab(prev => prev === 'graphics' ? null : 'graphics')}
          title="Clipart Library"
          className={`p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
            activeToolTab === 'graphics' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <ImageIcon className="w-5 h-5"/>
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
          onClick={() => {
            const nextTab = activeToolTab === 'draw' ? null : 'draw';
            setActiveToolTab(nextTab);
            toggleDrawingMode(nextTab === 'draw');
          }}
          title="Pencil / Freehand Draw"
          className={`p-3 rounded-2xl transition-all duration-200 ease-out active:scale-[0.94] ${
            activeToolTab === 'draw' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Pencil className="w-5 h-5"/>
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
            onClick={handleOpenThumbPreview}
            title="Marketplace Thumbnail Preview — see your cover at real Amazon listing sizes"
            className="p-3 mx-auto rounded-2xl text-slate-500 hover:text-white hover:bg-slate-900 transition-all duration-200 ease-out active:scale-[0.94]"
          >
            <Store className="w-5 h-5"/>
          </button>
          <button
            onClick={() => setIsSeriesModalOpen(true)}
            title="Series Branding — Batch Export"
            className="p-3 mx-auto rounded-2xl text-slate-500 hover:text-white hover:bg-slate-900 transition-all duration-200 ease-out active:scale-[0.94]"
          >
            <LayersIcon className="w-5 h-5"/>
          </button>
          <button
            onClick={() => setIsVersionsOpen(true)}
            title="Version History — Save & Restore Checkpoints"
            className="p-3 mx-auto rounded-2xl text-slate-500 hover:text-white hover:bg-slate-900 transition-all duration-200 ease-out active:scale-[0.94]"
          >
            <History className="w-5 h-5"/>
          </button>
          <button
            onClick={() => setIsShareOpen(true)}
            title="Share for Review — Read-only Client Link"
            className="p-3 mx-auto rounded-2xl text-slate-500 hover:text-white hover:bg-slate-900 transition-all duration-200 ease-out active:scale-[0.94]"
          >
            <Share2 className="w-5 h-5"/>
          </button>
          <button
            onClick={handleGenerateCover}
            disabled={isGenerating}
            title="Compile & Download PDF Cover"
            className="p-3 mx-auto rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-200 ease-out active:scale-[0.94] shadow-md shadow-indigo-600/25 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
          </button>
          <div className="pt-2 border-t border-slate-900 w-full flex justify-center">
            <SaveToNotebookButton
              title={`KDP Cover Design (${trimSize.w}x${trimSize.h})`}
              content={`Custom KDP Book Cover for ${pageCount} pages, trim size ${trimSize.w}x${trimSize.h} inches.`}
              category="cover"
            />
          </div>
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

            {/* Multi-object Align & Distribute */}
            {selectionCount >= 2 && (
              <div className="space-y-2 pb-2 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase">Align {selectionCount} Objects</h4>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {([
                    { edge: 'left', label: 'Left', icon: AlignStartVertical },
                    { edge: 'centerX', label: 'Center', icon: AlignCenterVertical },
                    { edge: 'right', label: 'Right', icon: AlignEndVertical },
                    { edge: 'top', label: 'Top', icon: AlignStartHorizontal },
                    { edge: 'centerY', label: 'Middle', icon: AlignCenterHorizontal },
                    { edge: 'bottom', label: 'Bottom', icon: AlignEndHorizontal },
                  ] as const).map(({ edge, label, icon: Icon }) => (
                    <button
                      key={edge}
                      onClick={() => alignSelection(edge)}
                      title={`Align ${label.toLowerCase()}`}
                      className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-400 text-slate-600 transition-colors cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-black uppercase">{label}</span>
                    </button>
                  ))}
                </div>

                {selectionCount >= 3 && (
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => distributeSelection('horizontal')}
                      title="Distribute horizontally with equal spacing"
                      className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-400 text-slate-600 transition-colors cursor-pointer"
                    >
                      <AlignHorizontalSpaceAround className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-black uppercase">Space H</span>
                    </button>
                    <button
                      onClick={() => distributeSelection('vertical')}
                      title="Distribute vertically with equal spacing"
                      className="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-400 text-slate-600 transition-colors cursor-pointer"
                    >
                      <AlignVerticalSpaceAround className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-black uppercase">Space V</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={groupSelection}
                  title="Group these objects into one"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-400 text-slate-600 transition-colors cursor-pointer"
                >
                  <GroupIcon className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase">Group</span>
                </button>
              </div>
            )}

            {/* Ungroup (only for user-made groups — curved text is also a
                group internally, but must stay grouped to keep following its path) */}
            {activeObject.type === 'group' && !(activeObject as any).isCurvedText && (
              <div className="pb-2 border-b border-slate-100">
                <button
                  onClick={ungroupSelection}
                  title="Ungroup back into individual objects"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-400 text-slate-600 transition-colors cursor-pointer"
                >
                  <UngroupIcon className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase">Ungroup</span>
                </button>
              </div>
            )}

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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Font Family</label>
                    <button
                      onClick={() => setBrandKit(addBrandFont(objectFontFamily))}
                      title="Save to Brand Kit"
                      className="text-slate-400 hover:text-amber-500 cursor-pointer"
                    >
                      <Star className="w-3 h-3" />
                    </button>
                  </div>
                  <FontPicker
                    value={objectFontFamily}
                    curatedCategories={FONT_CATEGORIES}
                    onChange={(font) => {
                      setObjectFontFamily(font);
                      updateActiveObjectProperty("fontFamily", font);
                    }}
                  />
                  {brandKit.fonts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {brandKit.fonts.map((font) => (
                        <button
                          key={font}
                          onClick={() => { setObjectFontFamily(font); updateActiveObjectProperty("fontFamily", font); }}
                          onDoubleClick={() => setBrandKit(removeBrandFont(font))}
                          title={`${font} (double-click to remove)`}
                          style={{ fontFamily: font }}
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 text-[10px] text-slate-700 cursor-pointer"
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  )}
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

                <button
                  onClick={handleAutoAlignSpineText}
                  title="Auto-rotate 90° and center text down the spine line"
                  className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" /> Auto-Align Text to Spine Line
                </button>

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

                {/* Text Effects */}
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Text Effects</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { key: 'none', label: 'None' },
                      { key: 'shadow', label: 'Shadow' },
                      { key: 'lift', label: 'Lift' },
                      { key: 'hollow', label: 'Hollow' },
                      { key: 'neon', label: 'Neon' },
                      { key: 'background', label: 'Background' },
                    ] as const).map((fx) => (
                      <button
                        key={fx.key}
                        onClick={() => applyTextEffectPreset(fx.key)}
                        className="py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50 text-slate-700 text-[8px] font-black uppercase transition-colors cursor-pointer"
                      >
                        {fx.label}
                      </button>
                    ))}
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
                        {spineTextWasShrunk && (
                          <p className="text-[8px] font-black text-indigo-600 bg-indigo-50/60 p-2 rounded-lg border border-indigo-200/50 leading-normal">
                            ↔ Auto-shrunk to fit the spine. Lower the font size for a larger visual result.
                          </p>
                        )}
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
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Path Shape</label>
                  <div className="grid grid-cols-3 gap-1">
                    {PATH_SHAPE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setCurvedPathShape(value);
                          regenerateCurvedText({ pathShape: value });
                        }}
                        className={`py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                          curvedPathShape === value
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {curvedPathShape === 'arc' ? (
                  <>
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
                        className={`p-2 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer ${!curvedFlip ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        Arc Up
                      </button>
                      <button
                        onClick={() => { setCurvedFlip(true); regenerateCurvedText({ flip: true }); }}
                        className={`p-2 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer ${curvedFlip ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                      >
                        Arc Down
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Path Width: {curvedPathWidth}px</label>
                      <input
                        type="range"
                        min={80}
                        max={600}
                        value={curvedPathWidth}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCurvedPathWidth(val);
                          regenerateCurvedText({ pathWidth: val });
                        }}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Curve Depth: {curvedPathAmplitude}px</label>
                      <input
                        type="range"
                        min={0}
                        max={150}
                        value={curvedPathAmplitude}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCurvedPathAmplitude(val);
                          regenerateCurvedText({ pathAmplitude: val });
                        }}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Font Family</label>
                  <FontPicker
                    value={curvedFontFamily}
                    curatedCategories={FONT_CATEGORIES}
                    onChange={(font) => {
                      setCurvedFontFamily(font);
                      regenerateCurvedText({ fontFamily: font });
                    }}
                  />
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
              <div ref={imageAdjustmentsRef} className="space-y-3 pt-2 border-t border-slate-100">
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

                <button
                  onClick={handleOpenBgRemover}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] rounded-lg uppercase tracking-wider cursor-pointer transition-all"
                >
                  <Scissors className="w-3.5 h-3.5" /> Remove Background
                </button>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Filters</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { key: 'original', label: 'Original' },
                      { key: 'bw', label: 'B&W' },
                      { key: 'vintage', label: 'Vintage' },
                      { key: 'warm', label: 'Warm' },
                      { key: 'cool', label: 'Cool' },
                      { key: 'fade', label: 'Fade' },
                    ] as const).map((f) => (
                      <button
                        key={f.key}
                        onClick={() => applyImageFilterPreset(f.key)}
                        className="py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50 text-slate-700 text-[8px] font-black uppercase transition-colors cursor-pointer"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
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
                    {eyedropperSupported && (
                      <button
                        onClick={() => pickColorFromScreen('fill', setObjectColor)}
                        title="Pick color from screen"
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer flex-shrink-0"
                      >
                        <Pipette className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setBrandKit(addBrandColor(objectColor.startsWith("#") ? objectColor : "#FFFFFF"))}
                      title="Save to Brand Kit"
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-amber-500 cursor-pointer flex-shrink-0"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {brandKit.colors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {brandKit.colors.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => { setObjectColor(hex); updateActiveObjectProperty("fill", hex, true); }}
                        onDoubleClick={() => setBrandKit(removeBrandColor(hex))}
                        title={`${hex} (double-click to remove)`}
                        style={{ backgroundColor: hex }}
                        className="w-5 h-5 rounded-full border border-slate-200 cursor-pointer hover:scale-110 transition-transform"
                      />
                    ))}
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
                        {eyedropperSupported && (
                          <button
                            onClick={() => pickColorFromScreen('stroke', setObjectStrokeColor)}
                            title="Pick color from screen"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer flex-shrink-0"
                          >
                            <Pipette className="w-3.5 h-3.5" />
                          </button>
                        )}
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

              {/* Exact position & rotation */}
              {!(activeObject as any).id?.startsWith('barcode') && (
                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">X (px)</label>
                    <input
                      type="number"
                      value={objectPosX}
                      onChange={(e) => handleExactPosX(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded-lg outline-none font-sans text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Y (px)</label>
                    <input
                      type="number"
                      value={objectPosY}
                      onChange={(e) => handleExactPosY(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 border border-slate-200 rounded-lg outline-none font-sans text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Rotate (°)</label>
                    <input
                      type="number"
                      value={objectAngle}
                      onChange={(e) => handleExactAngle(parseInt(e.target.value) || 0)}
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
                  <button onClick={addSpineText} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-indigo-400 hover:shadow-sm transition-all text-slate-700 cursor-pointer">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16M8 4h8M8 20h8" />
                    </svg>
                    <span>Add Spine Text (Auto-Fit)</span>
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

        {activeToolTab === 'shapes' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Shape Library</h3>
              <span className="text-[8px] font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Premium Shapes</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Basic Shapes</span>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={addRectangle} title="Rectangle" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Square className="w-5 h-5 text-amber-500"/>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Rect</span>
                </button>
                <button onClick={addCircle} title="Circle" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CircleIcon className="w-5 h-5 text-sky-500"/>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Circle</span>
                </button>
                <button onClick={addTriangle} title="Triangle" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 22h20L12 2z" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Triangle</span>
                </button>
                <button onClick={addEllipse} title="Ellipse" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <ellipse cx="12" cy="12" rx="10" ry="6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Ellipse</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Polygons</span>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={addPentagon} title="Pentagon" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2l9.5 6.9-3.6 11.1H6.1L2.5 8.9 12 2z" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Pentagon</span>
                </button>
                <button onClick={addHexagon} title="Hexagon" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2l9 5.196v10.392l-9 5.196-9-5.196V7.196L12 2z" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Hexagon</span>
                </button>
                <button onClick={addOctagon} title="Octagon" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 2h8l6 6v8l-6 6H8l-6-6V8l6-6z" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Octagon</span>
                </button>
                <button onClick={addDiamond} title="Diamond" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 12l10 10 10-10L12 2z" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Diamond</span>
                </button>
                <button onClick={addTrapezoid} title="Trapezoid" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 4h12l4 16H2L6 4z" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Trapezoid</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Decorative</span>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={addStar} title="Star" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500/20"/>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Star</span>
                </button>
                <button onClick={addHeart} title="Heart" className="group flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-red-500 fill-red-500/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black text-slate-700">Heart</span>
                </button>
              </div>
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

            {/* Active background quick-remove -- surfaced here too (not just
                in Settings) since this is where a background photo actually
                gets applied, so removing one is discoverable right where it
                was added. */}
            {(backCoverImage || frontCoverImage || fullCoverImage) && (
              <div className="space-y-1.5 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                <label className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Active Background Photos</label>
                {fullCoverImage && (
                  <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200 text-[10px]">
                    <span className="font-semibold text-slate-700">Full Cover</span>
                    <button onClick={() => clearBackgroundImage('full')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Remove</button>
                  </div>
                )}
                {backCoverImage && (
                  <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200 text-[10px]">
                    <span className="font-semibold text-slate-700">Back Cover</span>
                    <button onClick={() => clearBackgroundImage('back')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Remove</button>
                  </div>
                )}
                {frontCoverImage && (
                  <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200 text-[10px]">
                    <span className="font-semibold text-slate-700">Front Cover</span>
                    <button onClick={() => clearBackgroundImage('front')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Remove</button>
                  </div>
                )}
              </div>
            )}

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
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">1-Click Designer Themes</h3>
                <span className="text-[8px] font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Luxe Palette</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DESIGNER_PALETTES.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => applyDesignerPalette(palette)}
                    title={`Apply ${palette.name} theme`}
                    className="group rounded-xl border border-slate-200 hover:border-amber-400 p-2.5 bg-white text-left transition-all hover:shadow-md cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: palette.bgColor }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: palette.accentColor }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: palette.textColor }} />
                    </div>
                    <p className="text-[10px] font-black text-slate-800 truncate group-hover:text-amber-600">{palette.name}</p>
                    <span className="text-[8px] font-bold text-slate-400 block truncate">{palette.category}</span>
                  </button>
                ))}
              </div>
            </div>

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

            <div className="space-y-3">
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Textures</h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                  Pick where it goes, then choose a texture.
                </p>
              </div>

              <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40 text-[9px] font-black uppercase">
                {(['full', 'front', 'back'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTextureTarget(t)}
                    className={`flex-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                      textureTarget === t ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {t === 'full' ? 'Full' : t === 'front' ? 'Front' : 'Back'}
                  </button>
                ))}
              </div>

              {TEXTURE_CATEGORIES.map((category) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{category}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {COVER_TEXTURES.filter((t) => t.category === category).map((texture) => (
                      <button
                        key={texture.id}
                        onClick={() => applyTexture(texture, textureTarget)}
                        title={`${texture.name} — apply to ${textureTarget} cover`}
                        className="group rounded-lg border border-slate-200 hover:border-amber-400 overflow-hidden transition-all cursor-pointer"
                      >
                        <span className="block h-10 w-full" style={{ backgroundColor: texture.swatch }} />
                        <span className="block text-[8px] font-bold text-slate-500 group-hover:text-slate-800 py-1 px-0.5 truncate">
                          {texture.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
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

            {(backCoverImage || frontCoverImage || fullCoverImage) && (
              <div className="space-y-1.5 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                <label className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Active Background Photos</label>
                {fullCoverImage && (
                  <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200 text-[10px]">
                    <span className="font-semibold text-slate-700">Full Cover</span>
                    <button onClick={() => clearBackgroundImage('full')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Remove</button>
                  </div>
                )}
                {backCoverImage && (
                  <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200 text-[10px]">
                    <span className="font-semibold text-slate-700">Back Cover</span>
                    <button onClick={() => clearBackgroundImage('back')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Remove</button>
                  </div>
                )}
                {frontCoverImage && (
                  <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200 text-[10px]">
                    <span className="font-semibold text-slate-700">Front Cover</span>
                    <button onClick={() => clearBackgroundImage('front')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Remove</button>
                  </div>
                )}
              </div>
            )}

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

        {activeToolTab === 'draw' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Freehand Pencil & Brush</h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isDrawingMode ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-200 text-slate-500'}`}>
                {isDrawingMode ? 'Drawing Active' : 'Paused'}
              </span>
            </div>

            <button
              onClick={() => toggleDrawingMode()}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isDrawingMode
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              <Pencil className="w-4 h-4" />
              {isDrawingMode ? 'Pause Freehand Draw' : 'Activate Pencil Brush'}
            </button>

            {/* Brush Type */}
            <div className="space-y-2 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <label className="text-xs font-bold text-slate-600 block">Tool</label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { key: 'pen', label: 'Pen' },
                  { key: 'marker', label: 'Marker' },
                  { key: 'highlighter', label: 'Highlighter' },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => handleBrushTypeChange(t.key)}
                    className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg border transition-all ${
                      brushType === t.key
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Size Controls */}
            <div className="space-y-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">Brush Thickness</label>
                <span className="text-xs font-black text-slate-800">{drawingWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={drawingWidth}
                onChange={(e) => handleDrawingWidthChange(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: 'Fine (2px)', width: 2 },
                  { label: 'Pen (5px)', width: 5 },
                  { label: 'Marker (12px)', width: 12 },
                  { label: 'Brush (24px)', width: 24 }
                ].map((preset) => (
                  <button
                    key={preset.width}
                    onClick={() => handleDrawingWidthChange(preset.width)}
                    className={`py-1.5 px-1 text-[9px] font-black uppercase rounded-lg border transition-all ${
                      drawingWidth === preset.width
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Color Picker */}
            <div className="space-y-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">Brush Color</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">{drawingColor}</span>
                  <input
                    type="color"
                    value={drawingColor}
                    onChange={(e) => handleDrawingColorChange(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Swatches */}
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#10b981',
                  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleDrawingColorChange(color)}
                    style={{ backgroundColor: color }}
                    className={`h-7 rounded-lg border border-slate-300 shadow-inner transition-transform hover:scale-110 ${
                      drawingColor === color ? 'ring-2 ring-amber-500 ring-offset-1 scale-105' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  if (!canvas) return;
                  const pathObjs = canvas.getObjects().filter((o: any) => o.type === 'path' && !o.isHeart);
                  if (pathObjs.length === 0) return;
                  if (confirm(`Clear all ${pathObjs.length} freehand drawing stroke(s)?`)) {
                    pathObjs.forEach((o) => canvas.remove(o));
                    canvas.requestRenderAll();
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Clear Freehand Strokes
              </button>
            </div>
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

              <label className="flex items-start gap-2.5 cursor-pointer select-none bg-white p-2.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={autoRelayout}
                  onChange={(e) => setAutoRelayout(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 accent-indigo-600 cursor-pointer shrink-0"
                />
                <span className="text-[10px] font-bold text-slate-600 leading-snug">
                  Smart resize — reposition and rescale your design automatically when the trim
                  size, page count or paper type changes.
                </span>
              </label>

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
                <label className="text-xs font-bold text-slate-600 block mb-1">Cover Finish</label>
                <select
                  value={coverFinish}
                  onChange={(e) => setCoverFinish(e.target.value as any)}
                  className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="matte">Matte</option>
                  <option value="glossy">Glossy</option>
                </select>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Reminder only — this laminate finish is selected separately when you upload to KDP and doesn't change spine width or any layout math.
                </p>
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
                        <button onClick={() => clearBackgroundImage('full')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Clear</button>
                      </div>
                    )}
                    {backCoverImage && (
                      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[10px]">
                        <span className="font-semibold text-indigo-950 truncate max-w-[150px]">Back Cover BG Image</span>
                        <button onClick={() => clearBackgroundImage('back')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Clear</button>
                      </div>
                    )}
                    {frontCoverImage && (
                      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[10px]">
                        <span className="font-semibold text-indigo-950 truncate max-w-[150px]">Front Cover BG Image</span>
                        <button onClick={() => clearBackgroundImage('front')} className="text-red-500 hover:text-red-700 font-bold uppercase transition-colors">Clear</button>
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
      <div className="flex-1 bg-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 relative overflow-auto min-w-0">
        {/* Top Header Controls: Trim Badge & Action Toolbar with clean vertical spacing */}
        <div className="flex flex-col items-center gap-3.5 mb-5 z-20 shrink-0 select-none max-w-full">
          {/* Spine details helper */}
          <div className="bg-slate-950/90 px-4 py-2 rounded-full border border-slate-800 text-[10px] sm:text-xs font-black uppercase text-amber-400 tracking-widest shadow-md text-center truncate">
            Trim Size: {trimSize.w}" x {trimSize.h}" | Spine Width: {layout.spineWidth.toFixed(3)}"
          </div>

          {/* Global Canvas Control Bar */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white py-2 px-4 rounded-full border border-slate-200/80 shadow-md max-w-full overflow-x-auto">
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

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <button
              onClick={zoomOut}
              disabled={userZoom <= ZOOM_MIN}
              title="Zoom Out"
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all duration-150 active:scale-[0.94]"
            >
              <ZoomOut className="w-4 h-4"/>
            </button>
            <button
              onClick={resetZoom}
              title="Reset Zoom to Fit"
              className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors w-11 text-center"
            >
              {Math.round(userZoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              disabled={userZoom >= ZOOM_MAX}
              title="Zoom In"
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all duration-150 active:scale-[0.94]"
            >
              <ZoomIn className="w-4 h-4"/>
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <button
              onClick={handleGenerateCover}
              disabled={isGenerating}
              title="Compile & Download PDF Cover"
              className="p-2 pl-3 pr-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-all duration-150 active:scale-[0.94] flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
              <span className="text-[10px] font-black uppercase tracking-wider">{isGenerating ? "Compiling..." : "Download PDF"}</span>
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <button
              onClick={() => setIsShortcutsOpen(true)}
              title="Keyboard Shortcuts"
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-all duration-150 active:scale-[0.94]"
            >
              <Keyboard className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* Responsive parent container to calculate scale */}
        <div ref={containerRef} className={`flex-1 w-full h-full min-h-0 overflow-auto flex relative ${userZoom > 1 ? 'items-start justify-start' : 'items-center justify-center'}`}>
          {/* Scaled canvas container */}
          <div
            style={{
              transform: `scale(${scaleRatio * userZoom})`,
              transformOrigin: userZoom > 1 ? 'top left' : 'center center',
              transition: 'transform 0.1s ease',
              boxShadow: "var(--shadow-soft-lg)"
            }}
            className="relative bg-white rounded-sm ring-1 ring-slate-300 overflow-hidden cursor-default flex-shrink-0"
            onContextMenu={handleCanvasContextMenu}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={replaceImageInputRef}
          onChange={handleReplaceImageFile}
          className="hidden"
        />

        {contextMenu && (
          <div
            ref={contextMenuRef}
            style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 200 }}
            className="w-[190px] bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 text-xs font-semibold text-slate-700"
          >
            {contextMenu.hasTarget ? (
              <>
                <button onClick={() => { copySelected(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy <span className="ml-auto text-[10px] text-slate-400">Ctrl+C</span>
                </button>
                <button onClick={() => { cutSelected(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  <Scissors className="w-3.5 h-3.5 text-slate-400" /> Cut <span className="ml-auto text-[10px] text-slate-400">Ctrl+X</span>
                </button>
                <button onClick={() => { duplicateSelected(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate <span className="ml-auto text-[10px] text-slate-400">Ctrl+D</span>
                </button>
                {activeObject?.type === 'image' && (
                  <>
                    <div className="h-px bg-slate-100 my-1" />
                    <button onClick={() => { replaceImageInputRef.current?.click(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Replace Image
                    </button>
                    <button onClick={() => { toggleFlipX(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                      <FlipHorizontal className="w-3.5 h-3.5 text-slate-400" /> Flip Horizontal
                    </button>
                    <button onClick={() => { toggleFlipY(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                      <FlipVertical className="w-3.5 h-3.5 text-slate-400" /> Flip Vertical
                    </button>
                    <button onClick={() => { jumpToImageAdjustments(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Edit Image
                    </button>
                  </>
                )}
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={() => { copyStyleFromActive(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  <Paintbrush className="w-3.5 h-3.5 text-slate-400" /> Copy Style <span className="ml-auto text-[10px] text-slate-400">Ctrl+Alt+C</span>
                </button>
                <button
                  onClick={() => { pasteStyleToActive(); setContextMenu(null); }}
                  disabled={!copiedStyle}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-slate-400" /> Paste Style <span className="ml-auto text-[10px] text-slate-400">Ctrl+Alt+V</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={() => { bringToFront(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  <ChevronsUp className="w-3.5 h-3.5 text-slate-400" /> Bring to Front
                </button>
                <button onClick={() => { bringForward(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> Bring Forward
                </button>
                <button onClick={() => { sendBackward(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> Send Backward
                </button>
                <button onClick={() => { sendToBack(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  <ChevronsDown className="w-3.5 h-3.5 text-slate-400" /> Send to Back
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={() => { toggleLockSelected(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
                  {isObjectLocked ? <Unlock className="w-3.5 h-3.5 text-slate-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  {isObjectLocked ? 'Unlock' : 'Lock'} <span className="ml-auto text-[10px] text-slate-400">Ctrl+L</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={() => { deleteSelected(); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-red-50 text-red-600 text-left">
                  <Trash2 className="w-3.5 h-3.5" /> Delete <span className="ml-auto text-[10px] text-red-400">Del</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { if (clipboard) pasteSelected(); setContextMenu(null); }}
                  disabled={!clipboard}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Clipboard className="w-3.5 h-3.5 text-slate-400" /> Paste <span className="ml-auto text-[10px] text-slate-400">Ctrl+V</span>
                </button>
                {contextMenu.bgRegion && (
                  <>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => { clearBackgroundImage(contextMenu.bgRegion!); setContextMenu(null); }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-red-50 text-red-600 text-left"
                    >
                      <ImageOff className="w-3.5 h-3.5" /> Remove Background Photo
                    </button>
                  </>
                )}
              </>
            )}
            <div className="h-px bg-slate-100 my-1" />
            <button onClick={() => { setShowKdpGuides(!showKdpGuides); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 text-left">
              <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" /> {showKdpGuides ? 'Hide Guides' : 'Show Guides'}
            </button>
          </div>
        )}

        {/* Instructions Bar */}
        <div className="mt-4 flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white py-2.5 px-6 rounded-full border border-slate-200 shadow-sm">
          <span>Left: Back Cover</span>
          <span className="text-amber-500">Center: Spine</span>
          <span>Right: Front Cover</span>
        </div>
      </div>

      {isShortcutsOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setIsShortcutsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-800 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-500" /> Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 text-xs px-6 py-4 overflow-y-auto">
              {[
                ["Undo", "Ctrl+Z"],
                ["Redo", "Ctrl+Y"],
                ["Copy", "Ctrl+C"],
                ["Cut", "Ctrl+X"],
                ["Paste", "Ctrl+V"],
                ["Duplicate", "Ctrl+D"],
                ["Copy Style", "Ctrl+Alt+C"],
                ["Paste Style", "Ctrl+Alt+V"],
                ["Lock / Unlock", "Ctrl+L"],
                ["Delete", "Delete / Backspace"],
                ["Nudge 1px", "Arrow Keys"],
                ["Nudge 10px", "Shift + Arrow Keys"],
                ["Right-click object/canvas", "Context Menu"],
              ].map(([label, combo]) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="font-semibold text-slate-600">{label}</span>
                  <kbd className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">{combo}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

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

      <MarketplaceThumbnailPreviewModal
        isOpen={isThumbPreviewOpen}
        onClose={() => setIsThumbPreviewOpen(false)}
        frontImageDataUrl={thumbPreviewUrl}
        frontAspect={trimSize.w / trimSize.h}
        isLoading={isThumbPreviewLoading}
      />

      <SeriesBrandingModal
        isOpen={isSeriesModalOpen}
        onClose={() => setIsSeriesModalOpen(false)}
        targetPreviewText={seriesTargetPreviewText}
        onGenerate={handleGenerateSeries}
      />

      <BackgroundRemoverModal
        isOpen={isBgRemoverOpen}
        onClose={() => setIsBgRemoverOpen(false)}
        imageSrc={bgRemoverImageSrc}
        onApply={handleApplyBgRemoval}
      />

      <VersionHistoryModal
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        getSnapshot={buildVersionSnapshot}
        onRestore={restoreVersion}
      />

      <ShareReviewModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        buildPreview={buildSharePreview}
        meta={{
          trimLabel: trimSize.label,
          pageCount,
          spineWidth: layout.spineWidth,
        }}
      />
    </div>
  );
}
