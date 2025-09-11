import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  variant?: "default" | "success" | "warning";
}

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  trend = "neutral", 
  icon,
  variant = "default" 
}: KPICardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-gradient-success shadow-success border-success/20";
      case "warning":
        return "bg-gradient-to-br from-warning to-warning/80 shadow-lg border-warning/20";
      default:
        return "bg-gradient-primary shadow-primary border-primary/20";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getDefaultIcon = () => {
    if (icon) return icon;
    if (value.includes("%")) return <Percent className="h-5 w-5" />;
    return <DollarSign className="h-5 w-5" />;
  };

  return (
    <Card className={`transition-smooth hover:scale-105 ${getVariantStyles()}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white/80 text-sm font-medium">
            {title}
          </div>
          <div className="text-white/80">
            {getDefaultIcon()}
          </div>
        </div>
        
        <div className="text-white text-2xl font-bold mb-1">
          {value}
        </div>
        
        {subtitle && (
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-white/70 text-sm">
              {subtitle}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;