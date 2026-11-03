// TOC state and DOM indexing adapted from OasisAkari/vitepress-theme-akari (MIT).
import { defineStore } from 'pinia'
import { computed, nextTick } from 'vue'
import { useThemeGlobalStore as useLayoutStore } from './global'
export type TocItem = { title: string; slug: string; level: number; link: string }
const debounceTimers = new Map<string, number>()
export const useThemeGlobalPersistStore = defineStore('akari-toc-notice', () => {
 const layout = useLayoutStore()
 const siteNoticeVisible = computed(() => !layout.disableSiteNotice)
 return { siteNoticeVisible }
})
export const useThemeGlobalStore = defineStore('akari-toc', {
 state: () => ({ activeHash: '', tocItems: [] as TocItem[], manualHideToc: false, mobileTocWidth: 0, mobileTocOpen: false, windowWidth: 0 }),
 actions: {
 debounce(key: string, fn: () => void, wait = 200) {
  const timer = debounceTimers.get(key)
  if (timer !== undefined) clearTimeout(timer)
  debounceTimers.set(key, window.setTimeout(() => { debounceTimers.delete(key); fn() }, wait))
 },
        // Check if a heading is inside a fold box
        isHeadingInsideFoldBox(element: HTMLElement) {
            return Boolean(element.closest('.fold-box-container'));
        },

        // Filter TOC items to exclude those inside fold boxes
        filterTocItemsByFoldBox(items: TocItem[]) {
            if (import.meta.env.SSR) {
                return items;
            }

            return items.filter((item) => {
                const element = document.getElementById(item.slug);
                if (!element) {
                    return true;
                }
                return !this.isHeadingInsideFoldBox(element);
            });
        },

        // Build TOC items from DOM elements
        buildItemsFromDom() {
            if (import.meta.env.SSR) {
                return;
            }
            this.manualHideToc = true
            this.debounce('buildItemsFromDom', () => {
                nextTick(() => {
                    console.log('Building TOC from DOM');

                    const container = document.querySelector('.toc-target');
                    if (!container) {
                        this.manualHideToc = false
                        this.tocItems = [];
                        return;
                    }

                    const headings = Array.from(container.querySelectorAll('h2, h3, h4, h5, .manual-anchor')) as HTMLElement[];
                    const items = headings
                        .map((heading) => {
                            const title = heading.textContent?.trim() || '';
                            const slug = heading.id || '';
                            const level = !heading.classList.contains('manual-anchor') ? Number.parseInt(heading.tagName.slice(1), 10) || 2 : 5;
                            return { title, slug, level, link: `#${slug}` };
                        })
                        .filter((item) => {
                            if (item.slug === '' || item.title === '') {
                                return false;
                            }
                            let el = document.getElementById(item.slug)
                            return el?.checkVisibility() ?? false;
                        });
                    if (items.length) {
                        this.tocItems = this.filterTocItemsByFoldBox(items);
                    }
                    console.log('TOC items built from DOM:', this.tocItems);
                    if (this.manualHideToc) {
                        setTimeout(() => {
                            this.manualHideToc = false
                        }, 200)
                    }
                })
            }, 200)

        },

 }
})
