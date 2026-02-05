import Link from "next/link";
import { QrCode } from "lucide-react";

const navigation = {
  product: [
    { name: "Функции", href: "#features" },
    { name: "Тарифы", href: "#pricing" },
    { name: "О продукте", href: "#about" },
  ],
  legal: [
    { name: "Политика конфиденциальности", href: "/privacy" },
    { name: "Условия использования", href: "/terms" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="text-white font-bold text-xl">KasipQR</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 max-w-md">
              Продукт команды today.development. Современная платформа для учёта посещаемости,
              управления мероприятиями и контроля доступа через QR-технологии.
            </p>
            <p className="text-sm text-gray-500">
              Казахстан, Атырау
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Продукт</h3>
            <ul className="space-y-2">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Правовая информация</h3>
            <ul className="space-y-2">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} KasipQR by today.development. Все права защищены.
          </p>
          <p className="text-sm text-gray-400">
            info@today.dev
          </p>
        </div>
      </div>
    </footer>
  );
};
