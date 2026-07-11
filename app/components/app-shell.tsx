"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Planner" },
  { href: "/scenarios", label: "Scenarios" },
];

export default function AppShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label="Open navigation"
        className="menu-button"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <aside className="sidebar" aria-label="Primary navigation">
        <Navigation pathname={pathname} userEmail={userEmail} />
      </aside>

      <button
        aria-label="Close navigation overlay"
        className={`drawer-backdrop ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        type="button"
      />
      <aside
        aria-label="Mobile navigation"
        className={`drawer ${open ? "is-open" : ""}`}
        id="mobile-navigation"
      >
        <button
          aria-label="Close navigation"
          className="drawer-close"
          onClick={() => setOpen(false)}
          type="button"
        >
          x
        </button>
        <Navigation pathname={pathname} userEmail={userEmail} />
      </aside>

      <main className="app-content">{children}</main>
    </div>
  );
}

function Navigation({
  pathname,
  userEmail,
}: {
  pathname: string;
  userEmail: string;
}) {
  return (
    <div className="nav-inner">
      <div>
        <p className="nav-kicker">Funnel Planner</p>
        <h2>Scenario Workspace</h2>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="nav-account">
        <span>{userEmail}</span>
        <form action="/api/auth/logout" method="post">
          <button className="button secondary" type="submit">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
