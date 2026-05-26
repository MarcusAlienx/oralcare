import { ChatWidget } from "@/components/chat/ChatWidget";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, Star, MessageSquare, Phone, MapPin, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateLead, useTrackVisit } from "@workspace/api-client-react";
import { useLocale } from "@/lib/locale";
import { SmartDateTimePicker } from "@/components/ui/SmartDateTimePicker";

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

export default function Home() {
  const { toast } = useToast();
  const { t } = useLocale();
  const createLead = useCreateLead();
  const trackVisit = useTrackVisit();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    country: "",
    service: "",
    travelDates: "",
    message: ""
  });

  const [appointment, setAppointment] = useState({ date: "", time: "" });

  useEffect(() => {
    trackVisit.mutate({ data: { page: "/", referrer: document.referrer } });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!appointment.date || !appointment.time) {
      toast({
        title: t("leadForm.error.title"),
        description: t("leadForm.validation.selectDate"),
        variant: "destructive",
      });
      return;
    }

    try {
      await createLead.mutateAsync({ 
        data: { 
          ...formData, 
          message: `${formData.message}\n\nTravel Dates: ${formData.travelDates}\nCountry: ${formData.country}\nPreferred Appt: ${appointment.date} ${appointment.time}`
        } 
      });
      toast({
        title: t("leadForm.success.title"),
        description: t("leadForm.success.description"),
        variant: "default",
      });
      setFormData({ name: "", phone: "", email: "", country: "", service: "", travelDates: "", message: "" });
      setAppointment({ date: "", time: "" });
    } catch (error) {
      toast({
        title: t("leadForm.error.title"),
        description: t("leadForm.error.description"),
        variant: "destructive",
      });
    }
  };

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);

  const services = [
    { 
      id: "implants",
      title: t("services.implants.title"), 
      desc: t("services.implants.desc"), 
      img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
      details: t("services.implants.desc"),
    },
    { 
      id: "smile",
      title: t("services.smile.title"), 
      desc: t("services.smile.desc"), 
      img: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80",
      details: t("services.smile.desc"),
    },
    { 
      id: "holistic",
      title: t("services.holistic.title"), 
      desc: t("services.holistic.desc"), 
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80",
      details: t("services.holistic.desc"),
    },
  ];

  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <a 
        href="https://wa.me/523339153838" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-24 right-6 lg:bottom-28 lg:right-8 z-40 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all"
        aria-label={t("hero.whatsapp")}
      >
        <MessageSquare className="w-6 h-6" />
      </a>

      <section id="inicio" className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            style={{ y: y1 }}
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&q=80" 
            alt="Medical Tourism" 
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-white/80" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl">
            <FadeInWhenVisible>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                <Star className="w-4 h-4 fill-primary" />
                <span>{t("hero.badge")}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 leading-[1.1] mb-6">
                {t("hero.title")}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full" asChild>
                  <a href="#contacto">{t("hero.action")}</a>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full bg-white/50" asChild>
                  <a href="https://wa.me/523339153838" target="_blank" rel="noreferrer">{t("hero.whatsapp")}</a>
                </Button>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      <section id="servicios" className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <FadeInWhenVisible className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{t("nav.services")}</h2>
            <h3 className="text-4xl font-serif font-bold text-slate-900">{t("about.title")}</h3>
          </FadeInWhenVisible>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <FadeInWhenVisible key={service.id} delay={idx * 0.1}>
                <Card className="overflow-hidden border-0 shadow-lg cursor-pointer" onClick={() => setSelectedService(service)}>
                  <img src={service.img} alt={service.title} className="h-64 w-full object-cover" />
                  <CardContent className="p-6">
                    <h4 className="text-2xl font-serif font-bold mb-2">{service.title}</h4>
                    <p className="text-slate-600 line-clamp-3">{service.desc}</p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <FadeInWhenVisible>
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{t("nav.contact")}</h2>
              <h3 className="text-4xl font-serif font-bold text-slate-900 mb-6">{t("leadForm.title")}</h3>
              <p className="text-lg text-slate-600 mb-10">{t("leadForm.subtitle")}</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Phone className="text-primary" />
                  <span className="text-lg">+52 33 3915 3838</span>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="text-primary" />
                  <span className="text-lg">Av. Guadalupe 5787, Zapopan, Jalisco</span>
                </div>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <Card className="p-8 shadow-2xl border-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder={t("leadForm.fields.name")} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <Input placeholder={t("leadForm.fields.phone")} required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder={t("leadForm.fields.email")} type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <Input placeholder={t("leadForm.fields.country")} required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select value={formData.service} onValueChange={val => setFormData({...formData, service: val})}>
                      <SelectTrigger><SelectValue placeholder={t("leadForm.fields.treatment")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="implants">{t("leadForm.options.implants")}</SelectItem>
                        <SelectItem value="smile">{t("leadForm.options.smile")}</SelectItem>
                        <SelectItem value="holistic">{t("leadForm.options.holistic")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder={t("leadForm.fields.travelDates")} value={formData.travelDates} onChange={e => setFormData({...formData, travelDates: e.target.value})} />
                  </div>
                  <SmartDateTimePicker 
                    value={appointment} 
                    onChange={setAppointment} 
                    labels={{
                      label: t("appointmentPicker.label"),
                      note: t("appointmentPicker.note"),
                      chooseDate: t("appointmentPicker.chooseDate"),
                      chooseTime: t("appointmentPicker.chooseTime"),
                      noSlots: t("appointmentPicker.noSlots"),
                      invalidDate: t("appointmentPicker.invalidDate"),
                    }} 
                  />
                  <Textarea placeholder={t("leadForm.fields.message")} rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                  <Button type="submit" className="w-full rounded-full h-12" disabled={createLead.isPending}>
                    {createLead.isPending ? "..." : t("leadForm.fields.submit")}
                  </Button>
                </form>
              </Card>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedService && (
            <div className="p-6">
              <h2 className="text-3xl font-serif font-bold mb-4">{selectedService.title}</h2>
              <p className="text-slate-600 mb-6">{selectedService.details}</p>
              <Button className="w-full" onClick={() => setSelectedService(null)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <ChatWidget />
    </div>
  );
}