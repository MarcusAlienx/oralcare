import { ChatWidget } from "@/components/chat/ChatWidget";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, Star, MessageSquare, Phone, MapPin, Navigation, Clock, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateLead, useTrackVisit } from "@workspace/api-client-react";

const FadeInWhenVisible = ({ children, delay = 0, className = "", rotate = false }: { children: React.ReactNode, delay?: number, className?: string, rotate?: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotate: rotate ? 3 : 0 }}
      animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 30, rotate: rotate ? 3 : 0 }}
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
  const createLead = useCreateLead();
  const trackVisit = useTrackVisit();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: ""
  });

  useEffect(() => {
    trackVisit.mutate({ data: { page: "/", referrer: document.referrer } });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createLead.mutateAsync({ data: formData });
      toast({
        title: "Mensaje enviado con éxito",
        description: "Nos pondremos en contacto contigo a la brevedad.",
        variant: "default",
      });
      setFormData({ name: "", phone: "", email: "", service: "", message: "" });
    } catch (error) {
      toast({
        title: "Error al enviar",
        description: "Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);

  const services = [
    { 
      id: "ortodoncia",
      title: "Ortodoncia", 
      desc: "Alineación dental invisible y tradicional para una sonrisa perfecta.", 
      img: "/images/service-ortho.png",
      details: "Brackets metálicos, cerámicos o Invisalign. Tiempo estimado de 12 a 24 meses usando tecnología 3D para la planificación.",
      benefits: ["Alineación perfecta", "Mejora en la mordida", "Opciones discretas"],
      time: "12-24 meses"
    },
    { 
      id: "implantes",
      title: "Implantes", 
      desc: "Reemplazo dental permanente que se ve y siente natural.", 
      img: "/images/service-implants.png",
      details: "Utilizamos titanio de grado médico en un proceso de 3 fases. Se ven y sienten naturales con una duración de más de 20 años.",
      benefits: ["Durabilidad extrema", "Aspecto natural", "Previenen la pérdida ósea"],
      time: "3-6 meses (proceso completo)"
    },
    { 
      id: "blanqueamiento",
      title: "Blanqueamiento", 
      desc: "Aclara tu sonrisa varios tonos en una sola sesión segura.", 
      img: "/images/service-whitening.png",
      details: "Aplicación de gel de alta concentración que permite aclarar hasta 8 tonos de manera segura en una sesión clínica.",
      benefits: ["Resultados inmediatos", "Procedimiento seguro", "Aclara hasta 8 tonos"],
      time: "60 minutos"
    },
    { 
      id: "endodoncia",
      title: "Endodoncia", 
      desc: "Tratamiento de conductos indoloro para salvar tus piezas dentales.", 
      img: "/images/hero.png",
      details: "Tratamiento indoloro bajo anestesia local que permite salvar el diente natural eliminando el tejido infectado.",
      benefits: ["Salva tu diente natural", "Alivia el dolor", "Procedimiento indoloro"],
      time: "1-2 sesiones"
    },
    { 
      id: "carillas",
      title: "Carillas", 
      desc: "Finas láminas de porcelana para transformar completamente tu sonrisa.", 
      img: "/images/about.png",
      details: "Porcelana ultrafina diseñada digitalmente de forma personalizada para un cambio inmediato de sonrisa.",
      benefits: ["Sonrisa perfecta inmediata", "Alta resistencia a manchas", "Diseño personalizado"],
      time: "2-3 sesiones"
    },
    { 
      id: "odontopediatria",
      title: "Odontopediatría", 
      desc: "Cuidado dental especializado y compasivo para los más pequeños.", 
      img: "/images/hero.png",
      details: "Ambiente amigable para niños con aplicación de selladores, flúor y prevención. Primera visita gratuita.",
      benefits: ["Prevención de caries", "Ambiente sin estrés", "Educación dental temprana"],
      time: "30-45 minutos por cita"
    },
  ];

  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  const team = [
    { name: "Dr. Alejandro Estrada", role: "Director y Cirujano Oral", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80", edu: "Universidad de Guadalajara" },
    { name: "Dra. Ana Ibáñez", role: "Ortodoncista Certificada", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80", edu: "Invisalign Provider" },
    { name: "Dr. Carlos Muñoz", role: "Especialista en Implantología", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80", edu: "Máster en Implantes Europa" },
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
          <motion.img 
            style={{ y: y1 }}
            src="/images/hero.png" 
            alt="Clínica Dental Moderna" 
            className="w-full h-[120%] object-cover object-center -top-[10%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:from-white/90 lg:via-white/50" />
        </div>

        {/* Animated background blobs */}
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl z-0"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-secondary/10 rounded-full blur-2xl z-0"
        />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 shadow-sm border border-primary/10"
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
              <Button size="lg" className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-white rounded-full shadow-xl shadow-primary/20 relative overflow-hidden group" asChild>
                <a href="#contacto">
                  <span className="relative z-10 flex items-center">Agendar Cita <ChevronRight className="ml-2 w-5 h-5" /></span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-slate-300 text-slate-700 bg-white/50 backdrop-blur hover:bg-white/80 transition-all" asChild>
                <a href="https://wa.me/523339153838" target="_blank" rel="noreferrer">Contactar por WhatsApp</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NOSOTROS SECTION */}
      <section id="nosotros" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInWhenVisible>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/about.png" alt="Dentista evaluando paciente" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 border border-black/5 rounded-2xl pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-full blur-3xl -z-10" />
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
      <section id="servicios" className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[60px] -z-10 animate-pulse" />
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Especialidades</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Tratamientos Integrales</h3>
            <p className="text-lg text-slate-600">Ofrecemos soluciones dentales completas bajo un mismo techo, asegurando coherencia y calidad en cada etapa de tu tratamiento.</p>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <FadeInWhenVisible key={service.title} delay={idx * 0.1} rotate={true}>
                <Card 
                  className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={service.img} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <h4 className="absolute bottom-6 left-6 text-2xl font-serif font-bold text-white group-hover:text-primary-foreground transition-colors">{service.title}</h4>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-slate-600 mb-6 line-clamp-2">{service.desc}</p>
                    <span className="text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver detalles <ChevronRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE MODAL */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 border-0">
          {selectedService && (
            <>
              <div className="relative h-48 w-full">
                <img src={selectedService.img} alt={selectedService.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <h2 className="absolute bottom-4 left-6 text-3xl font-serif font-bold text-white">{selectedService.title}</h2>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  {selectedService.details}
                </p>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" /> Beneficios
                  </h4>
                  <ul className="space-y-2">
                    {selectedService.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <Clock className="w-4 h-4 text-primary" />
                  <span><strong>Duración:</strong> {selectedService.time}</span>
                </div>

                <div className="pt-2">
                  <Button className="w-full rounded-full h-12" onClick={() => {
                    setSelectedService(null);
                    setTimeout(() => {
                      document.querySelector("#contacto")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}>
                    Agendar Cita
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors">
                          <Info className="w-4 h-4" /> Ver perfil
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-slate-800 p-3 shadow-xl border border-slate-100">
                        <p className="font-semibold text-sm">{member.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{member.edu}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                <Card className="bg-white/5 border-white/10 backdrop-blur text-white hover:bg-white/10 transition-colors">
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
      <section id="contacto" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <FadeInWhenVisible>
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Contacto</h2>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Agenda tu valoración</h3>
              <p className="text-lg text-slate-600 mb-10">Déjanos tus datos y nos comunicaremos contigo para agendar tu cita en el horario que mejor te convenga.</p>
              
              <div className="space-y-8 mb-10">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <Phone className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Llámanos</h4>
                    <a href="tel:+523339153838" className="text-slate-600 hover:text-primary transition-colors text-lg">+52 (33) 3915 3838</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <MapPin className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">Visítanos</h4>
                    <p className="text-slate-600 mb-4">Av. Guadalupe 5787<br />Jorge Álvarez del Castillo<br />Zapopan, Jalisco</p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 border-slate-300 hover:bg-slate-50" asChild>
                        <a href="https://maps.google.com/maps?q=Av.+Guadalupe+5787+Zapopan+Jalisco" target="_blank" rel="noreferrer">
                          <MapPin className="w-3.5 h-3.5" /> Google Maps
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 border-slate-300 hover:bg-slate-50" asChild>
                        <a href="https://waze.com/ul?q=Av.+Guadalupe+5787+Zapopan+Jalisco" target="_blank" rel="noreferrer">
                          <Navigation className="w-3.5 h-3.5" /> Waze
                        </a>
                      </Button>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-200 h-48 w-full relative shadow-sm">
                      <iframe 
                        src="https://maps.google.com/maps?q=Av.+Guadalupe+5787,+Zapopan,+Jalisco&output=embed"
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mapa de ubicación A&E OralCare"
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
            
            <FadeInWhenVisible delay={0.2}>
              <Card className="border-0 shadow-2xl p-8 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                      <Input 
                        required 
                        placeholder="Juan Pérez" 
                        className="bg-slate-50" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Teléfono</label>
                      <Input 
                        required 
                        type="tel" 
                        placeholder="33 1234 5678" 
                        className="bg-slate-50" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Correo electrónico (opcional)</label>
                    <Input 
                      type="email" 
                      placeholder="correo@ejemplo.com" 
                      className="bg-slate-50" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Servicio de interés</label>
                    <Select value={formData.service} onValueChange={(val) => setFormData({...formData, service: val})}>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ortodoncia">Ortodoncia</SelectItem>
                        <SelectItem value="implantes">Implantes</SelectItem>
                        <SelectItem value="blanqueamiento">Blanqueamiento</SelectItem>
                        <SelectItem value="endodoncia">Endodoncia</SelectItem>
                        <SelectItem value="carillas">Carillas</SelectItem>
                        <SelectItem value="odontopediatria">Odontopediatría</SelectItem>
                        <SelectItem value="general">Revisión General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mensaje (opcional)</label>
                    <Textarea 
                      placeholder="Cuéntanos cómo podemos ayudarte..." 
                      rows={4} 
                      className="bg-slate-50 resize-none" 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base rounded-full relative overflow-hidden group" disabled={createLead.isPending}>
                    <span className="relative z-10">{createLead.isPending ? "Enviando..." : "Solicitar Cita"}</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
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