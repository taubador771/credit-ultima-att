import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  formData: FormData;
  onDataChange: (data: FormData) => void;
}

const DashboardLayout = ({ children, formData, onDataChange }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar formData={formData} onDataChange={onDataChange} />
        
        <div className="flex-1 flex flex-col">
          {/* Header com trigger sempre visível */}
          <header className="bg-background/80 backdrop-blur-sm border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
            <SidebarTrigger className="hover:bg-muted p-2 rounded-lg transition-colors">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <span className="text-white font-bold text-sm">💼</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Dashboard de Economia Tributária
                </h1>
                <p className="text-sm text-muted-foreground">
                  Unique Assessoria Empresarial
                </p>
              </div>
            </div>
          </header>

          {/* Conteúdo principal */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;