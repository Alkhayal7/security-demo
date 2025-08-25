"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKeyboardNavigation, useAnnouncer } from "@/lib/accessibility-utils";
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Play,
  TestTube,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Security overview and KPIs",
  },
  {
    name: "Security Map",
    href: "/map",
    icon: MapPin,
    description: "Interactive site security map",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    description: "Security audit reports",
  },
  {
    name: "Demo Center",
    href: "/demo",
    icon: Play,
    description: "Automated presentation demos",
  },
  {
    name: "Testing",
    href: "/testing",
    icon: TestTube,
    description: "End-to-end workflow testing",
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { announce } = useAnnouncer();

  const toggleCollapsed = useCallback(() => {
    const newState = !collapsed;
    setCollapsed(newState);
    announce(
      newState ? 'Sidebar collapsed' : 'Sidebar expanded',
      'polite'
    );
  }, [collapsed, announce]);

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-80",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Security Auditor</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-4 overflow-x-hidden">
        <nav 
          ref={navRef}
          className="space-y-2 pr-2"
          role="list"
          aria-label="Navigation menu"
        >
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? `${item.name}: ${item.description}` : undefined}
                aria-label={collapsed ? `${item.name}: ${item.description}` : undefined}
                aria-current={isActive ? "page" : undefined}
                role="listitem"
              >
                <item.icon 
                  className={cn("h-4 w-4", !collapsed && "mr-3")} 
                  aria-hidden="true"
                />
                {!collapsed && (
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Security Status Indicator */}
      {!collapsed && (
        <div 
          className="p-4 border-t"
          role="status"
          aria-label="Security status summary"
        >
          <div className="flex items-center space-x-2 text-sm">
            <AlertTriangle 
              className="h-4 w-4 text-yellow-500" 
              aria-hidden="true"
            />
            <span className="text-muted-foreground">3 Sites at Risk</span>
          </div>
        </div>
      )}
    </div>
  );
}
