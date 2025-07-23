<template>
  <d2-container class="fuzz-testing-page">
    <!-- 工具链选择 -->
    <div v-if="currentStep === 0" class="toolchain-selection">
      <h2 class="selection-title">🔧 选择区块链测试工具链</h2>
      <div class="toolchain-grid">
        <el-card
          v-for="tool in toolchains"
          :key="tool.name"
          shadow="hover"
          class="tool-card"
          @click.native="selectToolchain(tool)">
          <div class="tool-header">
            <i :class="tool.icon" :style="{color: tool.color}"></i>
            <h3>{{ tool.name }}</h3>
          </div>
          <p class="tool-desc">{{ tool.desc }}</p>
          <div class="tool-stats">
            <el-tag type="info">v{{ tool.version }}</el-tag>
            <el-tag :type="tool.type === 'Compiler' ? 'primary' : 'success'">
              {{ tool.type }}
            </el-tag>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 模糊测试进度 -->
    <div v-if="currentStep === 1" class="fuzzing-progress">
      <div class="progress-header">
        <h2>🔬 正在执行 {{ selectedTool.name }} 模糊测试</h2>
        <el-tag type="warning">测试引擎版本 {{ selectedTool.version }}</el-tag>
      </div>

      <el-progress
        type="dashboard"
        :percentage="progress"
        :color="progressColors"
        :width="200">
        <div class="progress-info">
          <div class="time">{{ elapsedTime }}</div>
          <div class="speed">{{ logsPerSec }} logs/s</div>
        </div>
      </el-progress>

      <el-row :gutter="20" class="live-stats">
        <el-col :span="6">
          <stat-card
            title="测试用例"
            :value="testCases"
            icon="el-icon-document"
            color="#409EFF"/>
        </el-col>
        <el-col :span="6">
          <stat-card
            title="代码覆盖"
            :value="coverage"
            suffix="%"
            icon="el-icon-data-analysis"
            color="#67C23A"/>
        </el-col>
        <el-col :span="6">
          <stat-card
            title="异常检测"
            :value="exceptions"
            icon="el-icon-warning"
            color="#F56C6C"/>
        </el-col>
        <el-col :span="6">
          <stat-card
            title="执行速度"
            :value="execSpeed"
            suffix="op/s"
            icon="el-icon-time"
            color="#E6A23C"/>
        </el-col>
      </el-row>

      <el-card class="live-logs">
        <h3>📜 实时执行日志 <el-tag size="mini">最后{{ logs.length }}条</el-tag></h3>
        <div class="log-container">
          <div
            v-for="log in visibleLogs"
            :key="log.id"
            class="log-item"
            :class="log.type">
            <i :class="log.type === 'error' ? 'el-icon-error' : 'el-icon-info'"></i>
            <span class="timestamp">[{{ log.time }}]</span>
            <span class="message">{{ log.message }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 测试完成分析 -->
    <div v-if="currentStep === 2" class="analysis-result">
      <h2>📊 {{ selectedTool.name }} 测试结果分析</h2>

      <div class="detailed-analysis">
        <el-alert type="success" :closable="false">
          已完成 {{ testCases }} 个测试用例，发现 {{ exceptions }} 个异常事件，代码覆盖率达到 {{ coverage }}%
        </el-alert>

        <el-row :gutter="20" class="analysis-sections">
          <el-col :span="16">
            <el-card class="vuln-chart">
              <h3>🔍 漏洞类型分布 (按严重等级)</h3>
              <div class="chart-wrapper">
                <div ref="chart" style="height: 300px;"></div>
                <div class="chart-legend">
                  <div v-for="(item, index) in vulnData" :key="index" class="legend-item">
                    <span class="legend-color" :style="{backgroundColor: item.color}"></span>
                    {{ item.name }} ({{ item.value }}%)
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card class="critical-stats">
              <h3>⚡ 运行时指标</h3>
              <div class="stats-grid">
                <div class="stat-item critical">
                  <label>严重漏洞</label>
                  <div class="stat-value">{{ criticalCount }}</div>
                  <div class="stat-trend">
                    <i class="el-icon-caret-top" style="color: #F56C6C"></i>
                    +12% 环比
                  </div>
                </div>
                <div class="stat-item">
                  <label>平均响应时间</label>
                  <div class="stat-value">{{ avgResponseTime }}ms</div>
                  <div class="stat-compare">较基准快 {{ perfImprovement }}%</div>
                </div>
                <div class="stat-item">
                  <label>内存峰值</label>
                  <div class="stat-value">{{ memoryPeak }}MB</div>
                  <div class="stat-compare">阈值: {{ memoryThreshold }}MB</div>
                </div>
                <div class="stat-item">
                  <label>CPU利用率</label>
                  <div class="stat-value">{{ cpuUsage }}%</div>
                  <el-progress
                    :percentage="cpuUsage"
                    :color="cpuUsage > 80 ? '#F56C6C' : '#67C23A'"
                    :show-text="false"
                    stroke-width="6"/>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="vuln-list">
          <h3>📋 已发现漏洞列表 (TOP5)</h3>
          <el-table :data="criticalVulns" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="{row}">
                <el-tag :type="row.severity === '高危' ? 'danger' : 'warning'">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="状态" width="100">
              <template slot-scope="{row}">
                <el-tag effect="dark" :type="row.status === '已修复' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <el-button
        type="primary"
        @click="downloadReport"
        class="download-btn">
        <i class="el-icon-document"></i> 生成完整报告
      </el-button>
    </div>
  </d2-container>
</template>

<script>
import echarts from 'echarts'
import StatCard from '@/pages/fuzz/StatCard.vue'

export default {
  components: { StatCard },
  data () {
    return {
      currentStep: 0,
      toolchains: [
        {
          name: 'Binaryen',
          icon: 'el-icon-cpu',
          color: '#409EFF',
          desc: 'WebAssembly 编译器工具链套件',
          version: '1.2.3',
          type: 'Compiler'
        },
        {
          name: 'WABT',
          icon: 'el-icon-s-tools',
          color: '#E6A23C',
          desc: 'WebAssembly 二进制工具包',
          version: '2.4.1',
          type: 'Toolkit'
        },
        {
          name: 'WAVM',
          icon: 'el-icon-data-board',
          color: '#67C23A',
          desc: '高性能 WebAssembly 虚拟机',
          version: '0.5.0',
          type: 'Runtime'
        }
      ],
      selectedTool: null,
      progress: 0,
      elapsedTime: '00:00',
      logs: [],
      testCases: 0,
      coverage: 0,
      exceptions: 0,
      execSpeed: 0,
      progressColors: [
        { color: '#f56c6c', percentage: 30 },
        { color: '#e6a23c', percentage: 70 },
        { color: '#67c23a', percentage: 100 }
      ],
      // 漏洞分析数据
      vulnData: [
        { name: '内存溢出', value: 35, color: '#F56C6C' },
        { name: '整数溢出', value: 25, color: '#E6A23C' },
        { name: '类型错误', value: 20, color: '#409EFF' },
        { name: '未定义行为', value: 15, color: '#67C23A' },
        { name: '其他', value: 5, color: '#909399' }
      ],
      criticalCount: 8,
      avgResponseTime: 142,
      perfImprovement: 18,
      memoryPeak: 1024,
      memoryThreshold: 1536,
      cpuUsage: 68,
      criticalVulns: [
        {
          id: 'CVE-2023-1234',
          type: '内存溢出',
          severity: '高危',
          location: 'wasm-interpreter.c:Line 245',
          description: '处理嵌套循环时未正确释放内存',
          status: '待修复'
        },
        {
          id: 'CVE-2023-5678',
          type: '整数截断',
          severity: '中危',
          location: 'binary-reader.cc:Line 112',
          description: '32位到64位转换时未检查边界',
          status: '待修复'
        },
        {
          id: 'CVE-2023-9012',
          type: '空指针解引用',
          severity: '高危',
          location: 'validator.cc:Line 78',
          description: '未验证导入段的有效性',
          status: '修复中'
        }
      ]
    }
  },
  computed: {
    logsPerSec () {
      return this.logs.filter(l => Date.now() - l.timestamp < 1000).length
    },
    visibleLogs () {
      return this.logs.slice(-20).reverse()
    }
  },
  methods: {
    selectToolchain (tool) {
      this.selectedTool = tool
      this.currentStep = 1
      this.startFuzzing()
    },

    startFuzzing () {
      const start = Date.now()
      const duration = 20000 // 20秒

      const timer = setInterval(() => {
        const elapsed = Date.now() - start
        this.elapsedTime = new Date(elapsed).toISOString().substr(14, 5)
        // this.progress = Math.min(100, (elapsed / duration) * 100)
        this.progress = parseFloat(Math.min(100, (elapsed / duration) * 100).toFixed(0))

        // 生成测试数据
        this.testCases += Math.floor(Math.random() * 50)
        this.coverage = Math.min(100, this.coverage + Math.random() * 0.5)
        this.execSpeed = 500 + Math.random() * 1500

        // 生成日志
        if (Math.random() > 0.8) {
          this.exceptions++
          this.addLog('error', `检测到异常操作码 0x${Math.random().toString(16).substr(2, 4)}`)
        } else {
          this.addLog('info', `成功执行测试用例 #${this.testCases}`)
        }

        if (elapsed >= duration) {
          clearInterval(timer)
          this.currentStep = 2
          this.initChart()
        }
      }, 200)
    },

    addLog (type, message) {
      this.logs.push({
        id: Date.now(),
        type,
        message,
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now()
      })
    },

    initChart () {
      const chart = echarts.init(this.$refs.chart)
      const option = {
        tooltip: {
          formatter: '{b}: {c}%'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: this.vulnData,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false }
        }]
      }
      chart.setOption(option)
    },

    downloadReport () {
      this.$message.success('测试报告生成完成')
    }
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.dispose()
    }
  }
}
</script>

<style lang="scss" scoped>
.fuzz-testing-page {
  padding: 20px;

  .toolchain-selection {
    max-width: 1000px;
    margin: 0 auto;

    .selection-title {
      text-align: center;
      margin: 40px 0;
      font-size: 28px;
      color: #303133;
    }

    .toolchain-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;

      .tool-card {
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 12px;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .tool-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;

          i {
            font-size: 36px;
            margin-right: 15px;
          }

          h3 {
            font-size: 22px;
            color: #303133;
            margin: 0;
          }
        }

        .tool-desc {
          color: #606266;
          font-size: 14px;
          line-height: 1.8;
          min-height: 60px;
        }

        .tool-stats {
          display: flex;
          gap: 8px;
          margin-top: 15px;

          .el-tag {
            font-size: 12px;
            padding: 0 8px;
            height: 24px;
            line-height: 22px;
          }
        }
      }
    }
  }

  .fuzzing-progress {
    .progress-header {
      text-align: center;
      margin: 30px 0;

      h2 {
        font-size: 24px;
        color: #303133;
        margin-bottom: 15px;
      }

      .el-tag {
        font-size: 14px;
        padding: 0 12px;
        height: 28px;
        line-height: 26px;
      }
    }

    .el-progress {
      display: flex;
      justify-content: center;
      margin: 40px 0;

      .progress-info {
        text-align: center;
        .time {
          font-size: 28px;
          color: #303133;
          font-weight: 600;
        }
        .speed {
          color: #909399;
          font-size: 14px;
          margin-top: 8px;
        }
      }
    }

    .live-stats {
      margin: 40px 0;
    }

    .live-logs {
      margin-top: 30px;
      border-radius: 12px;

      h3 {
        font-size: 18px;
        color: #303133;
        margin-bottom: 15px;
      }

      .log-container {
        height: 200px;
        overflow-y: auto;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;

        .log-item {
          padding: 12px;
          margin: 8px 0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          background: white;
          transition: all 0.2s;

          &.error {
            border-left: 4px solid #F56C6C;
            background: linear-gradient(to right, #fef0f0 10%, white);
          }

          i {
            margin-right: 12px;
            font-size: 18px;
          }

          .timestamp {
            color: #909399;
            font-family: monospace;
            margin-right: 15px;
            font-size: 13px;
          }

          .message {
            font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
            font-size: 13px;
            color: #303133;
          }
        }
      }
    }
  }

  .analysis-result {
    h2 {
      text-align: center;
      font-size: 28px;
      color: #303133;
      margin: 40px 0;
    }

    .detailed-analysis {
      .el-alert {
        margin: 20px 0;
        border-radius: 8px;
      }

      .analysis-sections {
        margin-top: 30px;

        .chart-wrapper {
          display: flex;
          padding: 15px;

          .chart-legend {
            margin-left: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;

            .legend-item {
              display: flex;
              align-items: center;
              margin: 15px 0;
              font-size: 14px;

              .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 4px;
                margin-right: 12px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
            }
          }
        }

        .stats-grid {
          .stat-item {
            padding: 20px;
            margin: 15px 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: all 0.3s;

            &.critical {
              border-left: 4px solid #F56C6C;
              background: linear-gradient(to right, #fef0f0 10%, white);
            }

            label {
              color: #606266;
              font-size: 14px;
              margin-bottom: 8px;
              display: block;
            }

            .stat-value {
              font-size: 26px;
              font-weight: 600;
              color: #303133;
              margin: 12px 0;
            }

            .stat-trend {
              color: #909399;
              font-size: 12px;
              display: flex;
              align-items: center;
              i {
                margin-right: 5px;
              }
            }

            .stat-compare {
              color: #909399;
              font-size: 12px;
              margin-top: 8px;
            }

            &:hover {
              transform: translateY(-3px);
            }
          }
        }
      }

      .vuln-list {
        margin-top: 30px;
        border-radius: 12px;

        h3 {
          font-size: 18px;
          color: #303133;
          margin-bottom: 20px;
        }

        ::v-deep .el-table {
          th {
            background-color: #f8f9fa;
          }
          .el-tag {
            font-size: 12px;
            padding: 0 8px;
            height: 24px;
            line-height: 22px;
          }
        }
      }
    }

    .download-btn {
      margin: 40px auto;
      display: block;
      padding: 15px 50px;
      font-size: 16px;
      border-radius: 30px;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
      }
    }
  }
}
</style>
