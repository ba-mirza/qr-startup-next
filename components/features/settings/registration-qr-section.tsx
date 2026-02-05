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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Clock, XCircle, Loader2 } from "lucide-react";
import {
  useRegistrationQRCodes,
  useCreateRegistrationQR,
  useDeactivateRegistrationQR,
} from "@/hooks/use-settings";
import type { RegistrationQR } from "@/types/registration-qr";

interface RegistrationQRSectionProps {
  organizationId: string;
  organizationName: string;
}

interface QRData {
  type: "employee_registration";
  token: string;
  organization: string;
  expires_at: string;
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isExpired = (expiresAt: string) => {
  return new Date(expiresAt) < new Date();
};

const RegistrationQRCard = ({
  qr,
  organizationName,
  onDeactivate,
  isDeactivating,
}: {
  qr: RegistrationQR;
  organizationName: string;
  onDeactivate: (id: string) => void;
  isDeactivating: boolean;
}) => {
  const [isQROpen, setIsQROpen] = useState(false);
  const expired = isExpired(qr.expires_at);
  const inactive = !qr.is_active || expired;

  const qrData: QRData = {
    type: "employee_registration",
    token: qr.token,
    organization: organizationName,
    expires_at: qr.expires_at,
  };

  const qrValue = JSON.stringify(qrData);
  const qrId = `qr-reg-${qr.id}`;

  return (
    <Card className={inactive ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">До {formatDate(qr.expires_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            {expired && <Badge variant="destructive">Истёк</Badge>}
            {!qr.is_active && !expired && <Badge variant="secondary">Деактивирован</Badge>}
            {qr.is_active && !expired && <Badge variant="default">Активен</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={inactive}>
                QR-код
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR для регистрации сотрудников</DialogTitle>
                <DialogDescription>
                  Действителен до {formatDate(qr.expires_at)}
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
                  onClick={() => downloadQR(qrId, `registration-qr-${qr.id.slice(0, 8)}.png`)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Скачать QR-код
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {qr.is_active && !expired && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeactivate(qr.id)}
              disabled={isDeactivating}
              className="text-destructive"
            >
              {isDeactivating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="ml-2">Деактивировать</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const RegistrationQRSection = ({
  organizationId,
  organizationName,
}: RegistrationQRSectionProps) => {
  const [expiresIn, setExpiresIn] = useState("24");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: qrCodes = [], isLoading } = useRegistrationQRCodes(organizationId);
  const createQR = useCreateRegistrationQR(organizationId);
  const deactivateQR = useDeactivateRegistrationQR();

  const handleCreate = () => {
    createQR.mutate(parseInt(expiresIn), {
      onSuccess: () => {
        setCreateOpen(false);
      },
    });
  };

  const activeQRs = qrCodes.filter((qr) => qr.is_active && !isExpired(qr.expires_at));
  const inactiveQRs = qrCodes.filter((qr) => !qr.is_active || isExpired(qr.expires_at));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">QR-коды регистрации</h3>
          <p className="text-sm text-muted-foreground">
            Временные QR для добавления новых сотрудников
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать QR
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый QR-код регистрации</DialogTitle>
              <DialogDescription>
                Сотрудники смогут зарегистрироваться, отсканировав этот QR
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Срок действия</label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 час</SelectItem>
                    <SelectItem value="6">6 часов</SelectItem>
                    <SelectItem value="24">24 часа</SelectItem>
                    <SelectItem value="72">3 дня</SelectItem>
                    <SelectItem value="168">7 дней</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createQR.error && (
                <p className="text-sm text-destructive text-center">
                  {createQR.error.message}
                </p>
              )}

              <Button
                onClick={handleCreate}
                className="w-full"
                disabled={createQR.isPending}
              >
                {createQR.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : qrCodes.length === 0 ? (
        <p className="text-muted-foreground">Нет созданных QR-кодов</p>
      ) : (
        <div className="space-y-6">
          {activeQRs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Активные</h4>
              {activeQRs.map((qr) => (
                <RegistrationQRCard
                  key={qr.id}
                  qr={qr}
                  organizationName={organizationName}
                  onDeactivate={(id) => deactivateQR.mutate(id)}
                  isDeactivating={deactivateQR.isPending}
                />
              ))}
            </div>
          )}

          {inactiveQRs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Неактивные</h4>
              {inactiveQRs.slice(0, 5).map((qr) => (
                <RegistrationQRCard
                  key={qr.id}
                  qr={qr}
                  organizationName={organizationName}
                  onDeactivate={(id) => deactivateQR.mutate(id)}
                  isDeactivating={deactivateQR.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
