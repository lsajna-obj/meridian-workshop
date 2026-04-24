<template>
  <div class="app">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <h1>{{ t('nav.companyName') }}</h1>
          <span class="subtitle">{{ t('nav.subtitle') }}</span>
        </div>
        <nav class="nav-tabs">
          <router-link to="/" :class="{ active: $route.path === '/' }">
            {{ t('nav.overview') }}
          </router-link>
          <router-link to="/inventory" :class="{ active: $route.path === '/inventory' }">
            {{ t('nav.inventory') }}
          </router-link>
          <router-link to="/orders" :class="{ active: $route.path === '/orders' }">
            {{ t('nav.orders') }}
          </router-link>
          <router-link to="/spending" :class="{ active: $route.path === '/spending' }">
            {{ t('nav.finance') }}
          </router-link>
          <router-link to="/demand" :class="{ active: $route.path === '/demand' }">
            {{ t('nav.demandForecast') }}
          </router-link>
          <router-link to="/reports" :class="{ active: $route.path === '/reports' }">
            {{ t('nav.reports') }}
          </router-link>
          <router-link to="/restocking" :class="{ active: $route.path === '/restocking' }">
            {{ t('nav.restocking') }}
          </router-link>
        </nav>
        <button
          class="theme-toggle"
          @click="toggleDarkMode"
          :title="isDark ? t('theme.light') : t('theme.dark')"
          :aria-label="isDark ? t('theme.light') : t('theme.dark')"
        >
          <!-- Sun: shown in dark mode to switch to light -->
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
          </svg>
          <!-- Moon: shown in light mode to switch to dark -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </button>
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </header>
    <FilterBar />
    <main class="main-content">
      <router-view />
    </main>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    const isDark = ref(localStorage.getItem('theme') === 'dark')

    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', isDark.value)
    }

    const toggleDarkMode = () => {
      isDark.value = !isDark.value
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      applyTheme()
    }

    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)
        if (isMockTask) {
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) currentUser.value.tasks.splice(index, 1)
        } else {
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)
        if (mockTask) {
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) apiTasks.value[index] = updatedTask
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(() => {
      applyTheme()
      loadTasks()
    })

    return {
      t,
      isDark,
      toggleDarkMode,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
/* ── CSS custom properties ─────────────────────────────── */
:root {
  --bg:           #f8fafc;
  --surface:      #ffffff;
  --surface-2:    #f8fafc;
  --surface-3:    #f1f5f9;
  --border:       #e2e8f0;
  --border-2:     #cbd5e1;
  --text-1:       #0f172a;
  --text-2:       #1e293b;
  --text-3:       #334155;
  --text-4:       #475569;
  --text-5:       #64748b;
  --text-6:       #94a3b8;
  --accent:       #2563eb;
  --accent-bg:    #eff6ff;
  --accent-text:  #1d4ed8;
  --shadow-xs:    0 1px 3px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:    0 4px 12px rgba(0, 0, 0, 0.06);
}

html.dark {
  --bg:           #0f172a;
  --surface:      #1e293b;
  --surface-2:    #1e293b;
  --surface-3:    #334155;
  --border:       #334155;
  --border-2:     #475569;
  --text-1:       #f1f5f9;
  --text-2:       #e2e8f0;
  --text-3:       #cbd5e1;
  --text-4:       #94a3b8;
  --text-5:       #94a3b8;
  --text-6:       #64748b;
  --accent:       #3b82f6;
  --accent-bg:    #1e3a5f;
  --accent-text:  #93c5fd;
  --shadow-xs:    0 1px 3px 0 rgba(0, 0, 0, 0.3);
  --shadow-md:    0 4px 12px rgba(0, 0, 0, 0.25);
}

/* ── Reset ─────────────────────────────────────────────── */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg);
  color: var(--text-2);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 0.2s, color 0.2s;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ── Top nav ───────────────────────────────────────────── */
.top-nav {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  height: 70px;
  gap: 0.75rem;
}

.nav-container > .nav-tabs {
  margin-left: auto;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-shrink: 0;
}

.logo h1 {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: 0.813rem;
  color: var(--text-5);
  font-weight: 400;
  padding-left: 0.75rem;
  border-left: 1px solid var(--border);
}

.nav-tabs {
  display: flex;
  gap: 0.25rem;
}

.nav-tabs a {
  padding: 0.625rem 1.25rem;
  color: var(--text-5);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.938rem;
  border-radius: 6px;
  transition: all 0.15s ease;
  position: relative;
  white-space: nowrap;
}

.nav-tabs a:hover {
  color: var(--text-1);
  background: var(--surface-3);
}

.nav-tabs a.active {
  color: var(--accent);
  background: var(--accent-bg);
}

.nav-tabs a.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 2px 2px 0 0;
}

/* ── Dark mode toggle ──────────────────────────────────── */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-5);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: var(--border);
  color: var(--text-1);
}

.theme-toggle svg {
  width: 18px;
  height: 18px;
}

/* ── Main content ──────────────────────────────────────── */
.main-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

/* ── Page header ───────────────────────────────────────── */
.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--text-5);
  font-size: 0.938rem;
}

/* ── Stat cards ────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--surface);
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.stat-card:hover {
  border-color: var(--border-2);
  box-shadow: var(--shadow-md);
}

.stat-label {
  color: var(--text-5);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value { color: #ea580c; }
.stat-card.success .stat-value { color: #059669; }
.stat-card.danger  .stat-value { color: #dc2626; }
.stat-card.info    .stat-value { color: var(--accent); }

/* ── Card ──────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid var(--border);
  margin-bottom: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.025em;
}

/* ── Table ─────────────────────────────────────────────── */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: var(--text-4);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--border);
  color: var(--text-3);
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--surface-2);
}

/* ── Badges ────────────────────────────────────────────── */
.badge {
  display: inline-block;
  padding: 0.313rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success    { background: #d1fae5; color: #065f46; }
.badge.warning    { background: #fed7aa; color: #92400e; }
.badge.danger     { background: #fecaca; color: #991b1b; }
.badge.info       { background: #dbeafe; color: #1e40af; }
.badge.increasing { background: #d1fae5; color: #065f46; }
.badge.decreasing { background: #fecaca; color: #991b1b; }
.badge.stable     { background: #e0e7ff; color: #3730a3; }
.badge.high       { background: #fecaca; color: #991b1b; }
.badge.medium     { background: #fed7aa; color: #92400e; }
.badge.low        { background: #dbeafe; color: #1e40af; }

html.dark .badge.success    { background: rgba(16,185,129,0.15); color: #6ee7b7; }
html.dark .badge.warning    { background: rgba(245,158,11,0.15);  color: #fcd34d; }
html.dark .badge.danger     { background: rgba(239,68,68,0.15);   color: #fca5a5; }
html.dark .badge.info       { background: rgba(59,130,246,0.15);  color: #93c5fd; }
html.dark .badge.increasing { background: rgba(16,185,129,0.15);  color: #6ee7b7; }
html.dark .badge.decreasing { background: rgba(239,68,68,0.15);   color: #fca5a5; }
html.dark .badge.stable     { background: rgba(99,102,241,0.15);  color: #a5b4fc; }
html.dark .badge.high       { background: rgba(239,68,68,0.15);   color: #fca5a5; }
html.dark .badge.medium     { background: rgba(245,158,11,0.15);  color: #fcd34d; }
html.dark .badge.low        { background: rgba(59,130,246,0.15);  color: #93c5fd; }

/* ── Loading / error ───────────────────────────────────── */
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-5);
  font-size: 0.938rem;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}

html.dark .error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

/* ── D1: UI refresh ────────────────────────────────────── */

/* Page fade-in on route change */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.main-content > * {
  animation: fadeUp 0.22s ease both;
}

/* Logo accent dot */
.logo h1::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 2px;
  margin-right: 0.6rem;
  vertical-align: middle;
  margin-bottom: 2px;
}

/* Page header accent underline */
.page-header h2 {
  display: inline-block;
  padding-bottom: 0.375rem;
}

.page-header h2::after {
  content: '';
  display: block;
  height: 3px;
  width: 2.5rem;
  background: var(--accent);
  border-radius: 2px;
  margin-top: 0.375rem;
  opacity: 0.7;
}

/* Stat card: colored top accent per semantic type */
.stat-card { border-top: 3px solid var(--border); }
.stat-card.warning { border-top-color: #ea580c; }
.stat-card.success { border-top-color: #059669; }
.stat-card.danger  { border-top-color: #dc2626; }
.stat-card.info    { border-top-color: var(--accent); }

/* Card hover: subtle lift */
.card {
  transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-2);
  transform: translateY(-1px);
}

/* Loading: subtle pulse instead of static text */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.loading {
  animation: pulse 1.4s ease-in-out infinite;
}

/* Active nav: gradient background */
.nav-tabs a.active {
  background: linear-gradient(135deg, var(--accent-bg), var(--accent-bg));
  font-weight: 600;
}

/* Table row: slightly faster hover */
tbody tr { transition: background-color 0.1s ease; }

/* Smooth theme switch for all transitionable props */
.top-nav,
.card,
.stat-card,
.badge {
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
</style>
