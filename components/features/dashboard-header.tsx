"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Menu, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50">
      <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-red-600 hidden sm:inline">KasipQR</span>
          </Link>

          <TabsList className="hidden md:flex bg-transparent h-auto p-0">
            <TabsTrigger value="overview">Создание проекта</TabsTrigger>
            <TabsTrigger value="employees">Таблица сотрудников</TabsTrigger>
            <TabsTrigger value="logs">Онлайн логи</TabsTrigger>
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

          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
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
              <nav className="flex flex-col gap-2 mt-8">
                <TabsTrigger value="overview" asChild onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    Создание проекта
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="employees" asChild onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    Таблица сотрудников
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="logs" asChild onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    Онлайн логи
                  </Button>
                </TabsTrigger>
                <TabsTrigger value="settings" asChild onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    Настройки
                  </Button>
                </TabsTrigger>
                <hr className="my-4" />
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    U
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User Name</p>
                    <p className="text-xs text-muted-foreground">user@example.com</p>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
