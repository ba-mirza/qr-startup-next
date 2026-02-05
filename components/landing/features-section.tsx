import {
  QrCode,
  Users,
  MapPin,
  Clock,
  Shield,
  Smartphone,
  BarChart3,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR-отметки",
    description:
      "Сотрудники отмечают приход и уход за секунды, просто сканируя QR-код.",
  },
  {
    icon: Clock,
    title: "Реальное время",
    description:
      "Мониторинг посещаемости в реальном времени. Видите кто на месте прямо сейчас.",
  },
  {
    icon: MapPin,
    title: "Геолокация",
    description:
      "Опциональная проверка геолокации для подтверждения нахождения в офисе.",
  },
  {
    icon: Users,
    title: "Управление сотрудниками",
    description:
      "Добавляйте сотрудников через временные QR-коды. Модерация заявок.",
  },
  {
    icon: Smartphone,
    title: "Мобильное приложение",
    description:
      "Удобное приложение для сотрудников. Сканирование и отметки в один клик.",
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    description:
      "Детальные отчёты по посещаемости. Экспорт данных в удобном формате.",
  },
  {
    icon: Shield,
    title: "Безопасность",
    description:
      "Данные защищены. Каждый сотрудник привязан к уникальному устройству.",
  },
  {
    icon: Bell,
    title: "Уведомления",
    description:
      "Оповещения об опозданиях и пропусках. Автоматическое закрытие дня.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Всё для учёта посещаемости
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Простой и надёжный инструмент для контроля рабочего времени вашей команды
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-600/5 transition-all"
            >
              <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
