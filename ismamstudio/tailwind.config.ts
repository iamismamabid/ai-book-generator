import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",        // এটি src ফোল্ডারের সবকিছু কাভার করবে
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",    // app ফোল্ডার
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // components ফোল্ডার
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'], 
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // আমাদের প্রিমিয়াম রিডিং পেজের জন্য
  ],
};
export default config;