import React, { Component, type ReactNode } from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar errores de renderizado en React
 * Muestra un mensaje amigable en lugar de una pantalla en blanco
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <PageContainer>
          <EmptyState
            title="Algo salió mal"
            description={
              this.state.error?.message ||
              "Ocurrió un error inesperado. Por favor, recarga la página."
            }
            action={{
              label: "Recargar página",
              onClick: () => window.location.reload(),
            }}
          />
        </PageContainer>
      );
    }

    return this.props.children;
  }
}
