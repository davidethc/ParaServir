import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Search } from "lucide-react";
import { CategoriesSection } from "@/shared/components/sections/CategoriesSection";

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica de búsqueda
    console.log("Búsqueda:", searchQuery, "Categoría:", category);
  };

  const popularSearches = ["Diseñador Gráfico", "UI/UX", "Desarrollador Web"];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-blue-600">ParaServir</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
            >
              Inicio
            </Link>
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
              Trabajos
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              Acerca de
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-600 transition-colors">
              Servicios
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-blue-600 transition-colors">
              Blog
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contacto
            </Link>
          </div>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 shadow-lg border border-gray-200 bg-white">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Encuentra tu Trabajo Ideal
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre tu próximo paso profesional con ParaServir, el marketplace de servicios
                para trabajadores y empleadores.
              </p>
            </div>

            {/* Search Interface */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="¿Qué trabajo estás buscando?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full md:w-64 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                    <SelectValue placeholder="Seleccionar Categoría" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border-gray-200 shadow-xl">
                    <SelectItem value="diseño">Diseño</SelectItem>
                    <SelectItem value="desarrollo">Desarrollo</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="ventas">Ventas</SelectItem>
                    <SelectItem value="administracion">Administración</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Buscar
                </Button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">Búsquedas Populares:</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(search)}
                    className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm font-medium transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 ParaServir. Todos los derechos reservados.</p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="#" className="hover:text-blue-600 transition-colors">
                Términos y Condiciones
              </Link>
              <span>·</span>
              <Link to="#" className="hover:text-blue-600 transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

