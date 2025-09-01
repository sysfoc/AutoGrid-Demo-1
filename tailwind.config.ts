import flowbite from "flowbite-react/tailwind";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Only 3 main colors with essential shades
        primary: {
          DEFAULT: '#662bcc',  // Main purple (buttons, links, brand)
          hover: '#5a24b8',    // Hover state
          light: '#f3f1ff',   // Light backgrounds, secondary buttons
        },
        
        text: {
          DEFAULT: '#1a1a1a',  // Main text color
          secondary: '#666666', // Secondary text
          inverse: '#ffffff',   // Text on dark/purple backgrounds
        },
        
        background: {
          DEFAULT: '#ffffff',  // Main background
          secondary: '#f8f8f8', // Cards, sections
          dark: '#1a1a1a',     // Dark mode background
        },
      },
    },
  },
  plugins: [
    flowbite.plugin(),
    function({ addBase }: { addBase: any }) {
      addBase({
        ':root': {
          '--primary': '#662bcc',
          '--primary-hover': '#5a24b8', 
          '--primary-light': '#f3f1ff',
          '--text': '#1a1a1a',
          '--text-secondary': '#666666',
          '--text-inverse': '#ffffff',
          '--bg': '#ffffff',
          '--bg-secondary': '#f8f8f8',
        },
        '.dark': {
          '--primary': '#662bcc',      // Keep same purple in dark mode
          '--primary-hover': '#5a24b8',
          '--primary-light': '#2d0f5a', // Darker purple for dark mode backgrounds
          '--text': '#ffffff',
          '--text-secondary': '#d1d5db',
          '--text-inverse': '#1a1a1a',
          '--bg': '#1a1a1a',
          '--bg-secondary': '#2d2d2d',
        },
      })
    }
  ],
};

export default config;