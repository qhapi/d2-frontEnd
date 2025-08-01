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
          <!-- 主界面（移除左侧面板，全宽显示） -->
          <el-col :span="24">
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
        <!-- 多漏洞显示 -->
        <div v-if="vulnerabilities && vulnerabilities.length > 0">
          <div class="vulnerabilities-header">
            <h3><i class="el-icon-warning"></i> 检测到 {{ vulnerabilities.length }} 个漏洞</h3>
          </div>
          
          <el-row :gutter="20">
            <el-col :span="24" v-for="(vulnerability, index) in vulnerabilities" :key="index">
              <el-card class="vul-info" style="margin-bottom: 20px;">
                <div slot="header" class="vul-header">
                  <i class="el-icon-warning"></i>
                  <span>漏洞 {{ index + 1 }}: {{ vulnerability.vulTitle || vulnerability.type }}</span>
                </div>
                <div class="vul-detail">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-tag :type="getVulTagType(vulnerability.vulLevel || getVulLevel(vulnerability.type))">
                        {{ vulnerability.type }}
                      </el-tag>
                      <div class="detail-item">
                        <label>危险等级：</label>
                        <span :class="getDangerLevelClass(vulnerability.vulLevel || getVulLevel(vulnerability.type))">
                          {{ getDangerLevelText(vulnerability.vulLevel || getVulLevel(vulnerability.type)) }}
                        </span>
                        <el-rate
                          :value="vulnerability.vulLevel || getVulLevel(vulnerability.type)"
                          disabled
                          :max="5"
                          :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                          style="margin-left: 10px;"/>
                      </div>
                      <div class="detail-item">
                        <label>漏洞位置：</label>
                        <span class="vul-location">{{ vulnerability.vullocate || `Line ${vulnerability.line}` }}</span>
                      </div>
                      <div class="detail-item" v-if="vulnerability.function">
                        <label>所在函数：</label>
                        <span class="function-name">{{ vulnerability.function }}</span>
                      </div>
                      <div class="detail-item" v-if="vulnerability.vulCVE">
                        <label>CVE 编号：</label>
                        <span class="cve-number">{{ vulnerability.vulCVE }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="vul-description">
                        <label>漏洞描述：</label>
                        <p>{{ vulnerability.description || getVulDescription(vulnerability.type) }}</p>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <!-- 无漏洞或单个漏洞的兜底显示 -->
        <div v-else>
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
        </div>
        
        <div class="action-buttons" style="margin-top: 20px;">
          <el-button type="primary" @click="activeStep++">进入修复</el-button>
          <el-button type="success" style="margin-left: 16px;" :loading="bytecodeRepairing" @click="handleBytecodeRepair">字节码修复</el-button>
        </div>
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
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  data () {
    return {
      taskId: null,
      pollInterval: null,
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
      vulnerabilities: [], // 添加漏洞数组
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
      timer: null,
      hasAnalyzed: false,
      bytecodeRepairing: false
    }
  },
  computed: {
    ...mapState('contract', ['contractFile', 'contractCode', 'uploadedReport']),
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
        this.tryAutoAnalyze()
      }
    }
  },
  mounted () {
    if (this.activeStep === 0) {
      this.tryAutoAnalyze()
    }
  },
  methods: {
    tryAutoAnalyze () {
      console.log('this.contractFile', this.contractFile)
      if (this.contractFile && !this.hasAnalyzed) {
        this.handleAnalyze()
      }
    },
    async handleAnalyze () {
      // 用全局 contractFile/contractCode 发起后端分析
      const formData = new FormData()
      if (this.contractFile) {
        formData.append('file', this.contractFile)
      } else if (this.contractCode) {
        const blob = new Blob([this.contractCode], { type: 'text/plain' })
        formData.append('file', blob, 'contract.sol')
      } else {
        this.$message.error('请先上传或输入合约')
        return
      }
      this.hasAnalyzed = true
      try {
        const response = await axios.post('http://localhost:5010/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        this.taskId = response.data.task_id
        this.startPolling()
        this.resetAnalysisData()
      } catch (error) {
        this.$message.error('分析启动失败: ' + error.message)
        // 启动模拟流程
        this.simulateLocation()
      }
    },
    resetAnalysisData () {
      this.locateProgress = 0
      this.analysisLogs = []
      this.vulnerabilities = []
      this.locateCompleted = false
    },
    startPolling () {
      this.pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`http://localhost:5010/results/${this.taskId}`)
          if (response.data.log) {
            this.parseBackendLog(response.data.log)
          }
          switch (response.data.status) {
            case 'processing':
              this.updateProgressSimulation()
              break
            case 'completed':
              this.handleCompleted(response.data)
              break
            case 'failed':
              this.handleFailure(response.data)
              break
          }
        } catch (error) {
          console.error('获取结果失败:', error)
        }
      }, 2000)
    },
    parseBackendLog (logText) {
      const logs = logText.split('\n').filter(line => line.trim())
      logs.forEach(line => {
        this.addLog('process', line)
      })
    },
    updateProgressSimulation () {
      this.locateProgress = Math.min(this.locateProgress + 5, 95)
      this.analyzedBlocks = Math.floor(this.locateProgress / 3)
    },
    handleCompleted (data) {
      clearInterval(this.pollInterval)
      this.locateProgress = 100
      this.locateCompleted = true
      this.vulnerabilities = data.vulnerabilities.map(vul => ({
        ...vul,
        vulTitle: vul.type,
        vullocate: `Line ${vul.line}`,
        vulCVE: 'CVE-待补充',
        vulLevel: this.getVulLevel(vul.type)
      }))
      this.addLog('success', '漏洞分析完成')
    },
    getVulLevel (type) {
      const levelMap = {
        Reentrancy: 5,
        'Integer Overflow': 4,
        'Unchecked Low Level Call': 3
      }
      return levelMap[type] || 3
    },
    handleFailure (data) {
      clearInterval(this.pollInterval)
      this.$message.error(`分析失败: ${data.log}`)
      this.addLog('error', '分析失败: ' + data.log)
      // 启动模拟流程
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
    calculateRemainingTime () {
      if (!this.scanSpeed || this.scanSpeed === 0) return '计算中...'
      const remaining = (100 - this.locateProgress) * 1000 / this.scanSpeed
      const minutes = Math.floor(remaining / 60)
      const seconds = Math.floor(remaining % 60)
      return `${minutes}分${seconds.toString().padStart(2, '0')}秒`
    },
    addLog (type, content) {
      const iconMap = {
        success: 'el-icon-success color-success',
        warning: 'el-icon-warning color-warning',
        error: 'el-icon-error color-error',
        process: 'el-icon-info color-info'
      }
      this.analysisLogs.push({
        type: iconMap[type] || 'el-icon-info',
        time: new Date().toLocaleTimeString(),
        content
      })
      if (this.analysisLogs.length > 50) this.analysisLogs.shift()
    },
    /*
    handleAnalyze () {
      // 兼容老流程，直接进入 repair-detail 分析
      this.activeStep = 0
      this.initRepairDetail()
    }, */
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
    },
    async handleBytecodeRepair () {
      this.bytecodeRepairing = true
      const formData = new FormData()
      formData.append('contract', this.contractFile)
      if (this.uploadedReport) formData.append('report', this.uploadedReport)
      try {
        // 上传文件
        const uploadRes = await this.$axios.post('http://localhost:5500/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const contractPath = uploadRes.data.contractPath
        const reportPath = uploadRes.data.reportPath // 可能为null
        // 2. 发送分析命令
        const params = {
          contractPath,
          reportPath,
          needCFG: true
        }
        const res = await this.$axios.post('http://localhost:5500/api/analyze', params)
        console.log(res)
        // 3. 跳转到详情页，传递结果文件路径
        this.$router.push({
          path: '/locate/repair-detail',
          query: {
            bugs: res.data.bugsPath,
            report: res.data.reportPath,
            pdfOriginal: res.data.pdfOriginal,
            pdfPatched: res.data.pdfPatched,
            pdfConstructorOriginal: res.data.pdfConstructorOriginal,
            pdfConstructorPatched: res.data.pdfConstructorPatched
          }
        })
      } catch (e) {
        this.$message.error('检测失败: ' + (e.response?.data?.message || e.message))
        this.status = 'init'
      } finally {
        this.bytecodeRepairing = false
      }
    },
    // 新增辅助方法用于多漏洞显示
    getVulTagType (level) {
      if (level >= 4) return 'danger'
      if (level >= 3) return 'warning'
      return 'info'
    },
    getDangerLevelClass (level) {
      if (level >= 4) return 'danger-level critical'
      if (level >= 3) return 'danger-level high'
      if (level >= 2) return 'danger-level medium'
      return 'danger-level low'
    },
    getDangerLevelText (level) {
      if (level >= 4) return '严重'
      if (level >= 3) return '高危'
      if (level >= 2) return '中危'
      return '低危'
    },
    getVulDescription (type) {
      const descriptions = {
        'Reentrancy': '重入攻击漏洞，攻击者可以在函数执行过程中重复调用该函数，可能导致资金被多次提取。',
        'Integer Overflow': '整数溢出漏洞，当数值超出变量类型的最大值时会发生溢出，可能导致意外的计算结果。',
        'Unchecked Low Level Call': '未检查的低级调用，call()函数的返回值未被检查，可能导致静默失败。',
        'Timestamp Dependence': '时间戳依赖漏洞，合约逻辑依赖于区块时间戳，矿工可以在一定范围内操纵时间戳。',
        'Tx.Origin Authentication': 'tx.origin认证漏洞，使用tx.origin进行身份验证容易受到钓鱼攻击。'
      }
      return descriptions[type] || '未知漏洞类型，建议进一步分析代码逻辑。'
    }
  },
  beforeDestroy () {
    clearInterval(this.pollInterval)
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
    .vulnerabilities-header {
      margin-bottom: 20px;
      
      h3 {
        color: #F56C6C;
        font-weight: bold;
        
        i {
          margin-right: 8px;
        }
      }
    }

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
          font-weight: bold;
          margin-right: 8px;
        }

        .danger-level {
          font-weight: bold;
          
          &.critical {
            color: #F56C6C;
          }
          
          &.high {
            color: #E6A23C;
          }
          
          &.medium {
            color: #F7BA2A;
          }
          
          &.low {
            color: #67C23A;
          }
        }
        
        .vul-location, .function-name, .cve-number {
          font-family: 'Courier New', monospace;
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
        }
      }
      
      .vul-description {
        margin-top: 15px;
        
        label {
          color: #909399;
          font-weight: bold;
          display: block;
          margin-bottom: 8px;
        }
        
        p {
          color: #606266;
          line-height: 1.6;
          margin: 0;
        }
      }

      pre {
        background: #ffffff !important;
        border: 1px solid #e0e0e0;
        color: #333;
        padding: 15px !important;
        border-radius: 4px;
      }
    }
    
    .action-buttons {
      text-align: center;
      margin-top: 30px;
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
