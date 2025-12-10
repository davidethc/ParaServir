import { AppRouter } from "@/Router/AppRouter";
import { AuthInitializer } from "@/shared/infra/guards/AuthInitializer";
import { ErrorBoundary } from "@/shared/components/error/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </ErrorBoundary>
  );
}

export default App;
