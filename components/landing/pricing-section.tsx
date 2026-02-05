import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Для небольших команд и тестирования",
    features: [
      "До 10 сотрудников",
      "1 офисная точка",
      "QR-отметки",
      "Базовая аналитика",
      "Email поддержка",
    ],
    cta: "Начать бесплатно",
    href: "/register",
    popular: false,
  },
  {
    name: "Business",
    price: "9 990",
    description: "Для растущих компаний",
    features: [
      "До 100 сотрудников",
      "До 5 офисных точек",
      "QR-отметки",
      "Геолокация",
      "Расширенная аналитика",
      "Экспорт отчётов",
      "Приоритетная поддержка",
    ],
    cta: "Выбрать Business",
    href: "/register",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Договорная",
    description: "Для крупных организаций",
    features: [
      "Безлимит сотрудников",
      "Безлимит офисных точек",
      "Все функции Business",
      "API доступ",
      "Выделенный менеджер",
      "SLA гарантии",
      "Кастомизация",
    ],
    cta: "Связаться с нами",
    href: "/contact",
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Простые и понятные тарифы
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Выберите план, который подходит вашей компании. Начните бесплатно.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col",
                plan.popular
                  ? "border-red-600 shadow-xl shadow-red-600/10"
                  : "border-gray-200"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-red-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Популярный
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price === "Договорная" ? "" : "₸"}
                  {plan.price}
                </span>
                {plan.price !== "Договорная" && (
                  <span className="text-gray-600 ml-1">/месяц</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full",
                  plan.popular
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                )}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
