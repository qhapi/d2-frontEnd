<template>
  <d2-container class="page-container">
    <!-- 步骤导航 -->
    <el-steps :active="activeStep" finish-status="success" simple>
      <el-step title="合约输入"></el-step>
      <el-step title="漏洞定位"></el-step>
      <el-step title="修复方案"></el-step>
      <el-step title="修复完成"></el-step>
    </el-steps>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1：精准漏洞定位与修复（替换为 repair-detail.vue 内容） -->
      <div v-if="activeStep === 0">
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
                <!--<code-diff
                  :old-string="vulnerableCode"
                  :new-string="fixedCode"
                  output-format="side-by-side"
                  class="code-compare"
                  :highlight="true"/> -->

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
                    type="primary"
                    @click="activeStep = 1"
                    icon="el-icon-arrow-right"
                    class="confirm-btn">
                    进入下一步
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
      </div>

      <!-- 步骤2：漏洞定位 -->
      <div v-if="activeStep === 1" class="vulnerability-locate">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="vul-info">
              <div slot="header" class="vul-header">
                <i class="el-icon-warning"></i>
                <span>检测到高危漏洞</span>
              </div>
              <div class="vul-detail">
                <el-tag type="danger">Reentrancy Attack</el-tag>
                <div class="detail-item">
                  <label>危险等级：</label>
                  <span class="danger-level critical">严重</span>
                </div>
                <div class="detail-item">
                  <label>触发交易：</label>
                  <span class="tx-hash">0x3d7...c9a2</span>
                </div>
                <div class="code-snippet">
                  <pre><code class="hljs solidity">function withdraw() public {
    // 🚨 危险：先转账后修改状态
    (bool success, ) = msg.sender.call{value: balance}("");
    require(success);
    balances[msg.sender] = 0;
}</code></pre>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="transaction-list">
              <div slot="header">历史触发交易</div>
              <el-timeline>
                <el-timeline-item
                  v-for="(tx, index) in transactions"
                  :key="index"
                  :timestamp="tx.timestamp">
                  {{ tx.description }}
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
        </el-row>
        <el-button type="primary" @click="activeStep++">进入修复</el-button>
      </div>

      <!-- 步骤3：修复方案 -->
      <div v-if="activeStep === 2" class="code-repair">
        <el-tabs type="border-card">
          <el-tab-pane label="代码对比">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="code-panel vulnerable">
                  <div class="code-title">修复前（有漏洞）</div>
                  <pre><code class="hljs solidity">{{ vulnerableCode }}</code></pre>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="code-panel fixed">
                  <div class="code-title">修复后（已修复）</div>
                  <pre><code class="hljs solidity">{{ fixedCode }}</code></pre>
                </div>
              </el-col>
            </el-row>
            <div class="code-legend">
              <el-tag type="danger">删除/问题代码</el-tag>
              <el-tag type="success">新增/修复代码</el-tag>
            </div>
          </el-tab-pane>
          <el-tab-pane label="修复说明">
            <div class="explanation">
              <h4>修复要点说明：</h4>
              <ul>
                <li><el-tag type="success">新增</el-tag> 重入锁机制</li>
                <li><el-tag type="warning">修改</el-tag> 状态修改顺序</li>
                <li><el-tag>优化</el-tag> 错误处理逻辑</li>
              </ul>
              <el-divider></el-divider>
              <h4>安全建议：</h4>
              <el-alert
                title="使用 OpenZeppelin 的 ReentrancyGuard"
                type="info"
                :closable="false"
                description="建议引入行业标准库来增强合约安全性">
              </el-alert>
            </div>
          </el-tab-pane>
        </el-tabs>
        <el-button type="success" @click="activeStep++">确认修复</el-button>
      </div>

      <!-- 步骤4：修复完成 -->
      <div v-if="activeStep === 3" class="repair-complete">
        <el-result
          icon="success"
          title="修复成功！"
          sub-title="合约已通过安全验证">
          <template slot="extra">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="code-card">
                  <div slot="header" class="card-title danger-title">
                    <i class="el-icon-circle-close"></i>
                    修复前
                  </div>
                  <div class="code-block danger">
                    <pre><code class="hljs solidity">{{ vulnerableHighlight }}</code></pre>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card class="code-card">
                  <div slot="header" class="card-title success-title">
                    <i class="el-icon-circle-check"></i>
                    修复后
                  </div>
                  <div class="code-block success">
                    <pre><code class="hljs solidity">{{ fixedHighlight }}</code></pre>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <div class="action-buttons">
              <el-button type="primary" @click="activeStep=0">重新检测</el-button>
              <el-button @click="$router.push('/locate/vuldatabase')">查看漏洞库</el-button>
            </div>
          </template>
        </el-result>
      </div>
    </div>
  </d2-container>
</template>

<script>
export default {
  data () {
    return {
      activeStep: 0,
      contractAddress: '',
      transactions: [
        { timestamp: '2023-08-15 14:32', description: '异常转账 1.2 ETH' },
        { timestamp: '2023-08-14 09:15', description: '可疑合约调用' }
      ],
      // repair-detail 分析相关数据
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
      vulnerableCode: `pragma solidity ^0.8.0;

contract Vulnerable {
    mapping(address => uint) public balances;
    
    function withdraw() public {
        // 🚨 危险：先转账后修改状态
        (bool success, ) = msg.sender.call{value: balances[msg.sender]}("");
        require(success);
        balances[msg.sender] = 0;
    }
}`,
      fixedCode: `pragma solidity ^0.8.0;

contract Fixed {
    mapping(address => uint) public balances;
    bool private locked; // ✅ 新增重入锁
    
    function withdraw() public {
        require(!locked, "Reentrancy guard");
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;  // ✅ 先修改状态
        locked = true;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        locked = false;
    }
}`,
      vulnerableHighlight: `function withdraw() public {
    // 🚨 危险代码
    (bool success, ) = msg.sender.call{value: balances[msg.sender]}("");
    require(success);
    balances[msg.sender] = 0; // 错误顺序
}`,
      fixedHighlight: `function withdraw() public {
    require(!locked, "Reentrancy guard");
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0; // ✅ 正确顺序
    locked = true;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    locked = false;
}`,
      vulTitle: '算术溢出漏洞 (Integer Overflow)',
      vulCVE: 'CVE-2023-12345',
      vullocate: 'Line 42',
      vulVersions: 'Solidity <0.8.0',
      vulLevel: 4,
      logInterval: null,
      timer: null
    }
  },
  computed: {
    contractAddressValid () {
      return this.contractAddress.length === 42 && this.contractAddress.startsWith('0x')
    },
    currentStepText () {
      const steps = ['代码解析', '模式匹配', '路径验证', '修复建议']
      return steps[this.currentStep] || '准备中'
    }
  },
  watch: {
    activeStep (val) {
      if (val === 0) {
        this.initRepairDetail()
      }
    }
  },
  mounted () {
    if (this.activeStep === 0) {
      this.initRepairDetail()
    }
  },
  methods: {
    handleAnalyze () {
      // 兼容老流程，直接进入 repair-detail 分析
      this.activeStep = 0
      this.initRepairDetail()
    },
    // repair-detail 分析流程
    initRepairDetail () {
      // 重置所有分析相关数据
      this.currentStep = 0
      this.locateProgress = 0
      this.analyzedBlocks = 0
      this.avgTime = 0
      this.scanSpeed = 0
      this.memoryUsage = 0
      this.remainingTime = '计算中...'
      this.locateCompleted = false
      this.currentFunction = ''
      this.analysisLogs = []
      this.currentNode = '1-1'
      if (this.logInterval) clearInterval(this.logInterval)
      if (this.timer) clearInterval(this.timer)
      this.simulateLocation()
    },
    simulateLocation () {
      this.logInterval = setInterval(() => {
        this.addLog('process', '正在分析函数: ' + this.getRandomFunction())
      }, 1500)
      this.timer = setInterval(() => {
        const step = Math.random() * 8 + 4
        this.locateProgress = parseFloat(Math.min(this.locateProgress + step, 100).toFixed(0))
        this.analyzedBlocks = Math.min(Math.floor(this.locateProgress / 3), 32)
        this.scanSpeed = Math.floor(Math.random() * 8000 + 12000)
        this.memoryUsage = (Math.random() * 200 + 50).toFixed(1)
        this.avgTime = Math.floor(Math.random() * 50 + 20)
        this.currentStep = Math.floor(this.locateProgress / 25)
        this.remainingTime = this.calculateRemainingTime()
        if (this.locateProgress >= 100) {
          clearInterval(this.timer)
          clearInterval(this.logInterval)
          this.locateCompleted = true
          this.addLog('success', '漏洞分析完成')
        }
      }, 300)
    },
    addLog (type, content) {
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
      if (this.analysisLogs.length > 50) this.analysisLogs.shift()
    },
    getRandomFunction () {
      const functions = [
        'transfer()', 'approve()', 'mint()',
        'burn()', 'balanceOf()', 'allowance()'
      ]
      return functions[Math.floor(Math.random() * functions.length)]
    },
    calculateRemainingTime () {
      const remaining = (100 - this.locateProgress) * 1000 / this.scanSpeed
      const minutes = Math.floor(remaining / 60)
      const seconds = Math.floor(remaining % 60)
      return `${minutes}分${seconds.toString().padStart(2, '0')}秒`
    },
    confirmFix () {
      this.$confirm('确认应用修复方案并执行验证?', '修复确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.push('/lowlevel-check')
      })
    },
    showMoreDetail () {
      // 打开详细报告逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  .step-content {
    margin-top: 30px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(237, 224, 224, 0.1);
  }

  .contract-input {
    max-width: 600px;
    margin: 50px auto;

    .address-input {
      margin: 30px 0;
    }

    .analyze-btn {
      width: 100%;
      margin-top: 20px;
    }
  }

  .vulnerability-locate {
    .vul-header {
      color: #F56C6C;
      font-weight: bold;

      i {
        margin-right: 8px;
      }
    }

    .vul-detail {
      .detail-item {
        margin: 15px 0;

        label {
          color: #909399;
        }

        .danger-level {
          &.critical {
            color: #F56C6C;
            font-weight: bold;
          }
        }
      }

      pre {
        background: #ffffff !important;  // 改为白色背景
        border: 1px solid #e0e0e0;        // 添加浅灰色边框
        color: #333;           // 改为深色文字
        padding: 15px !important;
        border-radius: 4px;
      }
    }
  }

  .code-repair {
    .code-panel {
      border: 2px solid;
      border-radius: 6px;
      margin-bottom: 20px;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-3px);
      }

      .code-title {
        padding: 12px;
        font-weight: bold;
        font-size: 16px;
      }

      pre {
        padding: 15px;
        margin: 0;
        max-height: 500px;
        overflow-y: auto;
      }

      &.vulnerable {
        border-color: #ffeded;
        background: #fff5f5;

        .code-title {
          background: #fff5f5;
          color: #f56c6c;
        }
      }

      &.fixed {
        border-color: #f0f9eb;
        background: #f8fff0;

        .code-title {
          background: #f0f9eb;
          color: #67c23a;
        }
      }
    }

    .code-legend {
      margin: 20px 0;
      text-align: center;

      .el-tag {
        margin: 0 10px;
        font-size: 14px;
      }
    }
  }

  .repair-complete {
    .code-card {
      margin-bottom: 20px;

      .card-title {
        font-weight: bold;
        font-size: 16px;

        i {
          margin-right: 8px;
        }

        &.danger-title {
          color: #f56c6c;
        }

        &.success-title {
          color: #67c23a;
        }
      }

      .code-block {
        pre {
          padding: 15px;
          border-radius: 4px;
        }

        &.danger {
          border-left: 3px solid #f56c6c;
          background: #fff5f5;
        }

        &.success {
          border-left: 3px solid #67c23a;
          background: #f0f9eb;
        }
      }
    }

    .action-buttons {
      margin-top: 30px;
      text-align: center;
    }
  }
}

// 高亮样式
.hljs {
  background:rgb(255, 255, 255);
  padding: 1em !important;
  border-radius: 4px;

  .hljs-comment {
    color: #999;
  }

  .hljs-keyword {
    color:rgb(245, 235, 244);
  }

  .hljs-built_in {
    color: #569cd6;
  }

  .hljs-string {
    color:rgb(251, 249, 248);
  }

  .hljs-number {
    color: #b5cea8;
  }
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 20px;
  }
}
</style>
