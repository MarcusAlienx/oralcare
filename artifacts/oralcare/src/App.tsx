import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useEffect } from "react";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { LocaleProvider, useLocale } from "@/lib/locale";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { locale, t } = useLocale();

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta property="og:title" content={t("meta.title")} />
        <meta property="og:description" content={t("meta.description")} />
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
      </TooltipProvider>
    </>
  );
}

function App() {
  useEffect(() => {
    setAuthTokenGetter(() => (typeof window !== "undefined" ? window.localStorage.getItem("oralcare_admin_token") : null));
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <AppContent />
        </LocaleProvider>
        <Toaster />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
