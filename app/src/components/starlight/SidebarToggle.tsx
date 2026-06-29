import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const STORAGE_KEY = "fa-ui-sidebar-collapsed";

export default function SidebarToggle() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) === "true";
    setCollapsed(saved);
    document.documentElement.dataset.sidebarCollapsed = String(saved);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.dataset.sidebarCollapsed = String(next);
    window.localStorage.setItem(STORAGE_KEY, String(next));
  };

  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const label = collapsed ? "Show sidebar" : "Hide sidebar";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="fa-sidebar-toggle"
      data-collapsed={collapsed}
      onClick={toggle}
    >
      <Icon className="size-4" />
    </button>
  );
}
