import React from 'react';
import {
  Utensils,
  Car,
  Home,
  HeartPulse,
  Gamepad2,
  ShoppingCart,
  FileText,
  MoreHorizontal,
  Coffee,
  Film,
  Plane,
  Fuel,
  Smartphone,
  Wifi,
  GraduationCap,
  Gift,
  CreditCard,
  Briefcase,
  LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  Utensils,
  Car,
  Home,
  HeartPulse,
  Gamepad2,
  ShoppingCart,
  FileText,
  MoreHorizontal,
  Coffee,
  Film,
  Plane,
  Fuel,
  Smartphone,
  Wifi,
  GraduationCap,
  Gift,
  CreditCard,
  Briefcase,
};

interface CategoryIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  size = 20,
  className = '',
  color,
}) => {
  const IconComponent = iconMap[name] || MoreHorizontal;
  return <IconComponent size={size} className={className} color={color} />;
};
