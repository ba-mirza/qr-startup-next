"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2, Save, MapPin, Clock } from "lucide-react";
import { useUpdateOrganizationSettings } from "@/hooks/use-settings";
import type { OrganizationSettings } from "@/types/organization";

interface OrganizationSettingsSectionProps {
  organizationId: string;
  settings: OrganizationSettings;
}

export const OrganizationSettingsSection = ({
  organizationId,
  settings: initialSettings,
}: OrganizationSettingsSectionProps) => {
  const [settings, setSettings] = useState<OrganizationSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const updateSettings = useUpdateOrganizationSettings(organizationId);

  useEffect(() => {
    const changed =
      settings.geolocation_required !== initialSettings.geolocation_required ||
      settings.geolocation_radius !== initialSettings.geolocation_radius ||
      settings.auto_close_day !== initialSettings.auto_close_day;
    setHasChanges(changed);
  }, [settings, initialSettings]);

  const handleSave = () => {
    updateSettings.mutate(settings, {
      onSuccess: () => {
        setHasChanges(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Геолокация
          </CardTitle>
          <CardDescription>
            Настройки проверки местоположения при отметке
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Требовать геолокацию</Label>
              <p className="text-sm text-muted-foreground">
                Сотрудники должны находиться в зоне офиса для отметки
              </p>
            </div>
            <Switch
              checked={settings.geolocation_required}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, geolocation_required: checked }))
              }
            />
          </div>

          {settings.geolocation_required && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Радиус проверки</Label>
                <span className="text-sm font-medium">{settings.geolocation_radius} м</span>
              </div>
              <Slider
                value={[settings.geolocation_radius]}
                onValueChange={([value]) =>
                  setSettings((s) => ({ ...s, geolocation_radius: value }))
                }
                min={10}
                max={500}
                step={10}
              />
              <p className="text-xs text-muted-foreground">
                Сотрудник должен быть в радиусе {settings.geolocation_radius} метров от офиса
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Автоматизация
          </CardTitle>
          <CardDescription>
            Автоматические действия системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Автозакрытие дня</Label>
              <p className="text-sm text-muted-foreground">
                Автоматически закрывать незавершённые смены в конце дня
              </p>
            </div>
            <Switch
              checked={settings.auto_close_day}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, auto_close_day: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Сохранить изменения
          </Button>
        </div>
      )}

      {updateSettings.error && (
        <p className="text-sm text-destructive text-center">
          {updateSettings.error.message}
        </p>
      )}
    </div>
  );
};
