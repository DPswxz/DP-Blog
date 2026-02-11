<script setup lang="ts">
import { data } from '../posts.data'
import '@mdui/icons/swap-vert.js';
import { gsap } from 'gsap';
import { withBase, useData, useRouter } from 'vitepress';
import { onMounted, ref, watch, computed, nextTick } from 'vue';
import PostCard from './PostCard.vue';
import { useThemeGlobalStore } from '../global';
import { storeToRefs } from 'pinia'

const router = useRouter();

const store = useThemeGlobalStore();

const { hideLayouts, themeMode, themeColor, backgroundImage, backgroundImageDark } = storeToRefs(store);

const useDark = ref(false)

const frontmatter = useData().frontmatter

const topImage = ref<HTMLImageElement | undefined>()
const topImageDark = ref<HTMLImageElement | undefined>()

interface ContainerListItem {
    type: string;
    data?: any;
    clickable?: boolean;
}


const reversed = ref(false)

const hasTopImage = frontmatter.value.cover_image

const postItems: ContainerListItem[] = []
for (let i = 0; i < data.length; i++) {
    if (!hideLayouts.value.includes(data[i].layout)) {
        postItems.push({ 'type': 'post-card', 'data': data[i], 'clickable': true })
    }
}

const postList = computed(() => {
    if (reversed.value) {
        return [...postItems].reverse()
    }
    return [...postItems]
})

function toggleSort() {
    reversed.value = !reversed.value
    localStorage.setItem('posts_reversed', String(reversed.value))
}


var containerRef: HTMLCollectionOf<Element> | null = null;


const selectedItem = ref(null);


const emit = defineEmits(['clickHomeItem', 'imagesLoaded']);

function flush() {
    let color = frontmatter.value.color ? frontmatter.value.color : themeColor.value
    let color_dark = frontmatter.value.color_dark ? frontmatter.value.color_dark : themeColor.value
    themeColor.value = themeMode.value === 'light' ? color : color_dark
    useDark.value = themeMode.value !== 'light'
}


onMounted(() => {
    const saved = localStorage.getItem('posts_reversed')
    if (saved) {
        reversed.value = saved === 'true'
    }

    containerRef = document.getElementsByClassName('home-content-container');
    gsap.to(document.getElementsByClassName('content-area')[0], {
        opacity: 1,
        y: -10,
        duration: 0.01,
        ease: "expo.out",
    })
    flush()
    emit('imagesLoaded')

    const scrollToPost = localStorage.getItem('scroll_to_post')
    if (scrollToPost) {
        localStorage.removeItem('scroll_to_post')
        nextTick(() => {
            setTimeout(() => {
                const cards = document.querySelectorAll('.home-content-container')
                const list = postList.value
                for (let i = 0; i < list.length; i++) {
                    if (withBase(list[i].data?.url) === scrollToPost) {
                        const card = cards[i]
                        if (card) {
                            const layoutMain = document.querySelector('.layout-main')
                            if (layoutMain) {
                                const cardRect = card.getBoundingClientRect()
                                const layoutRect = layoutMain.getBoundingClientRect()
                                const scrollTarget = cardRect.top - layoutRect.top + layoutMain.scrollTop - 120
                                gsap.to(layoutMain, {
                                    scrollTop: scrollTarget,
                                    duration: 0.6,
                                    ease: 'power2.out',
                                })
                            }
                        }
                        break
                    }
                }
            }, 200)
        })
    }
})

watch(() => themeMode.value, flush)

function selectPostItem(index: any) {
    const post = postList.value[index]
    if (post.clickable && containerRef) {
        let rect = containerRef[index].getBoundingClientRect();
        selectedItem.value = index;
        let card_ = containerRef[index].querySelector('.post-card-layout-container')
        let color = themeMode.value === 'light' ? card_?.getAttribute('card-color') : card_?.getAttribute('card-color-dark')
        if (!color) {
            color = '#FFFFFF'
        }
        store.$patch({
            'boxData': {
                'x': rect.x,
                'y': rect.y,
                'width': rect.width,
                'height': rect.height,
                'url': withBase(post.data.url),
                'active': true
            },
            'fromRouter': true,
            'themeColor': color,
        })
        // delay for wait click animation finish
        setTimeout(() => {
            router.go(withBase(post.data.url))
        }, 200)
    }
}

backgroundImage.value = frontmatter.value.cover_image
backgroundImageDark.value = frontmatter.value.cover_image_dark

</script>

<template>
    <div class="content-area">
        <div v-if="hasTopImage" class="top-image">
            <div class="top-image">
                <img :src="withBase(frontmatter.cover_image)" alt="" class="top-image-day"
                    :class="{ 'opacity': !useDark }" draggable="false" @contextmenu.prevent ref="topImage"
                    width="2000" height="1000">
                <img :src="withBase(frontmatter.cover_image_dark)" alt="" class="top-image-night"
                    :class="{ 'opacity': useDark }" draggable="false" @contextmenu.prevent ref="topImageDark"
                    width="2000" height="1000">
            </div>
        </div>
        <div class="sort-toolbar">
            <mdui-button-icon class="sort-toggle-btn" @click="toggleSort" :class="{ 'sort-reversed': reversed }">
                <mdui-icon-swap-vert></mdui-icon-swap-vert>
            </mdui-button-icon>
            <span class="sort-label">{{ reversed ? '旧日期在前' : '新日期在前' }}</span>
        </div>
        <TransitionGroup name="list">
            <div v-for="(post, i) in postList" :key="post.data?.url" @click="selectPostItem(i)" class="home-content-container"
                :data-index="i">
                <post-card :post="post.data"></post-card>
            </div>
        </TransitionGroup>
    </div>
</template>

<style>
.sort-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    padding-left: 10px;
    margin-bottom: 4px;
}

.sort-toggle-btn {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s;
}

.sort-toggle-btn.sort-reversed {
    transform: rotate(180deg);
}

.sort-label {
    font-size: 13px;
    color: rgb(var(--mdui-color-on-surface-variant));
    opacity: 0.7;
    user-select: none;
}

.list-move {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.top-image {
    position: relative;
    /* width: calc(100vw * 0.70); */
    width: 100%;
    height: fit-content;
    margin-top: 10px;
    margin-bottom: 20px;
}

.top-image img {
    width: 100%;
    overflow: hidden;
    border-radius: var(--mdui-shape-corner-extra-large);
    box-shadow: var(--mdui-elevation-level1);
    height: auto;
    background-color: rgb(var(--mdui-color-surface-variant));
}

.top-image-day {
    opacity: 0;
    transition: all var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard);
}

.top-image-night {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transition: all var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard);
}

.opacity {
    opacity: 1;
}

.content-area {
    opacity: 0;
    transition: all var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard);
}

/* .current-time {
    position: absolute;
    top: 0;
    left: 40;
    width: 100%;
    height: 100%;
    color: rgb(var(--mdui-color-on-primary-container));
    line-height: 100px;
    font-size: 100px;
    font-weight: 400;
    z-index: 10;
} */
</style>