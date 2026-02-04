"use client"

import { Container } from "@/components/container";
import { DashboardHeader } from "@/components/features/dashboard-header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";

const DashboardPage = () => {

  const createOrganization = () => { }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <DashboardHeader />

      <main>
        <TabsContent value="overview">
          <Container>
            <section className="mt-20">
              <h1 className="text-2xl font-bold text-red-600">Создание организации</h1>

              <div className="border-gray-300 border w-full h-auto rounded-lg p-4 bg-gray-50 flex flex-col justify-center mt-2">
                <h2 className="text-red-600 text-xl font-bold">Предупреждение</h2>
                <p className="text-gray-600">You can only create one organization per account.</p>
              </div>

              <div className="mt-10">
                <div className="flex space-x-8 items-center">
                  {
                    Array.from({ length: 2 }).map((_, index) => {
                      const isDisabled = index === 0;

                      return (
                        <button
                          onClick={createOrganization}
                          key={index}
                          disabled={isDisabled}
                          aria-disabled={isDisabled}
                          aria-label={isDisabled ? "Organization creation in progress" : "Create new organization"}
                          className={`
                                flex items-center justify-center
                                border rounded-lg
                                w-80 h-80
                                transition-all
                                ${isDisabled
                              ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                              : 'border-gray-200 hover:bg-red-50 hover:border-red-200 cursor-pointer active:scale-95'
                            }
                              `}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <PlusIcon
                              size={30}
                              className={isDisabled ? 'text-gray-300' : 'text-gray-500'}
                            />
                            <span className={isDisabled ? 'text-gray-400' : 'text-gray-500'}>
                              Create Organization
                            </span>
                            {isDisabled && (
                              <span className="text-xs text-gray-400 mt-1">
                                Please wait...
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  }
                </div>
              </div>
            </section>
          </Container>
        </TabsContent>

        <TabsContent value="employees" className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Таблица сотрудников</h1>
        </TabsContent>

        <TabsContent value="logs" className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Онлайн логи</h1>
        </TabsContent>

        <TabsContent value="settings" className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Настройки</h1>
        </TabsContent>
      </main>
    </Tabs>
  );
}

export default DashboardPage
