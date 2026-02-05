"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Download, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { useDeleteOfficePoint, useRegenerateOfficePointQR } from "@/hooks/use-settings";
import type { OfficePoint } from "@/types/organization";

interface OfficePointsListProps {
  officePoints: OfficePoint[];
  organizationName: string;
}

interface QRData {
  type: "office_check";
  token: string;
  office_name: string;
  address: string | null;
  organization: string;
}

const downloadQR = (elementId: string, filename: string) => {
  const svg = document.getElementById(elementId);
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx?.drawImage(img, 0, 0);
    const pngFile = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = pngFile;
    downloadLink.click();
  };

  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
};

const OfficePointCard = ({
  officePoint,
  organizationName,
}: {
  officePoint: OfficePoint;
  organizationName: string;
}) => {
  const deletePoint = useDeleteOfficePoint();
  const regenerateQR = useRegenerateOfficePointQR();
  const [isQROpen, setIsQROpen] = useState(false);

  const qrData: QRData = {
    type: "office_check",
    token: officePoint.qr_token,
    office_name: officePoint.name,
    address: officePoint.address,
    organization: organizationName,
  };

  const qrValue = JSON.stringify(qrData);
  const qrId = `qr-office-${officePoint.id}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{officePoint.name}</CardTitle>
            {officePoint.address && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {officePoint.address}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {officePoint.is_main && <Badge variant="secondary">Главный</Badge>}
            {!officePoint.is_active && <Badge variant="destructive">Неактивен</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                QR-код
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{officePoint.name}</DialogTitle>
                <DialogDescription>
                  QR-код для отметки посещений
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-white p-4 rounded-lg border">
                  <QRCodeSVG
                    id={qrId}
                    value={qrValue}
                    size={250}
                    level="H"
                    includeMargin
                  />
                </div>
                <Button
                  onClick={() => downloadQR(qrId, `qr-${officePoint.name}.png`)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Скачать QR-код
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateQR.mutate(officePoint.id)}
            disabled={regenerateQR.isPending}
          >
            {regenerateQR.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Обновить QR</span>
          </Button>

          {!officePoint.is_main && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить точку?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Все связанные данные будут удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deletePoint.mutate(officePoint.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const OfficePointsList = ({ officePoints, organizationName }: OfficePointsListProps) => {
  return (
    <div className="space-y-4">
      {officePoints.map((point) => (
        <OfficePointCard
          key={point.id}
          officePoint={point}
          organizationName={organizationName}
        />
      ))}
    </div>
  );
};
