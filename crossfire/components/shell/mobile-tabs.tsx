import Link from "next/link";
import { HomeIcon, ClassesIcon } from "@/components/ui/icons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon, current: true },
  { href: "/c", label: "Classes", Icon: ClassesIcon, current: false },
] as const;

/** The same set the sidebar resolves to — the sidebar just has room to
 *  enumerate classes where this collapses them into one tab. */
export default function MobileTabs() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] nav:hidden"
    >
      <ul className="grid grid-cols-2 px-2 py-1.5">
        {TABS.map(({ href, label, Icon, current }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-bold ${
                current ? "bg-accent-soft text-accent-ink" : "text-muted"
              }`}
            >
              <Icon className="size-[19px]" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
