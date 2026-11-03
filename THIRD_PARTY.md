# Akari directory navigation

The TOC, MobileTOC, MobileTocButton, FabContainer and Marquee components are
copied from https://github.com/OasisAkari/vitepress-theme-akari at commit
66314ed0509b2338c5161d4e64f4c031046b4c99, under the MIT license (see LICENSE).
Their templates, CSS and GSAP animations are preserved.

Integration changes: resolve imports against the existing theme and MDUI package;
use this version's `.layout-main` scroll container instead of window scrolling;
connect notice visibility and TOC indexing through `toc-state.ts`; position the
existing back-to-top button within the upstream FabContainer. ArticleTOC.vue is
the integration layer. No unrelated upstream theme features are imported.

The ClickToTop component is also copied from the same upstream revision, with
window scrolling adapted to .layout-main, cancellation/unmount cleanup, and an
accessible button label. It uses upstream's extended FAB while scrolling; no tooltip.
