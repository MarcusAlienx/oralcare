import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Servicios", href: "#servicios" },
    { name: "Equipo", href: "#equipo" },
    { name: "Testimonios", href: "#testimonios" },
    { name: "Contacto", href: "#contacto" },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
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
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className={`font-serif font-bold text-2xl tracking-tight transition-colors ${isScrolled ? "text-primary" : "text-primary md:text-white"}`}>
              A&E ORALCARE
            </span>
            <span className={`text-[0.65rem] tracking-wider uppercase font-medium transition-colors ${isScrolled ? "text-slate-500" : "text-slate-500 md:text-white/80"}`}>
              Centro de Odontología Especializada
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isScrolled ? "text-slate-700" : "text-white/90"
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4 border-l border-slate-300/30 pl-6">
              <a 
                href="tel:+523339153838" 
                className={`flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary ${
                  isScrolled ? "text-slate-800" : "text-white"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>33 3915.3838</span>
              </a>
              <Button asChild variant={isScrolled ? "default" : "secondary"} className={!isScrolled ? "bg-white text-primary hover:bg-white/90" : ""}>
                <a href="#contacto" onClick={(e) => scrollToSection(e, "#contacto")}>
                  Agendar Cita
                </a>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-slate-800 bg-white/80 backdrop-blur rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-base font-medium text-slate-700 p-2 hover:bg-slate-50 rounded-md"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <a 
              href="tel:+523339153838" 
              className="flex items-center justify-center gap-2 text-base font-semibold text-primary p-2"
            >
              <Phone className="w-5 h-5" />
              <span>(33) 3915.3838</span>
            </a>
            <Button asChild className="w-full">
              <a href="#contacto" onClick={(e) => scrollToSection(e, "#contacto")}>
                Agendar Cita
              </a>
            </Button>
          </div>
        </div>
      )}
    </motion.header>
  );
}
