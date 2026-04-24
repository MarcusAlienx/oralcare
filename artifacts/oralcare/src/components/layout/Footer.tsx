import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="space-y-6">
            <div>
              <h3 className="font-serif font-bold text-2xl text-white tracking-tight">
                A&E ORALCARE
              </h3>
              <p className="text-xs tracking-wider uppercase font-medium text-slate-400 mt-1">
                Centro de Odontología Especializada
              </p>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Brindamos atención dental premium y especializada para toda tu familia en Guadalajara. Precisión clínica con calidez humana.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary transition-colors hover:text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary transition-colors hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary transition-colors hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6 font-serif">Servicios</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#servicios" className="hover:text-primary transition-colors">Ortodoncia</a></li>
              <li><a href="#servicios" className="hover:text-primary transition-colors">Implantes Dentales</a></li>
              <li><a href="#servicios" className="hover:text-primary transition-colors">Endodoncia</a></li>
              <li><a href="#servicios" className="hover:text-primary transition-colors">Diseño de Sonrisa</a></li>
              <li><a href="#servicios" className="hover:text-primary transition-colors">Odontopediatría</a></li>
              <li><a href="#servicios" className="hover:text-primary transition-colors">Blanqueamiento</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6 font-serif">Horarios</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>Lunes - Viernes</span>
                <span className="text-white">9:00 - 20:00</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span>Sábado</span>
                <span className="text-white">9:00 - 14:00</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Domingo</span>
                <span className="text-primary font-medium">Cerrado</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6 font-serif">Contacto</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Av. Guadalupe 5787<br />Jorge Álvarez del Castillo<br />Zapopan, Jalisco</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+523339153838" className="hover:text-white transition-colors">+52 (33) 3915 3838</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:contacto@aeoralcare.com.mx" className="hover:text-white transition-colors">contacto@aeoralcare.com.mx</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} A&E OralCare. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Aviso de Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
