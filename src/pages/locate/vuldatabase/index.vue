<template>
  <d2-container class="page">
    <h1 class="page-title">智能合约漏洞数据</h1>
    <el-row :gutter="20">
      <!-- 主数据展示区 -->
      <el-col :span="24">
        <el-card class="dashboard-card">
          <div class="chart-container">
            <!-- 环形图展示分布比例 -->
            <div class="chart-item">
              <ve-ring :data="typeDistribution" :settings="chartSettings" height="300px"></ve-ring>
            </div>

            <!-- 柱状图对比数量 -->
            <div class="chart-item">
              <ve-histogram
                :data="countData"
                :settings="histogramSettings"
                height="300px"
                :extend="histogramExtend">
              </ve-histogram>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 详细数据卡片 -->
      <el-col
        v-for="(item, index) in vulnerabilityData"
        :key="index"
        :xs="24" :sm="12" :md="6">
        <el-card class="stat-card" :style="cardStyles[index]">
          <div class="card-content">
            <div class="icon-wrapper">
              <i :class="item.icon" class="card-icon"></i>
            </div>
            <h3 class="vul-name">{{ item.name }}</h3>
            <div class="data-item">
              <span class="label">样本数量</span>
              <el-tag type="info" class="count-tag">
                {{ item.count.toLocaleString() }}
              </el-tag>
            </div>
            <div class="data-item">
              <div class="accuracy-header">
                <span class="label">识别准确率</span>
                <el-tooltip content="基于历史检测结果的准确率评估" placement="top">
                  <i class="el-icon-info"></i>
                </el-tooltip>
              </div>
              <div class="accuracy-display">
                <el-progress
                  :percentage="item.accuracy * 100"
                  :stroke-width="16"
                  :color="progressColors[index]"
                  :format="formatAccuracy"
                  class="accuracy-progress">
                </el-progress>
                <span class="accuracy-value">
                  {{ (item.accuracy * 100).toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </d2-container>
</template>
<script>
export default {
  data () {
    return {
      vulnerabilityData: [
        {
          name: 'Integer Overflow',
          count: 275,
          accuracy: 0.9487,
          icon: 'el-icon-warning-outline',
          color: '#FF6B6B'
        },
        {
          name: 'Delegatecall',
          count: 196,
          accuracy: 0.9489,
          icon: 'el-icon-connection',
          color: '#4ECDC4'
        },
        {
          name: 'Timestamp',
          count: 349,
          accuracy: 0.9399,
          icon: 'el-icon-timer',
          color: '#45B7D1'
        },
        {
          name: 'Reentrancy',
          count: 273,
          accuracy: 0.9228,
          icon: 'el-icon-refresh',
          color: '#96CEB4'
        }
      ],
      chartSettings: {
        radius: [60, 90],
        offsetY: 150,
        label: { show: false },
        itemStyle: { borderWidth: 3 }
      },
      histogramSettings: {
        metrics: ['数量'],
        dimension: ['漏洞类型'],
        labelMap: { 数量: '样本数量' },
        axisSite: { right: ['准确率'] },
        showLine: ['准确率']
      },
      histogramExtend: {
        series: {
          barWidth: 40,
          itemStyle: { borderRadius: [4, 4, 0, 0] }
        },
        xAxis: { axisLabel: { rotate: 30 } },
        tooltip: { formatter: params => `${params[0].name}<br/>数量：${params[0].value}<br/>准确率：${(params[1].value * 100).toFixed(2)}%` }
      }
    }
  },
  computed: {
    // 卡片渐变样式
    cardStyles () {
      return this.vulnerabilityData.map(item => ({
        background: `linear-gradient(135deg, ${item.color}20 0%, #ffffff 100%)`,
        border: `1px solid ${item.color}30`
      }))
    },
    // 进度条颜色
    progressColors () {
      return this.vulnerabilityData.map(item => ({
        0: '#FF6B6B',
        50: '#FFE66D',
        100: item.color
      }))
    },
    // 环形图数据
    typeDistribution () {
      return {
        columns: ['漏洞类型', '数量'],
        rows: this.vulnerabilityData.map(item => ({
          漏洞类型: item.name,
          数量: item.count
        }))
      }
    },
    // 柱状图数据
    countData () {
      return {
        columns: ['漏洞类型', '数量', '准确率'],
        rows: this.vulnerabilityData.map(item => ({
          漏洞类型: item.name,
          数量: item.count,
          准确率: item.accuracy
        }))
      }
    }
  },
  methods: {
    formatAccuracy (percentage) {
      return `${percentage.toFixed(2)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  .page-title {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 24px;
  }

  .dashboard-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);

    .chart-container {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
    }
  }

  .stat-card {
    margin-bottom: 20px;
    transition: transform 0.3s;
    border-radius: 8px;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .card-content {
      padding: 15px;
      text-align: center;

      .icon-wrapper {
        margin: -40px auto 15px;
        width: 60px;
        height: 60px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);

        .card-icon {
          font-size: 28px;
          color: inherit;
        }
      }

      .vul-name {
        color: #2c3e50;
        margin: 10px 0;
        font-weight: bold;
      }

      .data-item {
        margin: 15px 0;

        .label {
          display: block;
          color: #7f8c8d;
          margin-bottom: 5px;
          font-size: 12px;
        }

        .count-tag {
          font-size: 14px;
          padding: 8px 12px;
        }

        .accuracy-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;

          .el-icon-info {
            color: #909399;
            cursor: help;
            margin-left: 5px;
          }
        }

        .accuracy-display {
          display: flex;
          align-items: center;
          gap: 10px;

          .accuracy-progress {
            flex: 1;
            ::v-deep .el-progress__text {
              font-size: 12px !important;
              color: #666 !important;
            }
          }

          .accuracy-value {
            font-weight: bold;
            color: #2c3e50;
            min-width: 60px;
            text-align: right;
            font-size: 14px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .chart-container {
    grid-template-columns: 1fr !important;
  }

  .stat-card {
    margin-bottom: 15px;

    .accuracy-value {
      font-size: 12px !important;
    }
  }
}
</style>
