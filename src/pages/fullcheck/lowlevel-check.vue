<template>
  <d2-container>
    <!-- 头部步骤指示 -->
    <div class="header-section">
      <h2><i class="el-icon-success"></i> 修复验证报告</h2>
      <el-steps :active="currentStep" align-center class="process-steps">
        <el-step title="编译验证" description="验证代码可编译性"></el-step>
        <el-step title="漏洞修复" description="应用安全补丁"></el-step>
        <el-step title="单元测试" description="验证功能完整性"></el-step>
      </el-steps>
    </div>

    <!-- 主体内容 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧修复过程面板 -->
      <el-col :span="8">
        <el-card class="process-panel">
          <!-- 实时进度 -->
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

          <!-- 阶段详情 -->
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
                  <el-tag 
                    size="mini" 
                    :type="stage.status === 'success' ? 'success' : 'info'">
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
        </el-card>
      </el-col>

      <!-- 右侧修复结果 -->
      <el-col :span="16">
        <el-card class="result-panel">
          <!-- 实时日志 -->
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

          <!-- 修复完成显示区域 -->
          <div v-if="repairCompleted" class="final-result">
            <!-- 统计卡片 -->
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

            <!-- 测试用例表格 -->
            <div class="test-results">
              <h4><i class="el-icon-s-check"></i> 测试用例验证</h4>
              <el-table
                :data="testCases"
                style="width: 100%"
                :row-class-name="tableRowClassName">
                <el-table-column prop="name" label="测试用例"></el-table-column>
                <el-table-column label="状态" width="120">
                  <template slot-scope="{row}">
                    <el-tag :type="row.status === '通过' ? 'success' : 'danger'">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="time" label="耗时" width="100"></el-table-column>
                <el-table-column label="详情" width="120">
                  <template slot-scope="{row}">
                    <el-button 
                      size="mini" 
                      @click="showTestDetail(row)"
                      type="text">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 操作按钮区域 -->
            <div class="action-buttons">
              <el-button 
                type="primary" 
                @click="downloadReport"
                icon="el-icon-download">
                下载完整报告
              </el-button>
              <el-button 
                type="success"
                @click="goToNewPage"
                icon="el-icon-finished">
                前往下一阶段
              </el-button>
            </div>
          </div>

          <!-- 修复进行中显示 -->
          <div v-else class="repairing-panel">
            <h3 class="analyzing-title">
              <i class="el-icon-loading"></i> 
              正在应用修复方案...
            </h3>
            <div class="code-compare">
              <code-diff
                :old-string="currentPatch.oldCode"
                :new-string="currentPatch.newCode"
                output-format="side-by-side"
                :highlight="true"/>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 测试详情对话框 -->
    <el-dialog
      title="测试用例详情"
      :visible.sync="testDetailVisible"
      width="60%">
      <div v-if="selectedTest" class="test-detail">
        <h3>{{ selectedTest.name }}</h3>
        <el-tag :type="selectedTest.status === '通过' ? 'success' : 'danger'">
          {{ selectedTest.status }}
        </el-tag>
        
        <div class="test-info">
          <p><strong>测试类型：</strong>{{ selectedTest.type }}</p>
          <p><strong>执行时间：</strong>{{ selectedTest.time }}</p>
          <p><strong>断言结果：</strong></p>
          <ul>
            <li v-for="(assertion, idx) in selectedTest.assertions" :key="idx">
              <i :class="assertion.success ? 'el-icon-success' : 'el-icon-error'"></i>
              {{ assertion.description }}
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </d2-container>
</template>

<script>
import { CodeDiff } from 'vue-code-diff'

export default {
  components: { CodeDiff },
  data() {
    return {
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
      testDetailVisible: false,
      selectedTest: null,
      fixedVulnerabilities: 1,
      totalVulnerabilities: 1,
      testCoverage: 0,
      testPassRate: 0,
      testCases: [],
      currentPatch: {
        oldCode: `function transfer(address _to, uint _value) {
    balances[msg.sender] -= _value;
    balances[_to] += _value;
}`,
        newCode: `using SafeMath for uint;

function transfer(address _to, uint _value) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
}`
      }
    }
  },
  mounted() {
    this.startRepairProcess()
  },
  methods: {
    startRepairProcess() {
      this.startTime = Date.now()
      this.updateElapsedTime()
      
      const timer = setInterval(() => {
        this.overallProgress = Math.min(this.overallProgress + 3, 100)
        
        // 调整阶段计算逻辑（每个阶段约33%）
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
            
            // 在单元测试阶段完成后结束
            if (activeStage === 2) {
              clearInterval(timer)
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
          clearInterval(timer)
          this.repairCompleted = true
          this.updateFinalStats()
        }
      }, 500)
      
      this.testCases = this.generateTestCases()
    },
    generateTestCases() {
      return [
        { 
          name: '转账功能基础测试', 
          status: '通过', 
          time: '1.2s',
          type: '功能测试',
          assertions: [
            { description: '余额正确扣除', success: true },
            { description: '接收方余额增加', success: true }
          ]
        },
        { 
          name: '大额转账溢出测试', 
          status: '通过', 
          time: '2.8s',
          type: '安全测试',
          assertions: [
            { description: '溢出防护生效', success: true },
            { description: '交易回滚验证', success: true }
          ]
        }
      ]
    },
    addLog(type, content) {
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
    generateRandomLog(stage) {
      const stageMessages = {
        0: ['正在编译智能合约', '解决依赖冲突', '优化编译器参数'],
        1: ['应用安全补丁', '验证代码变更', '重构受影响函数'],
        2: ['执行单元测试套件', '生成测试覆盖率报告', '验证边界条件'],
        3: ['执行静态代码分析', '验证漏洞修复', '检查依赖项漏洞']
      }
      const actions = stageMessages[stage] || ['正在处理...']
      return actions[Math.floor(Math.random() * actions.length)]
    },
    updateElapsedTime() {
      setInterval(() => {
        if (!this.repairCompleted) {
          const seconds = Math.floor((Date.now() - this.startTime) / 1000)
          const minutes = Math.floor(seconds / 60)
          this.elapsedTime = `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
        }
      }, 1000)
    },
    updateFinalStats() {
      this.testCoverage = 92.5
      this.securityScore = 9.3
      this.scoreImprovement = 35
      this.testPassRate = 100
    },
    stageStatusText(stage) {
      return {
        waiting: '等待中',
        processing: '进行中',
        success: '已完成'
      }[stage.status]
    },
    tableRowClassName({row}) {
      return row.status === '运行中' ? 'warning-row' : ''
    },
    showTestDetail(row) {
      this.selectedTest = row
      this.testDetailVisible = true
    },
    downloadReport() {
      this.$message.success('已生成完整修复报告')
    },
    returnToScan() {
      this.$router.push('/vulnerability-scan')
    },
    goToNewPage() {
      this.$router.push('/new')
    }
  }
}
</script>

<style lang="scss" scoped>
.header-section {
  margin-bottom: 20px;
  .process-steps {
    margin: 20px 0;
    ::v-deep .el-step__title {
      font-size: 16px;
    }
  }
}

.main-content {
  .process-panel {
    height: calc(100vh - 200px);
    .progress-status {
      text-align: center;
      .repairing-text {
        color: #409EFF;
        font-size: 18px;
        font-weight: 500;
      }
      .complete-text {
        color: #67C23A;
        font-size: 18px;
        font-weight: 500;
      }
      .time-cost {
        color: #909399;
        margin-top: 8px;
        font-size: 14px;
      }
    }

    .stage-details {
      margin-top: 20px;
      .stage-list {
        max-height: 300px;
        overflow-y: auto;
        padding-right: 10px;
        
        .stage-item {
          margin: 15px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          transition: all 0.3s;
          border: 1px solid #ebeef5;

          &.active-stage {
            border-color: #409EFF;
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
          }

          .stage-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            i {
              font-size: 20px;
              margin-right: 10px;
            }
            .stage-name {
              flex: 1;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .result-panel {
    height: calc(100vh - 200px);
    
    .realtime-log {
      height: 200px;
      margin-bottom: 20px;
      .log-container {
        height: 160px;
        overflow-y: auto;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        padding: 10px;
        background: #fafafa;
        
        .log-item {
          padding: 8px 0;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #eee;
          &:last-child {
            border-bottom: none;
          }
          .log-icon {
            font-size: 16px;
            margin-right: 8px;
            &.color-success { color: #67C23A; }
            &.color-error { color: #F56C6C; }
            &.color-info { color: #909399; }
          }
          .log-time {
            color: #909399;
            font-family: monospace;
            margin-right: 10px;
          }
        }
      }
    }

    .result-stats {
      margin: 20px 0;
      .stat-card {
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        transition: transform 0.3s;
        &:hover {
          transform: translateY(-3px);
        }
        &.success { 
          background: linear-gradient(45deg, #f0f9eb, #e1f3d8);
          border: 1px solid #c2e7b0;
        }
        &.warning { 
          background: linear-gradient(45deg, #fdf6ec, #faecd8);
          border: 1px solid #f0d19c;
        }
        &.info { 
          background: linear-gradient(45deg, #f4f4f5, #e9e9eb);
          border: 1px solid #d3d4d6;
        }
        .stat-title {
          color: #606266;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          margin: 12px 0;
          color: #303133;
        }
        .stat-unit {
          color: #909399;
          font-size: 12px;
        }
      }
    }

    .test-results {
      margin-top: 20px;
      ::v-deep .warning-row {
        background-color: #fffbf0;
        td {
          border-bottom-color: #faecd8;
        }
      }
    }

    .action-buttons {
      margin-top: 30px;
      text-align: center;
      .el-button {
        margin: 0 10px;
        padding: 12px 24px;
        font-size: 14px;
        border-radius: 20px;
        transition: all 0.3s;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      }
    }
  }
}

.test-detail {
  .test-info {
    margin-top: 15px;
    p {
      margin: 12px 0;
      font-size: 14px;
    }
    ul {
      padding-left: 25px;
      li {
        margin: 8px 0;
        display: flex;
        align-items: center;
        i {
          margin-right: 8px;
          font-size: 16px;
          &.el-icon-success { color: #67C23A; }
          &.el-icon-error { color: #F56C6C; }
        }
      }
    }
  }
}
</style>