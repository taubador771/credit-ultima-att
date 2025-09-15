import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar 
} from "@/components/ui/sidebar";
import { ConfigurationsModal } from "@/components/ConfigurationsModal";
import { EmpresaForm } from "@/components/EmpresaForm";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home,
  BarChart3, 
  FileText, 
  Settings, 
  Calculator,
  TrendingUp,
  HelpCircle,
  Building2
} from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

interface AppSidebarProps {
  formData: FormData;
  onDataChange: (data: FormData) => void;
}

export function AppSidebar({ formData, onDataChange }: AppSidebarProps) {
  const { open } = useSidebar();
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      path: "/",
      description: "Visão geral dos resultados"
    },
    {
      title: "Documentos",
      icon: FileText,
      path: "/documentos",
      description: "Propostas e contratos"
    }
  ];

  const configItems = [
    {
      title: "Relatórios",
      icon: BarChart3,
      path: "/relatorios",
      description: "Análises detalhadas"
    },
    {
      title: "Ajuda",
      icon: HelpCircle,
      path: "/ajuda",
      description: "Suporte e tutoriais"
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          {open && (
            <div>
              <h2 className="font-semibold text-lg">Unique</h2>
              <p className="text-sm text-muted-foreground">Economia Tributária</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* Dados da Empresa - Seção Principal */}
        {open && (
          <div className="mb-6">
            <EmpresaForm 
              formData={formData} 
              onDataChange={onDataChange}
              compact={true}
            />
          </div>
        )}

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold mb-3">
            <TrendingUp className="h-4 w-4" />
            {open && "Menu Principal"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path}
                      className={({ isActive: linkActive }) => 
                        `w-full flex items-center gap-3 ${
                          linkActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && (
                        <div className="flex flex-col items-start">
                          <span>{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configurações */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold mb-3">
            <Settings className="h-4 w-4" />
            {open && "Configurações"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <ConfigurationsModal 
                  formData={formData} 
                  onDataChange={onDataChange}
                  trigger={
                    <SidebarMenuButton className="w-full hover:bg-muted/50">
                      <Settings className="h-4 w-4" />
                      {open && (
                        <div className="flex flex-col items-start">
                          <span>Configurações Avançadas</span>
                          <span className="text-xs text-muted-foreground">IA, Visual, Sistema</span>
                        </div>
                      )}
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
              
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path}
                      className={({ isActive: linkActive }) => 
                        `w-full flex items-center gap-3 ${
                          linkActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && (
                        <div className="flex flex-col items-start">
                          <span>{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status da Configuração */}
        {open && (
          <div className="mt-6">
            {formData.nomeEmpresa ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Empresa Configurada</span>
                </div>
                <p className="text-xs text-green-600 font-medium">
                  {formData.nomeEmpresa}
                </p>
                <p className="text-xs text-green-600">
                  {formData.tributos.length} tributos • {formData.periodo} meses
                </p>
                <p className="text-xs text-green-600">
                  R$ {formData.valorMensal.toLocaleString('pt-BR')} mensais
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-amber-700">Configuração Pendente</span>
                </div>
                <p className="text-xs text-amber-600">
                  Configure os dados da empresa acima para começar
                </p>
              </div>
            )}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}