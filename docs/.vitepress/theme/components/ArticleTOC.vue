<script setup lang="ts">
// Integration layer for the upstream Akari TOC components; their templates,
// styles, marquee and GSAP animations are kept from upstream.
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useThemeGlobalStore } from '../toc-state'
import { useThemeGlobalStore as useLayoutStore } from '../global'
import TOC from './TOC.vue'
import MobileTOC from './MobileTOC.vue'
import MobileTocButton from './MobileTocButton.vue'
import FabContainer from './FabContainer.vue'
import ClickToTop from './ClickToTop.vue'

const props = defineProps<{ drawerOpen: boolean }>()
const emit = defineEmits(['scroll-to-top'])
const { frontmatter, page } = useData()
const route = useRoute()
const store = useThemeGlobalStore()
const layout = useLayoutStore()
const tocRef = ref<InstanceType<typeof TOC> | null>(null)
const mobileTocRef = ref<InstanceType<typeof MobileTOC> | null>(null)
const showMobileTocButton = computed(() => mobileTocRef.value?.showMobileTocButton || false)
let root: HTMLElement | null = null
let observer: ResizeObserver | undefined
let mounted = false
let timer: ReturnType<typeof setTimeout> | undefined
function update() {
    store.windowWidth = window.innerWidth
    const container = document.querySelector<HTMLElement>('.container-main')
    if (container) {
        tocRef.value?.updateTocVisibility(container)
        mobileTocRef.value?.setCanShowToc(window.innerWidth - container.getBoundingClientRect().right >= 270)
    }
    mobileTocRef.value?.setScrolledEnoughForToc((root?.scrollTop || 0) > 10)
}
async function rebuild() {
    store.mobileTocOpen = false
    store.tocItems = []
    await nextTick()
    if (!mounted) return
    const content = document.getElementById('post-content')
    document.querySelectorAll('.toc-target').forEach(el => el.classList.remove('toc-target'))
    if (frontmatter.value.layout !== 'home' && !page.value.isNotFound && content) content.classList.add('toc-target')
    store.buildItemsFromDom()
    update()
}
watch(() => route.path, rebuild, { flush: 'post' })
watch(() => layout.contentLoaded, loaded => { if (loaded) rebuild() })
watch(() => props.drawerOpen, () => {
    store.mobileTocOpen = false
    clearTimeout(timer)
    timer = setTimeout(update, 350)
})
onMounted(() => {
    mounted = true
    root = document.querySelector('.layout-main')
    root?.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    observer = new ResizeObserver(update)
    const container = document.querySelector('.container-main')
    if (container) observer.observe(container)
    rebuild()
})
onUnmounted(() => {
    mounted = false
    root?.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
    observer?.disconnect()
    clearTimeout(timer)
})
</script>

<template>
    <FabContainer :drawer-open="drawerOpen" :is-mobile="store.windowWidth <= 840" class="akari-fab-integration">
        <MobileTocButton :show="showMobileTocButton" />
        <ClickToTop @scroll-to-top="emit('scroll-to-top')" />
    </FabContainer>
    <TOC ref="tocRef" :is-mobile="false" />
    <MobileTOC ref="mobileTocRef" />
</template>

<style scoped>
/* The older theme positions ClickToTop individually; upstream uses FabContainer. */
.akari-fab-integration :deep(.click-to-top) { position: relative; right: auto; bottom: auto !important; }
</style>
