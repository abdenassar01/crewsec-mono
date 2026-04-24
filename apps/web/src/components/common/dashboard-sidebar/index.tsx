import {
  CarParking01FreeIcons,
  DashboardSquare01FreeIcons,
  UserGroupFreeIcons,
  Car03FreeIcons,
  File01FreeIcons,
  AlertCircleFreeIcons,
  CancelSquareFreeIcons,
  Settings05FreeIcons,
  ChartHistogramFreeIcons,
  Building03FreeIcons,
} from "@hugeicons/core-free-icons";
import { SidebarLink } from "./sidebar-link";
import { useSafeQuery } from "@/lib/hooks";
import { api } from "@convex/_generated/api";

export const sidebarLinks = [
  { href: "/" as const, label: "Dashboard", icon: DashboardSquare01FreeIcons },
  { href: "/statistics" as const, label: "Statistics", icon: ChartHistogramFreeIcons },
  { href: "/users" as const, label: "Users", icon: UserGroupFreeIcons },
  { href: "/parkings" as const, label: "Parkings", icon: CarParking01FreeIcons },
  { href: "/vehicles" as const, label: "Vehicles", icon: Car03FreeIcons },
  { href: "/control-fees" as const, label: "Control Fees", icon: File01FreeIcons },
  { href: "/felparkering" as const, label: "Felparkering", icon: AlertCircleFreeIcons },
  { href: "/makuleras" as const, label: "Makuleras", icon: CancelSquareFreeIcons },
  { href: "/static-data" as const, label: "Static Data", icon: Settings05FreeIcons },
] as const;

export const superAdminLinks = [
  { href: "/organizations" as const, label: "Organizations", icon: Building03FreeIcons },
];

export  function DashboardSidebar() {
  const user = useSafeQuery(api.users.getCurrentUserProfile);

  if (user?.role === 'CLIENT') {
    return null;
  }

  return (
    <>
      {user?.role === 'SUPER_ADMIN' && (
        <>
          {superAdminLinks.map((link) => (
            <SidebarLink key={link.href} {...link} />
          ))}
          <div className="my-2 border-t border-sidebar-border" />
        </>
      )}
      {sidebarLinks.map((link) => (
        <SidebarLink key={link.href} {...link} />
      ))}
    </>);
}