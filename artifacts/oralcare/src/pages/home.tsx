import { ChatWidget } from "@/components/chat/ChatWidget";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Star, MessageSquare, Phone, MapPin, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const FadeInWhenVisible = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StatCounter = ({ value, label, suffix = "" }: { value: number, label: string, suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px 0px" });
  
  return (
    <div ref={ref} className="text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="font-serif font-bold text-4xl md:text-5xl text-primary mb-2"
      >
        {value}{suffix}
      </motion.div>
      <p className="text-slate-600 font-medium">{label}</p>
    </div>
  );
};

export default function Home() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Mensaje enviado con éxito",
        description: "Nos pondremos en contacto contigo a la brevedad.",
        variant: "default",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  const services = [
    { title: "Ortodoncia", desc: "Alineación dental invisible y tradicional para una sonrisa perfecta.", img: "/images/service-ortho.png" },
    { title: "Implantes", desc: "Reemplazo dental permanente que se ve y siente natural.", img: "/images/service-implants.png" },
    { title: "Blanqueamiento", desc: "Aclara tu sonrisa varios tonos en una sola sesión segura.", img: "/images/service-whitening.png" },
    { title: "Endodoncia", desc: "Tratamiento de conductos indoloro para salvar tus piezas dentales.", img: "/images/hero.png" },
    { title: "Carillas", desc: "Finas láminas de porcelana para transformar completamente tu sonrisa.", img: "/images/about.png" },
    { title: "Odontopediatría", desc: "Cuidado dental especializado y compasivo para los más pequeños.", img: "/images/hero.png" },
  ];

  const team = [
    { name: "Dr. Roberto Álvarez", role: "Especialista en Implantología", img: "/images/team-3.jpg" },
    { name: "Dra. Elena Medina", role: "Ortodoncista", img: "/images/team-2.jpg" },
    { name: "Dr. Carlos Ruiz", role: "Rehabilitación Oral", img: "/images/team-1.jpg" },
  ];

  const testimonials = [
    { name: "María Fernanda López", text: "Excelente atención. Llevé a mi hijo y el trato fue inmejorable. La clínica está hermosa y te hacen sentir muy tranquilo.", img: "/images/patient_1.jpg" },
    { name: "Juan Pablo Sánchez", text: "Me hice un diseño de sonrisa y los resultados superaron mis expectativas. Profesionales altamente capacitados.", img: "/images/patient_2.jpg" },
    { name: "Sofía Hernández", text: "Tenía mucho miedo al dentista, pero aquí encontré especialistas que me explicaron todo el proceso con mucha paciencia.", img: "/images/patient_3.jpg" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/523339153838" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-24 right-6 lg:bottom-28 lg:right-8 z-40 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center hover:bg-[#20bd5a] hover:scale-105 transition-all"
        aria-label="Contactar por WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
      </a>

      {/* HERO SECTION */}
      <section id="inicio" className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="Clínica Dental Moderna" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:from-white/90 lg:via-white/50" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
            >
              <Star className="w-4 h-4 fill-primary" />
              <span>Centro de Odontología Especializada en Zapopan</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.1] mb-6"
            >
              Sonrisas <span className="text-primary italic">perfectas</span>,<br />
              cuidado excepcional.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg"
            >
              Atención dental premium en Guadalajara. Precisión clínica, tecnología de punta y un trato humano que te hará sentir seguro.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-white rounded-full shadow-xl shadow-primary/20" asChild>
                <a href="#contacto">Agendar Cita <ChevronRight className="ml-2 w-5 h-5" /></a>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-slate-300 text-slate-700 bg-white/50 backdrop-blur" asChild>
                <a href="https://wa.me/523339153838" target="_blank" rel="noreferrer">Contactar por WhatsApp</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NOSOTROS SECTION */}
      <section id="nosotros" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInWhenVisible>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/about.png" alt="Dentista evaluando paciente" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0 border border-black/5 rounded-2xl pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -z-10" />
              </div>
            </FadeInWhenVisible>
            
            <div className="space-y-8">
              <FadeInWhenVisible delay={0.1}>
                <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Nosotros</h2>
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                  Verdadero cuidado de la salud para tu familia
                </h3>
              </FadeInWhenVisible>
              
              <FadeInWhenVisible delay={0.2}>
                <p className="text-lg text-slate-600 leading-relaxed">
                  En A&E OralCare no somos una clínica de cadena. Somos un centro especializado donde cada paciente recibe atención personalizada y meticulosa. Creemos que la excelencia odontológica requiere tanto de tecnología avanzada como de profunda empatía.
                </p>
              </FadeInWhenVisible>
              
              <FadeInWhenVisible delay={0.3}>
                <ul className="space-y-4">
                  {[
                    "Especialistas certificados en cada área",
                    "Equipamiento y tecnología de última generación",
                    "Materiales dentales premium",
                    "Protocolos estrictos de esterilización"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </FadeInWhenVisible>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-slate-200 pt-16">
            <StatCounter value={15} suffix="+" label="Años de experiencia" />
            <StatCounter value={5000} suffix="+" label="Pacientes atendidos" />
            <StatCounter value={98} suffix="%" label="Satisfacción" />
            <StatCounter value={6} label="Especialidades" />
          </div>
        </div>
      </section>

      {/* SERVICIOS SECTION */}
      <section id="servicios" className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Especialidades</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Tratamientos Integrales</h3>
            <p className="text-lg text-slate-600">Ofrecemos soluciones dentales completas bajo un mismo techo, asegurando coherencia y calidad en cada etapa de tu tratamiento.</p>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <FadeInWhenVisible key={service.title} delay={idx * 0.1}>
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={service.img} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <h4 className="absolute bottom-6 left-6 text-2xl font-serif font-bold text-white">{service.title}</h4>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-slate-600 mb-6 line-clamp-2">{service.desc}</p>
                    <a href="#contacto" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Consultar <ChevronRight className="w-4 h-4" />
                    </a>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO SECTION */}
      <section id="equipo" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Nuestro Equipo</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Especialistas a tu servicio</h3>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-3 gap-10">
            {team.map((member, idx) => (
              <FadeInWhenVisible key={member.name} delay={idx * 0.15}>
                <div className="text-center group">
                  <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-xl border-4 border-white">
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-slate-900 mb-1">{member.name}</h4>
                  <p className="text-primary font-medium">{member.role}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS SECTION */}
      <section id="testimonios" className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Experiencias</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold mb-6">Lo que dicen nuestros pacientes</h3>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <FadeInWhenVisible key={test.name} delay={idx * 0.2}>
                <Card className="bg-white/5 border-white/10 backdrop-blur text-white">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />)}
                    </div>
                    <p className="text-slate-300 text-lg italic mb-8 leading-relaxed">"{test.text}"</p>
                    <div className="flex items-center gap-4">
                      <img src={test.img} alt={test.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/50" />
                      <div>
                        <h4 className="font-semibold">{test.name}</h4>
                        <p className="text-xs text-slate-400">Paciente A&E</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO SECTION */}
      <section id="contacto" className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <FadeInWhenVisible>
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Contacto</h2>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Agenda tu valoración</h3>
              <p className="text-lg text-slate-600 mb-10">Déjanos tus datos y nos comunicaremos contigo para agendar tu cita en el horario que mejor te convenga.</p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Llámanos</h4>
                    <a href="tel:+523339153838" className="text-slate-600 hover:text-primary transition-colors text-lg">+52 (33) 3915 3838</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Visítanos</h4>
                    <p className="text-slate-600">Av. Guadalupe 5787<br />Jorge Álvarez del Castillo<br />Zapopan, Jalisco</p>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
            
            <FadeInWhenVisible delay={0.2}>
              <Card className="border-0 shadow-2xl p-8 bg-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                      <Input required placeholder="Juan Pérez" className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Teléfono</label>
                      <Input required type="tel" placeholder="33 1234 5678" className="bg-slate-50" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Correo electrónico (opcional)</label>
                    <Input type="email" placeholder="correo@ejemplo.com" className="bg-slate-50" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Servicio de interés</label>
                    <Select>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ortodoncia">Ortodoncia</SelectItem>
                        <SelectItem value="implantes">Implantes</SelectItem>
                        <SelectItem value="blanqueamiento">Blanqueamiento</SelectItem>
                        <SelectItem value="endodoncia">Endodoncia</SelectItem>
                        <SelectItem value="general">Revisión General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mensaje</label>
                    <Textarea placeholder="Cuéntanos cómo podemos ayudarte..." rows={4} className="bg-slate-50 resize-none" />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base rounded-full" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Solicitar Cita"}
                  </Button>
                </form>
              </Card>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}
