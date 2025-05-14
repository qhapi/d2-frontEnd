<template>
  <d2-container class="page">
    <el-steps :active="activeStep" finish-status="success" simple class="steps">
      <el-step title="工具链选择与修复"></el-step>
      <el-step title="测试执行"></el-step>
      <el-step title="结果分析"></el-step>
    </el-steps>

    <div class="main-content">
      <!-- 步骤1：工具链选择+修复进度/日志/统计 -->
      <div v-show="activeStep === 0" class="step1-section">
        <div v-if="step1Stage === 'select'">
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
        <div v-else>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="process-panel">
                <div class="real-time-progress">
                  <h4><i class="el-icon-data-line"></i> 修复进度</h4>
                  <el-progress
                    type="dashboard"
                    :percentage="overallProgress"
                    :color="progressColors">
                    <div class="progress-status">
                      <div v-if="!repairCompleted" class="repairing-text">修复中...</div>
                      <div v-else class="complete-text">修复完成!</div>
                      <div class="time-cost">{{ elapsedTime }}</div>
                    </div>
                  </el-progress>
                </div>
                <el-divider></el-divider>
                <div class="stage-details">
                  <h4><i class="el-icon-timer"></i> 阶段详情</h4>
                  <div class="stage-list">
                    <div
                      v-for="(stage, index) in stages"
                      :key="stage.name"
                      class="stage-item"
                      :class="{ 'active-stage': index === currentStep }">
                      <div class="stage-header">
                        <i :class="stage.icon" :style="{color: stage.color}"></i>
                        <span class="stage-name">{{ stage.name }}</span>
                        <el-tag size="mini" :type="stage.status === 'success' ? 'success' : 'info'">
                          {{ stageStatusText(stage) }}
                        </el-tag>
                      </div>
                      <el-progress
                        :percentage="stage.progress"
                        :stroke-width="8"
                        :color="stage.color"
                        :show-text="false"/>
                    </div>
                  </div>
                </div>
                <el-button v-if="repairCompleted" type="primary" @click="startFuzzing" style="margin-top:20px;width:100%">进入测试执行</el-button>
                <el-button v-else type="text" @click="resetStep1">返回工具链选择</el-button>
              </el-card>
            </el-col>
            <el-col :span="16">
              <el-card class="result-panel">
                <div class="realtime-log">
                  <h4><i class="el-icon-document"></i> 修复日志</h4>
                  <div class="log-container">
                    <div v-for="(log, index) in repairLogs" :key="index" class="log-item">
                      <i class="log-icon" :class="log.type"></i>
                      <span class="log-time">[{{ log.time }}]</span>
                      <span class="log-content">{{ log.content }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="repairCompleted" class="final-result">
                  <el-row :gutter="20" class="result-stats">
                    <el-col :span="8">
                      <div class="stat-card success">
                        <div class="stat-title">漏洞修复</div>
                        <div class="stat-value">{{ fixedVulnerabilities }}/{{ totalVulnerabilities }}</div>
                        <div class="stat-unit">个漏洞已修复</div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="stat-card warning">
                        <div class="stat-title">测试覆盖率</div>
                        <div class="stat-value">{{ testCoverage }}%</div>
                        <div class="stat-unit">代码行覆盖</div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="stat-card info">
                        <div class="stat-title">测试通过率</div>
                        <div class="stat-value">{{ testPassRate }}%</div>
                        <div class="stat-unit">用例通过比例</div>
                      </div>
                    </el-col>
                  </el-row>
                  <div class="action-buttons row-flex">
                    <el-button type="primary" @click="downloadReport" icon="el-icon-download">下载完整报告</el-button>
                  </div>
                </div>
                <div v-else class="repairing-panel">
                  <h3 class="analyzing-title">
                    <i class="el-icon-loading"></i>
                    正在应用修复方案...
                  </h3>
                  <div class="code-compare">
                    <code-diff :old-string="currentPatch.oldCode" :new-string="currentPatch.newCode" output-format="side-by-side" :highlight="true"/>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- 步骤2、3 保持原有逻辑 -->
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
        <div style="margin-top: 32px; text-align: center;">
          <el-button type="default" @click="backToStep1">回退</el-button>
          <el-button type="primary" style="margin-left: 16px;" @click="goStep(2)">下一步</el-button>
        </div>
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
import { CodeDiff } from 'vue-code-diff'
export default {
  components: { CodeDiff },
  data () {
    return {
      activeStep: 0,
      // 步骤1相关
      step1Stage: 'select', // select/repair
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
      // 修复进度相关
      currentStep: 0,
      overallProgress: 0,
      repairCompleted: false,
      elapsedTime: '00:00',
      startTime: null,
      stages: [
        { name: '代码编译', progress: 0, status: 'waiting', icon: 'el-icon-cpu', color: '#409EFF' },
        { name: '补丁应用', progress: 0, status: 'waiting', icon: 'el-icon-magic-stick', color: '#E6A23C' },
        { name: '单元测试', progress: 0, status: 'waiting', icon: 'el-icon-s-check', color: '#67C23A' }
      ],
      progressColors: [
        { color: '#F56C6C', percentage: 30 },
        { color: '#E6A23C', percentage: 70 },
        { color: '#67C23A', percentage: 100 }
      ],
      repairLogs: [],
      fixedVulnerabilities: 1,
      totalVulnerabilities: 1,
      testCoverage: 0,
      testPassRate: 0,
      currentPatch: {
        oldCode: 'function transfer(address _to, uint _value) {\n    balances[msg.sender] -= _value;\n    balances[_to] += _value;\n}',
        newCode: 'using SafeMath for uint;\n\nfunction transfer(address _to, uint _value) {\n    balances[msg.sender] = balances[msg.sender].sub(_value);\n    balances[_to] = balances[_to].add(_value);\n}'
      },
      repairTimer: null,
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
          { 执行次数: 100, 代码覆盖率: 35 },
          { 执行次数: 500, 代码覆盖率: 62 },
          { 执行次数: 1000, 代码覆盖率: 85 }
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
    // 步骤1逻辑
    selectToolchain (tool) {
      this.selectedTool = tool
      this.step1Stage = 'repair'
      this.startRepairProcess()
    },
    resetStep1 () {
      // 回退到工具链选择，重置修复状态
      this.step1Stage = 'select'
      this.selectedTool = null
      this.currentStep = 0
      this.overallProgress = 0
      this.repairCompleted = false
      this.elapsedTime = '00:00'
      this.stages.forEach(s => { s.progress = 0; s.status = 'waiting' })
      this.repairLogs = []
      this.fixedVulnerabilities = 1
      this.totalVulnerabilities = 1
      this.testCoverage = 0
      this.testPassRate = 0
      if (this.repairTimer) clearInterval(this.repairTimer)
    },
    goStep (step) {
      this.activeStep = step
    },
    startRepairProcess () {
      this.startTime = Date.now()
      this.updateElapsedTime()
      if (this.repairTimer) clearInterval(this.repairTimer)
      this.repairTimer = setInterval(() => {
        this.overallProgress = Math.min(this.overallProgress + 3, 100)
        const activeStage = Math.floor(this.overallProgress / 34)
        this.currentStep = Math.min(activeStage, 2)
        if (activeStage <= 2) {
          this.stages[activeStage].progress = Math.min(
            this.stages[activeStage].progress + 10,
            100
          )
          if (this.stages[activeStage].progress >= 100) {
            this.stages[activeStage].status = 'success'
            this.addLog('success', `${this.stages[activeStage].name} 阶段完成`)
            if (activeStage === 2) {
              clearInterval(this.repairTimer)
              this.repairCompleted = true
              this.updateFinalStats()
            }
          } else {
            this.stages[activeStage].status = 'processing'
          }
        }
        if (Math.random() > 0.7) {
          this.addLog('process', this.generateRandomLog(activeStage))
        }
        if (this.overallProgress >= 100) {
          clearInterval(this.repairTimer)
          this.repairCompleted = true
          this.updateFinalStats()
        }
      }, 500)
    },
    addLog (type, content) {
      const types = {
        success: 'el-icon-success color-success',
        error: 'el-icon-error color-error',
        process: 'el-icon-info color-info'
      }
      this.repairLogs.push({
        type: types[type],
        time: new Date().toLocaleTimeString(),
        content
      })
      if (this.repairLogs.length > 100) this.repairLogs.shift()
    },
    generateRandomLog (stage) {
      const stageMessages = {
        0: ['正在编译智能合约', '解决依赖冲突', '优化编译器参数'],
        1: ['应用安全补丁', '验证代码变更', '重构受影响函数'],
        2: ['执行单元测试套件', '生成测试覆盖率报告', '验证边界条件'],
        3: ['执行静态代码分析', '验证漏洞修复', '检查依赖项漏洞']
      }
      const actions = stageMessages[stage] || ['正在处理...']
      return actions[Math.floor(Math.random() * actions.length)]
    },
    updateElapsedTime () {
      setInterval(() => {
        if (!this.repairCompleted) {
          const seconds = Math.floor((Date.now() - this.startTime) / 1000)
          const minutes = Math.floor(seconds / 60)
          this.elapsedTime = `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
        }
      }, 1000)
    },
    updateFinalStats () {
      this.testCoverage = 92.5
      this.testPassRate = 100
    },
    stageStatusText (stage) {
      return {
        waiting: '等待中',
        processing: '进行中',
        success: '已完成'
      }[stage.status]
    },
    downloadReport () {
      this.$message.success('已生成完整修复报告')
    },
    startFuzzing () {
      this.activeStep = 1
      // 清除已有进度
      this.progress.testCases = 0
      this.progress.coverage = 0

      // 新的定时器配置
      const interval = setInterval(() => {
        // 固定增量代替随机增量
        const testStep = 2 // 每次增加2%
        const coverageStep = 1.5 // 每次增加1.5%

        this.progress.testCases = Math.min(100, this.progress.testCases + testStep)
        this.progress.coverage = Math.min(100, this.progress.coverage + coverageStep)

        // 自动跳转到结果页
        if (this.progress.testCases >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            this.activeStep = 2
          }, 500) // 最后0.5秒完成跳转
        }
      }, 100) // 间隔时间缩短到100ms
    },
    severityColor (severity) {
      return {
        高危: 'danger',
        中危: 'warning',
        低危: 'info'
      }[severity]
    },
    showSample (row) {
      this.$alert(`触发样本：${JSON.stringify(row)}`, '输入样本详情', {
        confirmButtonText: '确定'
      })
    },
    backToStep1 () {
      this.activeStep = 0
      // 不重置step1状态，保留修复结果和工具链选择
    }
  },
  beforeDestroy () {
    if (this.repairTimer) clearInterval(this.repairTimer)
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
</style>
