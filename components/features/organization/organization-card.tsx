"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import type { Organization } from "@/types/organization";

interface OrganizationCardProps {
  organization: Organization;
}

export const OrganizationCard = ({ organization }: OrganizationCardProps) => {
  return (
    <Link
      href={`/dashboard/${organization.slug}`}
      className="flex items-center justify-center border rounded-lg w-80 h-80 transition-all border-gray-200 hover:bg-red-50 hover:border-red-200 cursor-pointer active:scale-95"
    >
      <div className="flex flex-col items-center gap-3 p-4 text-center">
        <div className="h-16 w-16 rounded-xl bg-red-100 flex items-center justify-center">
          <Building2 size={32} className="text-red-600" />
        </div>
        <span className="text-gray-800 font-medium text-lg">
          {organization.name}
        </span>
        <span className="text-gray-500 text-sm">
          БИН: {organization.bin}
        </span>
        {organization.bin_verified && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            Верифицирован
          </span>
        )}
      </div>
    </Link>
  );
};
