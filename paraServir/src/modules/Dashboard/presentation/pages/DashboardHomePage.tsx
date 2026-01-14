import { useNavigate } from "react-router-dom";
import { ROUTES, buildRoute } from "@/shared/constants/routes.constants";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { useCategories } from "@/shared/hooks/useCategories";
import { Sparkles, Search, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { CategoryCard } from "@/shared/components/cards/CategoryCard";
import { ServiceCard } from "@/shared/components/cards/ServiceCard";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";

export function DashboardHomePage() {
  const navigate = useNavigate();
  const { categories, loading: loadingCategories } = useCategories();

  const handleSearch = (query: string, categoryId?: string) => {
    // Si se seleccionó una categoría, navegar a la página de detalle de esa categoría
    if (categoryId) {
      navigate(buildRoute.categoryDetail(categoryId));
      return;
    }
    // Si solo hay búsqueda de texto, redirigir a la página de trabajadores con el query
    if (query) {
      navigate(`/workers?search=${encodeURIComponent(query)}`);
    } else {
      // Si no hay query, ir a la página de trabajadores
      navigate("/workers");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent-soft/50 to-background border-b border-border">
        <PageContainer className="relative py-12 md:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="h-4 w-4" />
              <span>Marketplace de servicios profesionales</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
              Encuentra el profesional
              <span className="block text-primary mt-2">
                perfecto para tu proyecto
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
              Conecta con expertos calificados, compara precios y contrata servicios de calidad con total confianza.
            </p>

            <div className="max-w-2xl mx-auto mt-8 p-2 bg-card rounded-2xl shadow-lg border border-border animate-in fade-in slide-in-from-bottom-7 duration-500 delay-300">
              <form onSubmit={(e) => { e.preventDefault(); const input = e.currentTarget.querySelector('input'); if (input) handleSearch(input.value); }} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="¿Qué servicio estás buscando?" 
                    className="pl-10 h-12 border-transparent bg-secondary/50 focus:bg-background focus:border-primary/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8">
                  Buscar
                </Button>
              </form>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-12 space-y-12">
        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Categorías Populares</h2>
              <p className="text-muted-foreground">Explora los servicios más solicitados</p>
            </div>
            <Button 
              variant="ghost" 
              className="gap-2 text-primary hover:text-primary-hover"
              onClick={() => navigate(ROUTES.DASHBOARD.CATEGORIES)}
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-secondary animate-pulse rounded-xl border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories?.slice(0, 4).map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleSearch("", category.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Featured Services */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Servicios Destacados</h2>
              <p className="text-muted-foreground">Los mejores profesionales a tu disposición</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mock data for preview */}
            {[1, 2, 3].map((i) => {
              const workerName = i === 1 ? "Ana García" : i === 2 ? "Carlos Méndez" : "Laura Torres";
              return (
                <ServiceCard
                  key={i}
                  id={`srv-${i}`}
                  title="Diseño de Identidad Visual Corporativa"
                  description="Creo logotipos y guías de estilo para marcas modernas que buscan destacar."
                  basePrice={150 + i * 50}
                  isAvailable={true}
                  rating={4.8}
                  reviewCount={24}
                  workerName={workerName}
                  workerId={`worker-${i}`}
                  workerAvatar={getWorkerAvatar(`worker-${i}`, undefined, workerName.split(" ")[0], workerName.split(" ")[1])}
                  categoryName="Diseño"
                />
              );
            })}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
