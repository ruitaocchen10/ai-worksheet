import Sidebar from "@/components/shell/sidebar";
import MobileTabs from "@/components/shell/mobile-tabs";
import ActionBand from "@/components/home/action-band";
import SourceComposer from "@/components/home/source-composer";
import Rail from "@/components/reasoning/rail";

/**
 * Home is not a hub you choose a mode from — it's the surface you start
 * arguing on. Assigned work is a strip near the top rather than the page,
 * because a home screen that's a list of assignments is a homework portal,
 * and study mode dies next to it.
 */
export default function Home() {
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col rail:flex-row">
        <main id="main" className="min-w-0 flex-1 px-4 pt-5 nav:px-6 nav:pt-7">
          {/* Mobile-only header — the sidebar carries this on desktop. */}
          <header className="mb-5 flex items-center justify-between nav:hidden">
            <span className="flex items-center gap-2 font-display text-[19px] font-extrabold">
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-ink text-[15px] text-white"
              >
                C
              </span>
              Crossfire
            </span>
            <span className="rounded-full bg-rose px-3.5 py-1.5 font-display text-[13px] font-extrabold tabular-nums text-ink">
              4 days
            </span>
          </header>

          <div className="w-full">
            <ActionBand />
            <SourceComposer />
          </div>
        </main>

        {/* Below 1200 the rail stops being a column and becomes the last
            block in the flow, so nothing is lost — only re-stacked. It owns
            the clearance for the fixed tab bar because it ends the page. */}
        <Rail className="w-full pb-28 nav:pb-8 rail:w-[318px] rail:shrink-0" />
      </div>

      <MobileTabs />
    </div>
  );
}
