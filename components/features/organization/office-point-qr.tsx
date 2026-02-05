"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";
import type { OfficePoint } from "@/types/organization";

interface OfficePointQRProps {
  officePoint: OfficePoint;
  organizationName: string;
}

interface QRData {
  type: "office_check";
  token: string;
  office_name: string;
  address: string | null;
  organization: string;
}

export const OfficePointQR = ({ officePoint, organizationName }: OfficePointQRProps) => {
  const qrData: QRData = {
    type: "office_check",
    token: officePoint.qr_token,
    office_name: officePoint.name,
    address: officePoint.address,
    organization: organizationName,
  };

  const qrValue = JSON.stringify(qrData);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {officePoint.name}
          </CardTitle>
          {officePoint.is_main && (
            <Badge variant="secondary">Главный</Badge>
          )}
        </div>
        {officePoint.address && (
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {officePoint.address}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <QRCodeSVG
            value={qrValue}
            size={200}
            level="H"
            includeMargin={false}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Сотрудники сканируют этот QR для отметки посещения
        </p>
      </CardContent>
    </Card>
  );
};
