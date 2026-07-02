import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import SplashScreen from "./components/SplashScreen";
import PageTransitionOverlay from "./components/PageTransitionOverlay";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Leafline",
  description: "AI-powered crop disease diagnosis for Bangladesh farmers.",
  manifest: "/manifest.json",
};

// Inline script runs synchronously before React hydrates — prevents flash of wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('leaflineTheme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.setAttribute('data-theme','light')}else{document.documentElement.setAttribute('data-theme','dark')}}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Must be first in <head> — sets data-theme before any CSS is applied */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SplashScreen />
          <PageTransitionOverlay />
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
