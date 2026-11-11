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
} from 'lucide-react-native';

const iconMap: Record<string, any> = {
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
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  size = 20,
  color = '#2563EB',
}) => {
  const IconComponent = iconMap[name] || MoreHorizontal;
  return <IconComponent size={size} color={color} />;
};
