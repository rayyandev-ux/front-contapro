"use client";
import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  Files,
  FolderClosed,
  HelpCircle,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from "lucide-react";

function NavItem({ href, label, icon: Icon, active = false }: { href: string; label: string; icon: any; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 border-r bg-white flex flex-col">
      <div className="h-14 flex items-center px-4 font-semibold">ContaPRO</div>
      <div className="px-2 space-y-2">
        <NavItem href="#" label="Quick Create" icon={BadgeCheck} active />
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
        <NavItem href="#" label="Lifecycle" icon={Boxes} />
        <NavItem href="#" label="Analytics" icon={BarChart3} />
        <NavItem href="#" label="Projects" icon={FolderClosed} />
        <NavItem href="#" label="Team" icon={Users} />
      </div>
      <div className="mt-6 px-4 text-xs font-medium text-gray-500">Documents</div>
      <div className="px-2 space-y-2 mt-2">
        <NavItem href="#" label="Data Library" icon={BookOpen} />
        <NavItem href="#" label="Reports" icon={Files} />
        <NavItem href="#" label="Word Assistant" icon={Search} />
        <NavItem href="#" label="More" icon={FolderClosed} />
      </div>
      <div className="mt-auto px-2 space-y-2 mb-3">
        <NavItem href="#" label="Settings" icon={Settings} />
        <NavItem href="#" label="Get Help" icon={HelpCircle} />
        <NavItem href="#" label="Search" icon={Search} />
      </div>
    </aside>
  );
}