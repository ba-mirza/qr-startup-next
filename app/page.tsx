import { Container } from "@/components/container";
import { Header } from "@/components/header";

export default function RootPage() {
  return (<>
    <Header />
    <Container className="pt-32">
      <main>

        <h1 className="text-4xl font-bold mb-6">Тест Хедера</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Начни скроллить вниз, чтобы увидеть эффект блюра и тени на хедере.
        </p>

        <div className="h-[200vh] w-full border-l-2 border-dashed border-gray-300 pl-4">
          <p>Здесь длинный контент...</p>
          <p className="mt-[50vh]">Середина страницы...</p>
          <p className="mt-[50vh]">Конец страницы.</p>
        </div>

      </main>
    </Container>
  </>
  );
}
