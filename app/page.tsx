import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  FeaturesSection,
  PricingSection,
  AboutSection,
  Footer,
} from "@/components/landing";
import { QrCode, ArrowRight, CheckCircle2 } from "lucide-react";

const heroFeatures = [
  "QR-отметки посещений",
  "Мониторинг в реальном времени",
  "Контроль доступа",
] as const;

const HeroSection = () => (
  <section className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
    <div className="max-w-4xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
        <QrCode className="h-4 w-4" />
        QR-платформа для бизнеса
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
        Контроль доступа
        <span className="text-red-600"> нового поколения</span>
      </h1>

      <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        KasipQR — платформа для учёта посещений, управления мероприятиями и контроля доступа.
        От офисов до шлагбаумов — всё через QR.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white px-8"
          asChild
        >
          <Link href="/register">
            Начать бесплатно
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="px-8" asChild>
          <Link href="/login">Войти в аккаунт</Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600">
        {heroFeatures.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-red-600" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
        <div className="bg-gray-100 rounded-2xl border border-gray-200 p-4 shadow-2xl shadow-red-600/10">
          <div className="bg-white rounded-xl border border-gray-100 h-64 sm:h-80 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-red-600/30" />
              <p>Превью интерфейса</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const RootPage = () => {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
};

export default RootPage;
