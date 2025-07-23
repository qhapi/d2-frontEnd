<template>
  <div class="stat-card" :style="{ borderLeft: `4px solid ${color}` }">
    <div class="stat-header">
      <i :class="icon" :style="{ color }"></i>
      <h4>{{ title }}</h4>
    </div>
    <div class="stat-value">
      {{ formattedValue }}<span v-if="suffix" class="stat-suffix">{{ suffix }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    value: [Number, String],
    suffix: String,
    icon: String,
    color: {
      type: String,
      default: '#409EFF'
    }
  },
  computed: {
    formattedValue () {
      return Number(this.value).toLocaleString()
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .stat-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    i {
      font-size: 24px;
      margin-right: 12px;
    }

    h4 {
      margin: 0;
      color: #606266;
      font-size: 16px;
    }
  }

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;

    .stat-suffix {
      font-size: 16px;
      color: #909399;
      margin-left: 6px;
    }
  }
}
</style>
