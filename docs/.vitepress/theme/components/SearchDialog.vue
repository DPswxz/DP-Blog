<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, withBase } from 'vitepress'

// Import all markdown files as raw text at build time
const rawFiles = import.meta.glob('/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

interface SearchPage {
  title: string
  url: string
  content: string
}

// Parse the files into searchable data
const pages: SearchPage[] = Object.entries(rawFiles).map(([path, content]) => {
  const titleMatch = content.match(/title:\s*['"]?(.+?)['"]?\s*$/m)
  const title = titleMatch ? titleMatch[1].trim() : path.replace(/^\//, '').replace(/\.md$/, '')

  const cleanContent = content
    .replace(/---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[#*`>\[\]()!\-|=_~^]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const url = path.replace(/\.md$/, '.html')
  return { title, url, content: cleanContent }
})

const searchQuery = ref('')
const isOpen = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)
const router = useRouter()

const results = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query || query.length < 1) return []

  return pages
    .filter(page => {
      return page.title.toLowerCase().includes(query) ||
             page.content.toLowerCase().includes(query)
    })
    .map(page => {
      const contentLower = page.content.toLowerCase()
      const idx = contentLower.indexOf(query)
      let snippet = ''
      if (idx !== -1) {
        const start = Math.max(0, idx - 40)
        const end = Math.min(page.content.length, idx + query.length + 80)
        snippet = (start > 0 ? '...' : '') + page.content.slice(start, end) + (end < page.content.length ? '...' : '')
      } else {
        snippet = page.content.substring(0, 100) + (page.content.length > 100 ? '...' : '')
      }
      return {
        ...page,
        snippet,
        titleMatch: page.title.toLowerCase().includes(query)
      }
    })
})

function openSearch() {
  isOpen.value = true
  searchQuery.value = ''
  selectedIndex.value = 0
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function closeSearch() {
  isOpen.value = false
  searchQuery.value = ''
}

function goTo(url: string) {
  router.go(withBase(url))
  closeSearch()
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text)
  const escaped = escapeHtml(text)
  const queryEscaped = escapeHtml(query)
  const regex = new RegExp(`(${queryEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return escaped.replace(regex, '<mark class="search-highlight">$1</mark>')
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function onInputKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter' && results.value.length > 0) {
    e.preventDefault()
    goTo(results.value[selectedIndex.value].url)
  }
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      closeSearch()
    } else {
      openSearch()
    }
  }
  if (e.key === 'Escape' && isOpen.value) {
    e.preventDefault()
    closeSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

defineExpose({ openSearch })
</script>

<template>
  <mdui-button-icon class="search-trigger-btn" @click="openSearch">
    <mdui-icon-search></mdui-icon-search>
  </mdui-button-icon>

  <Teleport to="body">
    <Transition name="search-fade">
      <div v-if="isOpen" class="search-overlay" @click.self="closeSearch">
        <div class="search-dialog">
          <div class="search-input-wrapper">
            <mdui-icon-search class="search-input-icon"></mdui-icon-search>
            <input
              ref="inputRef"
              v-model="searchQuery"
              class="search-input"
              placeholder="搜索内容..."
              autocomplete="off"
              spellcheck="false"
              @keydown="onInputKeydown"
            />
            <kbd class="search-kbd" @click="closeSearch">ESC</kbd>
          </div>

          <div class="search-results-container">
            <div v-if="searchQuery.trim() && results.length === 0" class="search-no-results">
              <span class="search-no-results-icon">🔍</span>
              <span>没有找到 "<strong>{{ searchQuery }}</strong>" 的相关结果</span>
            </div>

            <div v-else-if="results.length > 0" class="search-results-list">
              <div
                v-for="(result, index) in results"
                :key="result.url"
                class="search-result-item"
                :class="{ 'search-result-selected': index === selectedIndex }"
                @click="goTo(result.url)"
                @mouseenter="selectedIndex = index"
              >
                <div class="search-result-title" v-html="highlightText(result.title, searchQuery)"></div>
                <div class="search-result-snippet" v-if="result.snippet" v-html="highlightText(result.snippet, searchQuery)"></div>
              </div>
            </div>

            <div v-else class="search-empty-state">
              <span class="search-empty-hint">输入关键词开始搜索</span>
            </div>
          </div>

          <div class="search-dialog-footer">
            <div class="search-footer-keys">
              <span class="search-footer-key-group">
                <kbd>↑</kbd><kbd>↓</kbd> 导航
              </span>
              <span class="search-footer-key-group">
                <kbd>↵</kbd> 确认
              </span>
              <span class="search-footer-key-group">
                <kbd>Ctrl</kbd>+<kbd>K</kbd> 切换
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.search-trigger-btn {
  margin-right: 2px;
}

.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.search-dialog {
  width: 90%;
  max-width: 560px;
  background: rgb(var(--mdui-color-surface-container-highest));
  border-radius: var(--mdui-shape-corner-extra-large);
  box-shadow: var(--mdui-elevation-level5);
  overflow: hidden;
  animation: search-dialog-enter 0.25s cubic-bezier(0.2, 0, 0, 1);
}

@keyframes search-dialog-enter {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  gap: 12px;
  border-bottom: 1px solid rgba(var(--mdui-color-outline-variant), 0.4);
}

.search-input-icon {
  color: rgb(var(--mdui-color-on-surface-variant));
  flex-shrink: 0;
  font-size: 22px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: rgb(var(--mdui-color-on-surface));
  font-family: inherit;
  line-height: 1.5;
}

.search-input::placeholder {
  color: rgb(var(--mdui-color-on-surface-variant));
  opacity: 0.6;
}

.search-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: var(--mdui-shape-corner-small);
  background: rgba(var(--mdui-color-on-surface-variant), 0.08);
  color: rgb(var(--mdui-color-on-surface-variant));
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  border: 1px solid rgba(var(--mdui-color-outline-variant), 0.3);
  transition: background 0.15s;
}

.search-kbd:hover {
  background: rgba(var(--mdui-color-on-surface-variant), 0.15);
}

.search-results-container {
  max-height: 50vh;
  overflow-y: auto;
  padding: 8px;
}

.search-no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: rgb(var(--mdui-color-on-surface-variant));
  font-size: 14px;
  opacity: 0.8;
}

.search-no-results-icon {
  font-size: 20px;
}

.search-empty-state {
  padding: 32px 16px;
  text-align: center;
}

.search-empty-hint {
  color: rgb(var(--mdui-color-on-surface-variant));
  font-size: 14px;
  opacity: 0.5;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-result-item {
  padding: 12px 16px;
  border-radius: var(--mdui-shape-corner-large);
  cursor: pointer;
  transition: background 0.15s;
}

.search-result-item:hover,
.search-result-selected {
  background: rgba(var(--mdui-color-on-surface-variant), 0.08);
}

.search-result-selected {
  box-shadow: inset 0 0 0 1px rgba(var(--mdui-color-primary), 0.3);
}

.search-result-title {
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--mdui-color-on-surface));
  margin-bottom: 4px;
}

.search-result-snippet {
  font-size: 13px;
  color: rgb(var(--mdui-color-on-surface-variant));
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.search-highlight {
  background: rgba(var(--mdui-color-primary), 0.2);
  color: rgb(var(--mdui-color-primary));
  border-radius: 2px;
  padding: 0 2px;
}

.search-dialog-footer {
  padding: 10px 18px;
  border-top: 1px solid rgba(var(--mdui-color-outline-variant), 0.4);
}

.search-footer-keys {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-footer-key-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgb(var(--mdui-color-on-surface-variant));
  opacity: 0.6;
}

.search-footer-key-group kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 4px;
  background: rgba(var(--mdui-color-on-surface-variant), 0.08);
  border: 1px solid rgba(var(--mdui-color-outline-variant), 0.3);
  font-size: 11px;
  font-family: inherit;
}

/* Transition */
.search-fade-enter-active {
  transition: opacity 0.2s ease;
}

.search-fade-leave-active {
  transition: opacity 0.15s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

/* Scrollbar */
.search-results-container::-webkit-scrollbar {
  width: 6px;
}

.search-results-container::-webkit-scrollbar-track {
  background: transparent;
}

.search-results-container::-webkit-scrollbar-thumb {
  background: rgba(var(--mdui-color-on-surface-variant), 0.2);
  border-radius: 3px;
}

.search-results-container::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--mdui-color-on-surface-variant), 0.35);
}

@media screen and (max-width: 600px) {
  .search-dialog {
    width: 95%;
    border-radius: var(--mdui-shape-corner-large);
  }

  .search-footer-keys {
    gap: 10px;
  }
}
</style>
