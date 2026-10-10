import {
  Apple,
  Beef,
  Carrot,
  Egg,
  Fish,
  Leaf,
  Package,
  Salad,
  Sprout,
  Wheat,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Wheat,
  Carrot,
  Apple,
  Salad,
  Beef,
  Fish,
  Egg,
  Sprout,
  Leaf,
};

export function CategoryIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && ICONS[name]) || Package;
  return <Icon className={className} />;
}
