<template>
  <d2-container>
    <div class="header-section">
      <h2><i class="el-icon-aim"></i> 精准漏洞定位与修复</h2>
      <el-steps :active="currentStep" align-center class="process-steps">
        <el-step title="代码解析" description="解构智能合约代码"></el-step>
        <el-step title="模式匹配" description="匹配已知漏洞模式"></el-step>
        <el-step title="路径验证" description="验证漏洞触发路径"></el-step>
        <el-step title="修复建议" description="生成修复方案"></el-step>
      </el-steps>
    </div>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧分析过程 -->
      <el-col :span="8">
        <el-card class="analysis-panel">
          <div class="real-time-stats">
            <h4><i class="el-icon-data-analysis"></i> 实时分析统计</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-title">完成进度</div>
                <el-progress 
                  type="dashboard" 
                  :percentage="locateProgress"
                  :color="progressColors">
                  <span class="progress-text">{{ locateProgress }}%</span>
                </el-progress>
              </div>
              
              <div class="stat-item">
                <div class="stat-title">已检测函数</div>
                <div class="stat-value">{{ analyzedBlocks }}/{{ totalBlocks }}</div>
                <div class="stat-sub">平均耗时 {{ avgTime }}ms/个</div>
              </div>
            </div>
          </div>

          <el-divider></el-divider>

          <div class="code-structure">
            <h4><i class="el-icon-files"></i> 代码结构分析</h4>
            <el-tree
              :data="codeStructure"
              :props="treeProps"
              :highlight-current="true"
              node-key="id"
              :current-node-key="currentNode"
              class="structure-tree">
              <span slot-scope="{ node }" class="tree-node">
                <i :class="node.icon"></i>
                <span>{{ node.label }}</span>
                <el-tag v-if="node.risk" size="mini" type="danger">高危</el-tag>
              </span>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧主界面 -->
      <el-col :span="16">
        <el-card class="main-panel">
          <!-- 分析日志 -->
          <div class="analysis-log">
            <h4><i class="el-icon-notebook-2"></i> 分析日志</h4>
            <div class="log-container">
              <div v-for="(log, index) in analysisLogs" :key="index" class="log-item">
                <i class="log-icon" :class="log.type"></i>
                <span class="log-time">[{{ log.time }}]</span>
                <span class="log-content">{{ log.content }}</span>
              </div>
            </div>
          </div>

          <!-- 漏洞对比 -->
          <div v-if="locateCompleted" class="vulnerability-compare">
            <h4><i class="el-icon-warning-outline"></i> 漏洞修复对比</h4>
            <code-diff
              :old-string="vulnerableCode"
              :new-string="fixedCode"
              output-format="side-by-side"
              class="code-compare"
              :highlight="true"/>
            
            <div class="vul-description">
              <el-alert :title="vulTitle" type="error" :closable="false">
                <div class="vul-info">
                  <p><strong>CVE 编号:</strong> {{ vulCVE }}</p>
                  <p><strong>漏洞位置:</strong> {{ vullocate }}</p>
                  <p><strong>影响版本:</strong> {{ vulVersions }}</p>
                  <p><strong>风险等级:</strong> 
                    <el-rate
                      v-model="vulLevel"
                      disabled
                      :max="5"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"/>
                  </p>
                </div>
              </el-alert>
            </div>

            <div class="action-buttons">
              <el-button 
                type="success" 
                @click="confirmFix"
                icon="el-icon-check"
                class="confirm-btn">
                确认修复并验证
              </el-button>
              <el-button 
                type="info"
                @click="showMoreDetail"
                icon="el-icon-document">
                查看完整报告
              </el-button>
            </div>
          </div>

          <!-- 分析中状态 -->
          <div v-else class="analyzing-panel">
            <h3 class="analyzing-title">
              <i class="el-icon-loading"></i> 
              深度分析进行中...
            </h3>
            <el-progress 
              :percentage="locateProgress"
              :stroke-width="16"
              striped
              animated>
              <template #default>
                <div class="progress-detail">
                  <span class="current-step">{{ currentStepText }}</span>
                  <span class="analyzed-func">正在分析: {{ currentFunction }}</span>
                </div>
              </template>
            </el-progress>

            <div class="runtime-stats">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="stat-box">
                    <div class="stat-label">检测速度</div>
                    <div class="stat-value">{{ scanSpeed }} 行/秒</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-box">
                    <div class="stat-label">内存占用</div>
                    <div class="stat-value">{{ memoryUsage }} MB</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-box">
                    <div class="stat-label">预计剩余时间</div>
                    <div class="stat-value">{{ remainingTime }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </d2-container>
</template>

<script>
import { CodeDiff } from 'vue-code-diff'

export default {
  components: { CodeDiff },
  data() {
    return {
      currentStep: 0,
      locateProgress: 0,
      analyzedBlocks: 0,
      totalBlocks: 32,
      avgTime: 0,
      scanSpeed: 0,
      memoryUsage: 0,
      remainingTime: '计算中...',
      locateCompleted: false,
      currentFunction: '',
      currentNode: '1-1',
      progressColors: [
        { color: '#f56c6c', percentage: 30 },
        { color: '#e6a23c', percentage: 70 },
        { color: '#67c23a', percentage: 100 }
      ],
      codeStructure: [
        {
          id: '1',
          label: 'ERC20Token',
          icon: 'el-icon-folder-opened',
          children: [
            { id: '1-1', label: 'transfer()', icon: 'el-icon-document', risk: true },
            { id: '1-2', label: 'balanceOf()', icon: 'el-icon-document' }
          ]
        }
      ],
      treeProps: {
        label: 'label',
        children: 'children'
      },
      analysisLogs: [],
      vulnerableCode: `function transfer(address _to, uint _value) {
    balances[msg.sender] -= _value;
    balances[_to] += _value;
}`,
      fixedCode: `using SafeMath for uint;

function transfer(address _to, uint _value) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
}`,
      vulTitle: '算术溢出漏洞 (Integer Overflow)',
      vulCVE: 'CVE-2023-12345',
      vullocate: 'Line 42',
      vulVersions: 'Solidity <0.8.0',
      vulLevel: 4
    }
  },
  computed: {
    currentStepText() {
      const steps = ['代码解析', '模式匹配', '路径验证', '修复建议']
      return steps[this.currentStep] || '准备中'
    }
  },
  mounted() {
    this.simulateLocation()
  },
  methods: {
    simulateLocation() {
      let startTime = Date.now()
      let logInterval = setInterval(() => {
        this.addLog('process', '正在分析函数: ' + this.getRandomFunction())
      }, 1500)

      const timer = setInterval(() => {
        const step = Math.random() * 8 + 4
        this.locateProgress = parseFloat(Math.min(this.locateProgress + step, 100).toFixed(0))
        
        this.analyzedBlocks = Math.min(Math.floor(this.locateProgress / 3),32)
        this.scanSpeed = Math.floor(Math.random() * 8000 + 12000)
        this.memoryUsage = (Math.random() * 200 + 50).toFixed(1)
        this.avgTime = Math.floor(Math.random() * 50 + 20)
        this.currentStep = Math.floor(this.locateProgress / 25)
        this.remainingTime = this.calculateRemainingTime()

        if (this.locateProgress >= 100) {
          clearInterval(timer)
          clearInterval(logInterval)
          this.locateCompleted = true
          this.addLog('success', '漏洞分析完成')
        }
      }, 300)
    },
    addLog(type, content) {
      const types = {
        success: 'el-icon-success color-success',
        warning: 'el-icon-warning color-warning',
        error: 'el-icon-error color-error',
        process: 'el-icon-info color-info'
      }
      this.analysisLogs.push({
        type: types[type],
        time: new Date().toLocaleTimeString(),
        content
      })
      // 保持最多50条日志
      if (this.analysisLogs.length > 50) this.analysisLogs.shift()
    },
    getRandomFunction() {
      const functions = [
        'transfer()', 'approve()', 'mint()', 
        'burn()', 'balanceOf()', 'allowance()'
      ]
      return functions[Math.floor(Math.random() * functions.length)]
    },
    calculateRemainingTime() {
      const remaining = (100 - this.locateProgress) * 1000 / this.scanSpeed
      const minutes = Math.floor(remaining / 60)
      const seconds = Math.floor(remaining % 60)
      return `${minutes}分${seconds.toString().padStart(2, '0')}秒`
    },
    confirmFix() {
      this.$confirm('确认应用修复方案并执行验证?', '修复确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.push('/lowlevel-check')
      })
    },
    showMoreDetail() {
      // 打开详细报告逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
.header-section {
  margin-bottom: 20px;
  .process-steps {
    margin: 20px 0;
    ::v-deep .el-step__head.is-process {
      color: #409EFF;
      border-color: #409EFF;
    }
  }
}

.main-content {
  .analysis-panel {
    height: calc(100vh - 200px);
    overflow-y: auto;
    
    .stats-grid {
      display: grid;
      gap: 15px;
      margin: 15px 0;
      
      .stat-item {
        padding: 15px;
        border-radius: 8px;
        background: #f8f9fa;
        
        .stat-title {
          color: #606266;
          margin-bottom: 10px;
        }
        
        .stat-value {
          font-size: 24px;
          color: #303133;
          font-weight: bold;
        }
        
        .stat-sub {
          color: #909399;
          font-size: 12px;
        }
      }
    }
    
    .structure-tree {
      margin-top: 10px;
      .tree-node {
        display: flex;
        align-items: center;
        .el-tag {
          margin-left: 10px;
        }
      }
    }
  }

  .main-panel {
    height: calc(100vh - 200px);
    
    .analysis-log {
      .log-container {
        height: 200px;
        overflow-y: auto;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        padding: 10px;
        
        .log-item {
          padding: 5px 0;
          display: flex;
          align-items: center;
          
          .log-icon {
            margin-right: 8px;
            font-size: 16px;
            
            &.color-success { color: #67C23A; }
            &.color-warning { color: #E6A23C; }
            &.color-error { color: #F56C6C; }
            &.color-info { color: #909399; }
          }
          
          .log-time {
            color: #909399;
            margin-right: 10px;
          }
        }
      }
    }

    .analyzing-panel {
      margin-top: 20px;
      
      .analyzing-title {
        color: #409EFF;
        text-align: center;
        margin: 20px 0;
      }
      
      .progress-detail {
        display: flex;
        justify-content: space-between;
        padding: 0 20px;
        
        .current-step {
          color: #67C23A;
        }
        
        .analyzed-func {
          color: #606266;
        }
      }
      
      .runtime-stats {
        margin-top: 25px;
        
        .stat-box {
          text-align: center;
          padding: 15px;
          border-radius: 8px;
          background: #f8f9fa;
          
          .stat-label {
            color: #909399;
            margin-bottom: 5px;
          }
          
          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }

    .vulnerability-compare {
      margin-top: 20px;
      
      .vul-description {
        margin: 20px 0;
        
        .vul-info {
          p {
            margin: 8px 0;
          }
        }
      }
      
      .action-buttons {
        margin-top: 25px;
        text-align: center;
        
        .confirm-btn {
          padding: 15px 30px;
          font-size: 16px;
        }
      }
    }
  }
}

.code-compare {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin: 15px 0;
}
</style>