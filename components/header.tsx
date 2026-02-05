"use client";

import { useState, useEffect, Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-auth";
import { signOut } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { name: "Функции", href: "#features" },
  { name: "Тарифы", href: "#pricing" },
  { name: "О продукте", href: "#about" },
];

const AuthButtonsSkeleton = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="h-8 w-16 rounded" />
    <Skeleton className="h-8 w-24 rounded-full" />
  </div>
);

const AuthButtons = () => {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <AuthButtonsSkeleton />;
  }

  if (user) {
    return (
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
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Войти</Link>
      </Button>
      <Button variant="outline" size="sm" className="rounded-full" asChild>
        <Link href="/register">Регистрация</Link>
      </Button>
    </>
  );
};

const MobileAuthButtons = () => {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 mb-4">
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    );
  }

  if (user) {
    return (
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
    );
  }

  return (
    <>
      <Button variant="outline" className="w-full justify-center" asChild>
        <Link href="/login">Войти</Link>
      </Button>
      <Button className="w-full justify-center bg-red-600 text-white" asChild>
        <Link href="/register">Регистрация</Link>
      </Button>
    </>
  );
};

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40 py-3"
          : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-primary-foreground">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-red-600">KasipQR</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
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
            <Suspense fallback={<AuthButtonsSkeleton />}>
              <AuthButtons />
            </Suspense>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Открыть меню</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="border-b">
              <SheetHeader className="flex justify-center items-center">
                <SheetTitle className="text-left flex items-center gap-2">
                  <div className="rounded-lg bg-red-600 p-1 text-white">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <span className="text-lg">KasipQR</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-6 mt-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium hover:text-red-600 transition-colors block py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2 border-muted" />
                <div className="flex flex-col gap-2 mb-4">
                  <Suspense fallback={
                    <div className="flex flex-col gap-2 mb-4">
                      <Skeleton className="h-10 w-full rounded" />
                      <Skeleton className="h-10 w-full rounded" />
                    </div>
                  }>
                    <MobileAuthButtons />
                  </Suspense>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
