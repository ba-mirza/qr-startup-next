"use client";

import { useParams } from "next/navigation";
import { Container } from "@/components/container";
import { DashboardHeader } from "@/components/features/dashboard-header";
import { DashboardHeaderSimple } from "@/components/features/dashboard-header-simple";
import { OfficePointQR } from "@/components/features/organization";
import {
  OfficePointsList,
  AddOfficePointDialog,
  RegistrationQRSection,
  OrganizationSettingsSection,
} from "@/components/features/settings";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useOrganizationBySlug } from "@/hooks/use-organization";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, ClipboardCheck } from "lucide-react";

const OrgDashboardSkeleton = () => (
  <Container>
    <div className="mt-10 pt-16 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </Container>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <h3 className="font-semibold text-gray-700">{title}</h3>
    </div>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const OrgDashboardPage = () => {
  const params = useParams();
  const slug = params.orgSlug as string;
  const { data: organization, isLoading, error } = useOrganizationBySlug(slug);

  if (isLoading) {
    return (
      <>
        <DashboardHeaderSimple />
        <OrgDashboardSkeleton />
      </>
    );
  }

  if (error || !organization) {
    return (
      <>
        <DashboardHeaderSimple />
        <Container>
          <div className="mt-10 pt-16">
            <h1 className="text-2xl font-bold text-red-600">
              Организация не найдена
            </h1>
            <p className="text-gray-600 mt-2">
              Проверьте правильность ссылки или вернитесь на главную.
            </p>
          </div>
        </Container>
      </>
    );
  }

  const mainOffice = organization.office_points?.find((op) => op.is_main);
  const officePointsCount = organization.office_points?.length || 0;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <DashboardHeader organizationName={organization.name} />

      <main>
        <TabsContent value="overview">
          <Container>
            <section className="mt-10 pt-16">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-red-600">
                    {organization.name}
                  </h1>
                  <p className="text-gray-600 mt-1">БИН: {organization.bin}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <StatCard title="Сотрудники" value={0} icon={Users} />
                <StatCard title="Офисные точки" value={officePointsCount} icon={MapPin} />
                <StatCard title="Отметок сегодня" value={0} icon={ClipboardCheck} />
              </div>

              {mainOffice && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">
                    QR-код главного офиса
                  </h2>
                  <OfficePointQR
                    officePoint={mainOffice}
                    organizationName={organization.name}
                  />
                </div>
              )}
            </section>
          </Container>
        </TabsContent>

        <TabsContent value="employees">
          <Container>
            <section className="mt-10 pt-16">
              <h1 className="text-2xl font-bold mb-4">Таблица сотрудников</h1>
              <p className="text-gray-600">
                Здесь будет таблица сотрудников организации.
              </p>
            </section>
          </Container>
        </TabsContent>

        <TabsContent value="logs">
          <Container>
            <section className="mt-10 pt-16">
              <h1 className="text-2xl font-bold mb-4">Онлайн логи</h1>
              <p className="text-gray-600">
                Здесь будут отображаться логи посещений в реальном времени.
              </p>
            </section>
          </Container>
        </TabsContent>

        <TabsContent value="settings">
          <Container>
            <section className="mt-10 pt-16 space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">Настройки</h1>
                <p className="text-muted-foreground">
                  Управление офисными точками, QR-кодами и настройками организации
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Офисные точки</h2>
                    <p className="text-sm text-muted-foreground">
                      Точки для отметки посещений сотрудников
                    </p>
                  </div>
                  <AddOfficePointDialog organizationId={organization.id} />
                </div>
                {organization.office_points && organization.office_points.length > 0 ? (
                  <OfficePointsList
                    officePoints={organization.office_points}
                    organizationName={organization.name}
                  />
                ) : (
                  <p className="text-muted-foreground">Нет офисных точек</p>
                )}
              </div>

              <Separator />

              <RegistrationQRSection
                organizationId={organization.id}
                organizationName={organization.name}
              />

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">Настройки организации</h2>
                <OrganizationSettingsSection
                  organizationId={organization.id}
                  settings={organization.settings}
                />
              </div>
            </section>
          </Container>
        </TabsContent>
      </main>
    </Tabs>
  );
};

export default OrgDashboardPage;
