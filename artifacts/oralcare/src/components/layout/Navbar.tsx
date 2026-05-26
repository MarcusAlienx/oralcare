import { useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { locale, setLocale, t } = useLocale();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { name: t("nav.home"), href: "#inicio", isScroll: true },
    { name: t("nav.about"), href: "#nosotros", isScroll: true },
    { name: t("nav.services"), href: "#servicios", isScroll: true },
    { name: t("nav.team"), href: "#equipo", isScroll: true },
    { name: t("nav.testimonials"), href: "#testimonios", isScroll: true },
    { name: t("nav.contact"), href: "#contacto", isScroll: true },
  ];

  const tourismLink = { name: "Medical Tourism", href: "/turismo", isScroll: false };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex flex-col">
            <span className="font-serif font-bold text-2xl tracking-tight transition-colors text-slate-900">
              A&E ORALCARE
            </span>
            <span className="text-[0.65rem] tracking-wider uppercase font-medium transition-colors text-slate-600">
              Centro de Odontología Especializada
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => link.isScroll ? scrollToSection(e, link.href) : undefined}
                  className="text-sm font-medium transition-colors text-slate-800 hover:text-primary"
                >
                  {link.name}
                </a>
              ))}
              <Link 
                href={tourismLink.href} 
                className="text-sm transition-colors text-primary hover:text-blue-700 font-bold"
              >
                {tourismLink.name}
              </Link>
            </div>

            <div className="flex items-center gap-4 border-l border-slate-300/30 pl-6">
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1">
                {(["es", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      locale === lang ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => setLocale(lang)}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <a
                href="tel:+523339153838"
                className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary text-slate-800"
              >
                <Phone className="w-4 h-4" />
                <span>33 3915 3838</span>
              </a>
              <Button asChild variant="default" className="relative overflow-hidden group">
                <a href="#contacto" onClick={(e) => scrollToSection(e, "#contacto")}> 
                  <span className="relative z-10">{t("nav.schedule")}</span>
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                </a>
              </Button>
            </div>
          </div>

          <button
            className="lg:hidden p-2 text-slate-800 bg-white/80 backdrop-blur rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => link.isScroll ? scrollToSection(e, link.href) : undefined}
              className="text-base font-medium text-slate-700 p-2 hover:bg-slate-50 rounded-md"
            >
              {link.name}
            </a>
          ))}
          <Link 
            href={tourismLink.href} 
            className="text-base font-medium text-primary p-2 hover:bg-slate-50 rounded-md"
          >
            {tourismLink.name}
          </Link>          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            {(["es", "en"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  locale === lang ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => setLocale(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <a
              href="tel:+523339153838"
              className="flex items-center justify-center gap-2 text-base font-semibold text-primary p-2"
            >
              <Phone className="w-5 h-5" />
              <span>+52 33 3915 3838</span>
            </a>
            <Button asChild className="w-full">
              <a href="#contacto" onClick={(e) => scrollToSection(e, "#contacto")}>{t("nav.schedule")}</a>
            </Button>
          </div>
        </div>
      )}
    </motion.header>
  );
}
