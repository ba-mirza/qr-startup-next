"use client";

import Link from "next/link";
import { QrCode, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/actions";

export const DashboardHeaderSimple = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50">
      <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <span className="text-red-600">KasipQR</span>
          </Link>

          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/dashboard/new">
              <Building2 className="h-4 w-4 mr-2" />
              Организации
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <form action={signOut}>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
};
