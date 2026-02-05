"use client";

import { Container } from "@/components/container";
import { DashboardHeaderSimple } from "@/components/features/dashboard-header-simple";
import { OrganizationCard, CreateOrganizationDialog } from "@/components/features/organization";
import { useUserOrganization } from "@/hooks/use-organization";
import { Skeleton } from "@/components/ui/skeleton";

const OrganizationsSkeleton = () => (
  <div className="flex space-x-8 items-center">
    <Skeleton className="w-80 h-80 rounded-lg" />
    <Skeleton className="w-80 h-80 rounded-lg" />
  </div>
);

const NewOrganizationPage = () => {
  const { data: organization, isLoading } = useUserOrganization();

  const hasOrganization = !!organization;
  const canCreateMore = !hasOrganization;

  return (
    <>
      <DashboardHeaderSimple />
      <Container>
        <section className="mt-10 pt-16">
          <h1 className="text-2xl font-bold text-red-600">Мои организации</h1>

          <div className="border-gray-300 border w-full h-auto rounded-lg p-4 bg-gray-50 flex flex-col justify-center mt-2">
            <h2 className="text-red-600 text-xl font-bold">Информация</h2>
            <p className="text-gray-600">
              Вы можете создать только одну организацию на аккаунт.
            </p>
          </div>

          <div className="mt-10">
            {isLoading ? (
              <OrganizationsSkeleton />
            ) : (
              <div className="flex flex-wrap gap-8 items-center">
                {organization && (
                  <OrganizationCard organization={organization} />
                )}
                <CreateOrganizationDialog disabled={!canCreateMore} />
              </div>
            )}
          </div>
        </section>
      </Container>
    </>
  );
};

export default NewOrganizationPage;
