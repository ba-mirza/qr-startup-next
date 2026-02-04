"use client";

import { useParams } from "next/navigation";
import { Container } from "@/components/container";
import { DashboardHeader } from "@/components/features/dashboard-header";
import { DashboardHeaderSimple } from "@/components/features/dashboard-header-simple";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useOrganizationBySlug } from "@/hooks/use-organization";
import { Skeleton } from "@/components/ui/skeleton";

const OrgDashboardSkeleton = () => (
  <Container>
    <div className="mt-20 pt-16 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </Container>
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
          <div className="mt-20 pt-16">
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

  return (
    <Tabs defaultValue="overview" className="w-full">
      <DashboardHeader organizationName={organization.name} />

      <main>
        <TabsContent value="overview">
          <Container>
            <section className="mt-20 pt-16">
              <h1 className="text-2xl font-bold text-red-600">
                {organization.name}
              </h1>
              <p className="text-gray-600 mt-1">БИН: {organization.bin}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700">Сотрудники</h3>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700">Офисные точки</h3>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700">
                    Отметок сегодня
                  </h3>
                  <p className="text-3xl font-bold mt-2">0</p>
                </div>
              </div>
            </section>
          </Container>
        </TabsContent>

        <TabsContent value="employees">
          <Container>
            <section className="mt-20 pt-16">
              <h1 className="text-2xl font-bold mb-4">Таблица сотрудников</h1>
              <p className="text-gray-600">
                Здесь будет таблица сотрудников организации.
              </p>
            </section>
          </Container>
        </TabsContent>

        <TabsContent value="logs">
          <Container>
            <section className="mt-20 pt-16">
              <h1 className="text-2xl font-bold mb-4">Онлайн логи</h1>
              <p className="text-gray-600">
                Здесь будут отображаться логи посещений в реальном времени.
              </p>
            </section>
          </Container>
        </TabsContent>

        <TabsContent value="settings">
          <Container>
            <section className="mt-20 pt-16">
              <h1 className="text-2xl font-bold mb-4">Настройки</h1>
              <p className="text-gray-600">
                Настройки организации и системы.
              </p>
            </section>
          </Container>
        </TabsContent>
      </main>
    </Tabs>
  );
};

export default OrgDashboardPage;
