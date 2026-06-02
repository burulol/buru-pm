import BigLock from "./BigLock";
import { Link, useLocation } from "react-router-dom";
import { User, Lock } from "lucide-react";

const pages = [
  { name: "Vault", href: "/vault", icon: Lock },
  { name: "Account", href: "/account", icon: User },
];

export default function Layout({ header, children }) {
  return (
    <>
      <div className="fixed h-screen w-64 bg-black border-r border-fuchsia-800/50">
        <div className="mb-8 border-b border-fuchsia-800/50">
          <BigLock strokeWidth={0.2} className="mx-auto w-40 py-4" />
        </div>
        <nav className="p-4 space-y-2">
          {pages.map((page) => (
            <NavLink key={page.href} {...page} />
          ))}
        </nav>
      </div>
      <div className="pl-64 h-screen w-full">
        <div className="fixed bg-black w-[calc(100vw-16rem)] h-40 border-b border-fuchsia-800/50 p-6">
          {header}
        </div>
        <div className="p-6 space-y-4 pt-46">{children}</div>
      </div>
    </>
  );
}

function NavLink({ name, href, icon: Icon }) {
  const location = useLocation();
  const isActive = location.pathname === href;
  return (
    <Link
      to={href}
      className={`w-full flex items-center gap-3 px-5 py-3
      rounded-lg transition-colors font-semibold ${
        isActive
          ? "bg-fuchsia-600 text-black"
          : "text-gray-300 hover:bg-fuchsia-900/20 hover:text-fuchsia-400"
      }`}
      disabled={isActive}
    >
      <Icon className="w-5 h-5" />
      {name}
    </Link>
  );
}
