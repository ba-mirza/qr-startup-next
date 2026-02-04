"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, QrCode, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/auth";
import { signOut } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { name: "Функции", href: "/features" },
  { name: "Цены", href: "/pricing" },
  { name: "О нас", href: "/about" },
  { name: "Блог", href: "/blog" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={cn(
        "fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm border border-border/40 rounded-xl py-2"
          : "bg-transparent py-4 border rounded-xl"
      )}
    >
      <div className="flex items-center justify-between px-2 md:px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-primary-foreground">
              <QrCode />
            </div>
            <span className="text-red-600">KasipQR</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            {isLoading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Панель
                  </Link>
                </Button>
                <form action={signOut}>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Войти</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" asChild>
                  <Link href="/register">Регистрация</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Открыть меню</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="border border-gray-300 m-2 rounded-2xl">
              <SheetHeader className="flex justify-center items-center">
                <SheetTitle className="text-left flex items-center gap-2">
                  <div className="rounded-lg bg-red-600 p-1 text-white">
                    <QrCode />
                  </div>
                  <span className="text-lg">KasipQR</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-6">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors block py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2 border-muted" />
                <div className="flex flex-col gap-2 mb-4 text-lg">
                  {user ? (
                    <>
                      <Button variant="outline" className="w-full justify-center" asChild>
                        <Link href="/dashboard">
                          <User className="h-4 w-4 mr-2" />
                          Панель
                        </Link>
                      </Button>
                      <form action={signOut} className="w-full">
                        <Button className="w-full justify-center bg-red-600 text-white">
                          <LogOut className="h-4 w-4 mr-2" />
                          Выйти
                        </Button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full justify-center" asChild>
                        <Link href="/login">Войти</Link>
                      </Button>
                      <Button className="w-full justify-center bg-red-600 text-white" asChild>
                        <Link href="/register">Регистрация</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
