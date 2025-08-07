import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface ResponsiveTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function ResponsiveTabs({ tabs, defaultValue, className }: ResponsiveTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("w-full", className)}>
        {/* Mobile Select Dropdown */}
        <div className="mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {tabs.find(tab => tab.value === activeTab)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabs.map(tab => (
                <SelectItem key={tab.value} value={tab.value}>
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    {tab.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Content */}
        <div className="animate-fade-in">
          {tabs.find(tab => tab.value === activeTab)?.content}
        </div>
      </div>
    );
  }

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 h-auto p-1">
        {tabs.map(tab => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="flex items-center gap-2 py-2"
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}