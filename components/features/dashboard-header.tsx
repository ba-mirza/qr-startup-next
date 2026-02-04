"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Menu, Search, Bell, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "@/app/(auth)/actions";

interface DashboardHeaderProps {
  organizationName: string;
}

export const DashboardHeader = ({ organizationName }: DashboardHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50">
      <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-red-600 hidden sm:inline">KasipQR</span>
          </Link>

          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link href="/dashboard/new">
              <Building2 className="h-4 w-4 mr-2" />
              Организации
            </Link>
          </Button>

          {organizationName && (
            <span className="hidden lg:inline text-sm text-muted-foreground border-l pl-4">
              {organizationName}
            </span>
          )}

          <TabsList className="hidden lg:flex bg-transparent h-auto p-0">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
            <TabsTrigger value="logs">Логи</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:flex relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
          </Button>

          <form action={signOut}>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <LogOut className="h-5 w-5" />
            </Button>
          </form>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="text-red-600">KasipQR</span>
                </SheetTitle>
              </SheetHeader>
              {organizationName && (
                <p className="text-sm text-muted-foreground mt-2 px-1">
                  {organizationName}
                </p>
              )}
              <nav className="flex flex-col gap-2 mt-8">
                <Button variant="ghost" className="justify-start w-full" asChild>
                  <Link href="/dashboard/new" onClick={() => setIsOpen(false)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Организации
                  </Link>
                </Button>
                <hr className="my-2" />
                <TabsTrigger value="overview" asChild onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    Обзор
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="employees" asChild onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    Сотрудники
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="logs" asChild onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    Логи
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="settings" asChild onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    Настройки
                  </Button>
                </TabsTrigger>
                <hr className="my-4" />
                <form action={signOut} className="w-full">
                  <Button variant="ghost" className="justify-start w-full text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </Button>
                </form>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
