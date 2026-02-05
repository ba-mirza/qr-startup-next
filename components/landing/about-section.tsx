import { Target, Lightbulb, Rocket } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Миссия",
    description:
      "Создавать инструменты, которые упрощают повседневные процессы. От учёта посещений до управления мероприятиями и доступом.",
  },
  {
    icon: Lightbulb,
    title: "Подход",
    description:
      "Мы создаём простые решения для сложных задач. Интуитивный интерфейс, который не требует обучения.",
  },
  {
    icon: Rocket,
    title: "Видение",
    description:
      "KasipQR — это платформа. Сегодня учёт посещений, завтра — мероприятия, шлагбаумы, контроль доступа и многое другое.",
  },
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              О продукте <span className="text-red-600">KasipQR</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              KasipQR — продукт команды <span className="font-semibold">today.development</span> из Атырау.
              Мы создаём современные решения для автоматизации процессов через QR-технологии.
            </p>
            <p className="text-gray-600 mb-6">
              Это не просто система учёта посещаемости. Это платформа, которая меняет подход
              к контролю доступа: офисы, мероприятия, парковки со шлагбаумами — всё через единый интерфейс.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-red-600">50+</p>
                <p className="text-gray-600 text-sm">Компаний</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">1000+</p>
                <p className="text-gray-600 text-sm">Пользователей</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">99.9%</p>
                <p className="text-gray-600 text-sm">Uptime</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <value.icon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
