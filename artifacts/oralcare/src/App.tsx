import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Helmet>
          <title>A&E OralCare | Centro de Odontología Especializada en Guadalajara</title>
          <meta name="description" content="Clínica dental especializada en Guadalajara. Ortodoncia, implantes, endodoncia y más. Atención personalizada para toda la familia. Llama: +52 (33) 3915.3838" />
          <meta property="og:title" content="A&E OralCare | Especialistas Dentales" />
          <meta property="og:description" content="Clínica dental especializada en Zapopan, Jalisco. Atención de primer nivel." />
          <meta property="og:type" content="website" />
          <link rel="canonical" href="https://aeoralcare.com.mx" />
          <script type="application/ld+json">
            {`{
              "@context": "https://schema.org",
              "@type": "Dentist",
              "name": "A&E OralCare",
              "telephone": "+523339153838",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Guadalupe 5787",
                "addressLocality": "Zapopan",
                "addressRegion": "Jalisco",
                "addressCountry": "MX"
              },
              "priceRange": "$$",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
                  "opens": "09:00",
                  "closes": "20:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "09:00",
                  "closes": "14:00"
                }
              ]
            }`}
          </script>
        </Helmet>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
