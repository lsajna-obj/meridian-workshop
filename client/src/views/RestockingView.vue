<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <!-- Budget input -->
    <div class="budget-bar">
      <label class="budget-label">{{ t('restocking.budgetLabel') }}</label>
      <div class="budget-input-group">
        <span class="budget-prefix">$</span>
        <input
          v-model="budgetInput"
          type="number"
          min="0"
          class="budget-input"
          :placeholder="t('restocking.budgetPlaceholder')"
          @keyup.enter="applyBudget"
        />
        <button class="btn-apply" @click="applyBudget">{{ t('restocking.applyBudget') }}</button>
        <button class="btn-clear" @click="clearBudget" :disabled="!activeBudget">{{ t('restocking.clearBudget') }}</button>
      </div>
      <span v-if="activeBudget" class="budget-active">
        {{ t('restocking.withinBudget') }}: ${{ formatNumber(activeBudget) }}
      </span>
      <span v-else class="budget-hint">{{ t('restocking.noBudgetSet') }}</span>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>

      <!-- Summary stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.totalRecommendations') }}</div>
          <div class="stat-value">{{ recommendations.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.totalEstimatedCost') }}</div>
          <div class="stat-value">${{ formatNumber(totalEstimatedCost) }}</div>
        </div>
        <div class="stat-card priority-high">
          <div class="stat-label">{{ t('priority.high') }}</div>
          <div class="stat-value">{{ countByPriority('high') }}</div>
        </div>
        <div class="stat-card priority-medium">
          <div class="stat-label">{{ t('priority.medium') }}</div>
          <div class="stat-value">{{ countByPriority('medium') }}</div>
        </div>
      </div>

      <!-- Recommendations table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            {{ recommendations.length }} {{ t('restocking.totalRecommendations').toLowerCase() }}
          </h3>
        </div>

        <div v-if="recommendations.length === 0" class="empty">
          {{ t('restocking.noRecommendations') }}
        </div>

        <div v-else class="table-container">
          <table class="restocking-table">
            <thead>
              <tr>
                <th>{{ t('restocking.table.priority') }}</th>
                <th>{{ t('restocking.table.sku') }}</th>
                <th>{{ t('restocking.table.itemName') }}</th>
                <th>{{ t('restocking.table.category') }}</th>
                <th>{{ t('restocking.table.warehouse') }}</th>
                <th class="num">{{ t('restocking.table.currentStock') }}</th>
                <th class="num">{{ t('restocking.table.reorderPoint') }}</th>
                <th class="num">{{ t('restocking.table.forecastedDemand') }}</th>
                <th class="num">{{ t('restocking.table.recommendedOrder') }}</th>
                <th>{{ t('restocking.table.trend') }}</th>
                <th class="num">{{ t('restocking.table.estimatedCost') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in recommendations" :key="rec.sku + rec.warehouse">
                <td><span :class="priorityClass(rec.priority)">{{ t('priority.' + rec.priority) }}</span></td>
                <td class="sku">{{ rec.sku }}</td>
                <td>{{ rec.name }}</td>
                <td>{{ rec.category }}</td>
                <td>{{ translateWarehouse(rec.warehouse) }}</td>
                <td class="num" :class="{ 'stock-critical': rec.current_stock === 0, 'stock-low': rec.current_stock < rec.reorder_point && rec.current_stock > 0 }">
                  {{ rec.current_stock }}
                </td>
                <td class="num">{{ rec.reorder_point }}</td>
                <td class="num">{{ rec.forecasted_demand }}</td>
                <td class="num bold">{{ rec.recommended_order }}</td>
                <td><span :class="trendClass(rec.trend)">{{ t('trends.' + rec.trend) }}</span></td>
                <td class="num bold">${{ formatNumber(rec.estimated_cost) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { api } from '../api'

export default {
  name: 'RestockingView',
  setup() {
    const { selectedLocation, selectedCategory, getCurrentFilters } = useFilters()
    const { t, translateWarehouse } = useI18n()

    const loading = ref(true)
    const error = ref(null)
    const recommendations = ref([])
    const budgetInput = ref('')
    const activeBudget = ref(null)

    const totalEstimatedCost = computed(() =>
      recommendations.value.reduce((sum, r) => sum + r.estimated_cost, 0)
    )

    const countByPriority = (p) => recommendations.value.filter(r => r.priority === p).length

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()
        if (activeBudget.value) filters.budget = activeBudget.value
        recommendations.value = await api.getRestockingRecommendations(filters)
      } catch (err) {
        error.value = t('common.error') + ': ' + err.message
      } finally {
        loading.value = false
      }
    }

    const applyBudget = () => {
      const val = parseFloat(budgetInput.value)
      if (!isNaN(val) && val > 0) {
        activeBudget.value = val
        loadData()
      }
    }

    const clearBudget = () => {
      budgetInput.value = ''
      activeBudget.value = null
      loadData()
    }

    const formatNumber = (num) =>
      Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const priorityClass = (p) => ({
      high: 'badge danger',
      medium: 'badge warning',
      low: 'badge info',
    }[p] || 'badge')

    const trendClass = (trend) => ({
      increasing: 'trend-up',
      decreasing: 'trend-down',
      stable: 'trend-stable',
    }[trend] || '')

    watch([selectedLocation, selectedCategory], loadData)
    onMounted(loadData)

    return {
      loading, error, recommendations,
      budgetInput, activeBudget,
      totalEstimatedCost, countByPriority,
      t, translateWarehouse,
      formatNumber, priorityClass, trendClass,
      applyBudget, clearBudget,
    }
  }
}
</script>

<style scoped>
.restocking { padding: 0; }

.budget-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  flex-wrap: wrap;
}

.budget-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
}

.budget-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.budget-prefix {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

.budget-input {
  width: 180px;
  padding: 0.4rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #0f172a;
}

.budget-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.btn-apply {
  padding: 0.4rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-apply:hover { background: #2563eb; }

.btn-clear {
  padding: 0.4rem 1rem;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-clear:hover:not(:disabled) { border-color: #94a3b8; color: #0f172a; }
.btn-clear:disabled { opacity: 0.4; cursor: not-allowed; }

.budget-active {
  font-size: 0.813rem;
  font-weight: 600;
  color: #16a34a;
  background: #dcfce7;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.budget-hint {
  font-size: 0.813rem;
  color: #94a3b8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 4px solid #3b82f6;
}

.stat-card.priority-high { border-left-color: #dc2626; }
.stat-card.priority-medium { border-left-color: #f59e0b; }

.stat-label { font-size: 0.813rem; color: #64748b; margin-bottom: 0.4rem; }
.stat-value { font-size: 1.75rem; font-weight: 700; color: #0f172a; }

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-header { margin-bottom: 1rem; }
.card-title { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0; }

.table-container { overflow-x: auto; }

.restocking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.restocking-table th {
  background: #f8fafc;
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.restocking-table th.num,
.restocking-table td.num { text-align: right; }

.restocking-table td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.restocking-table tr:hover td { background: #f8fafc; }

.sku { font-family: monospace; font-size: 0.813rem; color: #64748b; }
.bold { font-weight: 600; color: #0f172a; }

.stock-critical { color: #dc2626; font-weight: 700; }
.stock-low { color: #d97706; font-weight: 600; }

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge.danger { background: #fee2e2; color: #991b1b; }
.badge.warning { background: #fef3c7; color: #92400e; }
.badge.info { background: #dbeafe; color: #1e40af; }

.trend-up { color: #16a34a; font-weight: 600; }
.trend-down { color: #dc2626; font-weight: 600; }
.trend-stable { color: #64748b; }

.empty {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.error {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
}
</style>
