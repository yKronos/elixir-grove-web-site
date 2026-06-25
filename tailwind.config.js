/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17130f",
        ember: "#f6692a",
        cream: "#fff8ef",
        mist: "#f6f1ea",
        moss: "#3d4a37"
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 70px rgba(42, 31, 21, 0.12)",
        glow: "0 20px 70px rgba(246, 105, 42, 0.24)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" }
        },
        reveal: {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        sheen: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        reveal: "reveal 0.7s ease forwards",
        sheen: "sheen 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
