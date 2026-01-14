import { AppRouter } from "@/Router/AppRouter";
import { AuthInitializer } from "@/shared/infra/guards/AuthInitializer";
import { ErrorBoundary } from "@/shared/components/error/ErrorBoundary";
import { WhatsAppFloatButton } from "@/shared/components/layout/WhatsAppFloatButton";

function App() {
  return (
    <ErrorBoundary>
      <AuthInitializer>
        <AppRouter />
        <WhatsAppFloatButton />
      </AuthInitializer>
    </ErrorBoundary>
  );
}

export default App;
