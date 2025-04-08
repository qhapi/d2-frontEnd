<template>
  <d2-container class="page">
    <el-steps :active="activeStep" finish-status="success" simple class="steps">
      <el-step title="测试配置"></el-step>
      <el-step title="测试执行"></el-step>
      <el-step title="结果分析"></el-step>
    </el-steps>

    <div class="main-content">
      <!-- 配置步骤 -->
      <div v-show="activeStep === 0" class="config-section">
        <el-card class="config-card">
          <h3 class="section-title">模糊测试配置</h3>
          <el-form label-width="120px">
            <el-form-item label="目标虚拟机">
              <el-select v-model="config.vmType" placeholder="请选择">
                <el-option label="EVM (以太坊虚拟机)" value="evm"></el-option>
                <el-option label="eWASM" value="ewasm"></el-option>
                <el-option label="Hera (EOS WASM)" value="hera"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="测试强度">
              <el-slider
                v-model="config.testIntensity"
                :marks="{0: '低', 50: '中', 100: '高'}"
                show-stops>
              </el-slider>
            </el-form-item>

            <el-form-item label="输入样本">
              <el-upload
                drag
                action="#"
                :auto-upload="false"
                :file-list="sampleFiles"
                :limit="3">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将种子文件拖到此处，或<em>点击上传</em></div>
                <div slot="tip" class="el-upload__tip">支持.json/.bin/.wasm格式文件</div>
              </el-upload>
            </el-form-item>
          </el-form>

          <el-button 
            type="primary" 
            @click="startFuzzing"
            class="start-btn">
            开始模糊测试
          </el-button>
        </el-card>
      </div>

      <!-- 执行步骤 -->
      <div v-show="activeStep === 1" class="execution-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="progress-card">
              <h3 class="section-title">测试进度</h3>
              <div class="progress-item">
                <label>测试用例数：</label>
                <el-progress 
                  :percentage="progress.testCases"
                  :color="customColors"
                  :format="() => `${progress.testCases}%`">
                </el-progress>
              </div>
              
              <div class="progress-item">
                <label>代码覆盖率：</label>
                <el-progress 
                  :percentage="progress.coverage"
                  :color="customColors"
                  status="success">
                  <span>{{ progress.coverage }}%</span>
                </el-progress>
              </div>

              <div class="stats">
                <el-statistic title="异常触发数" :value="stats.exceptions" />
                <el-statistic title="Gas消耗均值" :value="stats.avgGas" />
                <el-statistic title="执行时间" :value="stats.duration + 's'" />
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="log-card">
              <h3 class="section-title">实时日志</h3>
              <div class="log-content">
                <div v-for="(log, index) in executionLogs" :key="index" class="log-item">
                  <span class="timestamp">[{{ log.timestamp }}]</span>
                  <span :class="log.type">{{ log.message }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 结果步骤 -->
      <div v-show="activeStep === 2" class="result-section">
        <el-card class="result-card">
          <h3 class="section-title">漏洞分析报告</h3>
          
          <div class="vulnerability-list">
            <el-table :data="vulnerabilities" stripe>
              <el-table-column prop="type" label="漏洞类型"></el-table-column>
              <el-table-column prop="count" label="触发次数"></el-table-column>
              <el-table-column label="严重程度">
                <template slot-scope="scope">
                  <el-tag :type="severityColor(scope.row.severity)">
                    {{ scope.row.severity }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="样本">
                <template slot-scope="scope">
                  <el-button 
                    size="mini" 
                    @click="showSample(scope.row)">
                    查看输入
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="analysis-charts">
            <ve-line 
              :data="coverageChartData" 
              :settings="chartSettings"
              height="300px">
            </ve-line>
          </div>
        </el-card>
      </div>
    </div>
  </d2-container>
</template>

<script>
export default {
  data() {
    return {
      activeStep: 0,
      config: {
        vmType: 'evm',
        testIntensity: 50
      },
      sampleFiles: [],
      progress: {
        testCases: 0,
        coverage: 0
      },
      stats: {
        exceptions: 15,
        avgGas: 23456,
        duration: 42
      },
      executionLogs: [
        { timestamp: '10:32:45', type: 'info', message: '初始化模糊测试引擎...' },
        { timestamp: '10:32:47', type: 'success', message: '成功加载3个种子文件' },
        { timestamp: '10:33:12', type: 'error', message: '检测到越界读写异常' }
      ],
      vulnerabilities: [
        { type: '内存越界访问', count: 5, severity: '高危' },
        { type: 'Gas计算异常', count: 3, severity: '中危' },
        { type: '指令解析错误', count: 2, severity: '低危' }
      ],
      coverageChartData: {
        columns: ['执行次数', '代码覆盖率'],
        rows: [
          { '执行次数': 100, '代码覆盖率': 35 },
          { '执行次数': 500, '代码覆盖率': 62 },
          { '执行次数': 1000, '代码覆盖率': 85 }
        ]
      },
      chartSettings: {
        area: true
      },
      customColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 50 },
        { color: '#67c23a', percentage: 100 }
      ]
    }
  },
  methods: {
    startFuzzing() {
      this.activeStep = 1
      // 清除已有进度
      this.progress.testCases = 0
      this.progress.coverage = 0
      
      // 新的定时器配置
      const interval = setInterval(() => {
        // 固定增量代替随机增量
        const testStep = 2  // 每次增加2%
        const coverageStep = 1.5  // 每次增加1.5%

        this.progress.testCases = Math.min(100, this.progress.testCases + testStep)
        this.progress.coverage = Math.min(100, this.progress.coverage + coverageStep)

        // 自动跳转到结果页
        if (this.progress.testCases >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            this.activeStep = 2
          }, 500)  // 最后0.5秒完成跳转
        }
      }, 100)  // 间隔时间缩短到100ms
    },
    severityColor(severity) {
      return {
        '高危': 'danger',
        '中危': 'warning',
        '低危': 'info'
      }[severity]
    },
    showSample(row) {
      this.$alert(`触发样本：${JSON.stringify(row)}`, '输入样本详情', {
        confirmButtonText: '确定'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  .steps {
    margin-bottom: 30px;
  }

  .section-title {
    color: #2c3e50;
    margin-bottom: 20px;
  }

  .config-card {
    max-width: 800px;
    margin: 0 auto;
    
    .start-btn {
      width: 100%;
      margin-top: 20px;
    }
  }

  .progress-card {
    .progress-item {
      margin: 20px 0;
      
      label {
        display: block;
        margin-bottom: 8px;
        color: #606266;
      }
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 30px;
    }
  }

  .log-card {
    height: 500px;
    
    .log-content {
      height: 420px;
      overflow-y: auto;
      
      .log-item {
        padding: 8px 0;
        border-bottom: 1px solid #eee;
        font-family: monospace;

        .timestamp {
          color: #999;
          margin-right: 10px;
        }

        .info { color: #409EFF; }
        .success { color: #67C23A; }
        .error { color: #F56C6C; }
      }
    }
  }

  .analysis-charts {
    margin-top: 30px;
  }
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 20px;
  }
  
  .stats {
    grid-template-columns: 1fr !important;
  }
}
</style>