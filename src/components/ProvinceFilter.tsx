import { Province, ALL_PROVINCES } from "@/data/schools";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type ProvinceOption = Province | 'all';

interface ProvinceFilterProps {
  selected: ProvinceOption;
  onSelect: (province: ProvinceOption) => void;
  counts: Record<ProvinceOption, number>;
}

const provinceConfig: { value: ProvinceOption; label: string; colorClass: string }[] = [
  { value: 'all', label: 'All', colorClass: 'bg-foreground' },
  { value: 'Gauteng', label: 'Gauteng', colorClass: 'bg-province-gauteng' },
  { value: 'Western Cape', label: 'W. Cape', colorClass: 'bg-province-western-cape' },
  { value: 'Eastern Cape', label: 'E. Cape', colorClass: 'bg-province-eastern-cape' },
  { value: 'KwaZulu-Natal', label: 'KZN', colorClass: 'bg-amber-500' },
  { value: 'Limpopo', label: 'Limpopo', colorClass: 'bg-emerald-600' },
  { value: 'Mpumalanga', label: 'Mpuma.', colorClass: 'bg-cyan-500' },
  { value: 'North West', label: 'N. West', colorClass: 'bg-violet-500' },
  { value: 'Northern Cape', label: 'N. Cape', colorClass: 'bg-rose-500' },
  { value: 'Free State', label: 'Free St.', colorClass: 'bg-lime-500' },
  { value: 'Special Needs', label: 'Special', colorClass: 'bg-indigo-400' },
];

export function ProvinceFilter({ selected, onSelect, counts }: ProvinceFilterProps) {
  return (
    <ScrollArea className="w-full max-w-full">
      <div className="flex gap-1.5 pb-2">
        {provinceConfig.map((province) => (
          <Button
            key={province.value}
            variant={selected === province.value ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(province.value)}
            className={cn(
              "gap-1.5 transition-all shrink-0 text-xs px-2.5",
              selected === province.value && "shadow-md"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full shrink-0",
                province.colorClass
              )}
            />
            {province.label}
            <span className="text-[10px] opacity-70">
              ({counts[province.value] || 0})
            </span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
