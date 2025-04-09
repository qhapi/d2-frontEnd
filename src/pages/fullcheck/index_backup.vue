<template>
  <d2-container>
    <div class="header-section">
      <h2><i class="el-icon-warning-outline"></i> 智能合约安全检测</h2>
      <el-alert 
        title="支持 Solidity 0.4.24 及以上版本"
        type="info"
        :closable="false"
        class="version-alert"/>
    </div>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧上传/输入区域 -->
      <el-col :span="12" class="input-section">
        <el-card shadow="hover">
          <div class="upload-container">
            <el-upload
              action="#"
              :before-upload="handleUpload"
              :show-file-list="false"
              drag
              accept=".sol">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将合约文件拖到此处，或<em>点击上传</em>
                <div class="el-upload__subtext">支持 .sol 格式文件，大小不超过10MB</div>
              </div>
            </el-upload>
            <div v-if="uploadedFile" class="file-preview">
              <el-tag type="success">
                <i class="el-icon-document"></i>
                {{ uploadedFile.name }} ({{ formatFileSize(uploadedFile.size) }})
              </el-tag>
            </div>
          </div>

          <el-divider><i class="el-icon-edit"></i> 或手动输入代码</el-divider>
          
          <div class="code-editor">
            <el-input
              type="textarea"
              :rows="15"
              v-model="contractCode"
              placeholder="pragma solidity ^0.8.0;

contract Example {
    // 在此输入合约代码..."
              resize="none"
              class="code-input"
              @input="handleCodeInput">
            </el-input>
            <div class="code-stats">
              <el-tag size="mini">行数: {{ codeLines }}</el-tag>
              <el-tag size="mini" type="warning">字符数: {{ codeLength }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧检测结果 -->
      <el-col :span="12" class="result-section">
        <el-card shadow="hover" v-loading="detecting" class="result-card">
          <div v-if="!detectCompleted">
            <h3 class="progress-title"><i class="el-icon-loading"></i> 检测进度</h3>
            <div class="progress-container">
              <el-progress 
                :percentage="progress" 
                :stroke-width="18"
                :status="progressStatus"
                :text-inside="true"
                striped
                animated/>
              <div class="progress-details">
                <div class="stats-item">
                  <span class="label"><i class="el-icon-timer"></i> 已检测行数:</span>
                  <span class="value">{{ scannedLines }} / {{ totalLines }}</span>
                </div>
                <div class="stats-item">
                  <span class="label"><i class="el-icon-cpu"></i> 检测速度:</span>
                  <span class="value">{{ scanSpeed }}</span>
                </div>
                <div class="dynamic-hint">
                  <i class="el-icon-light-rain"></i> {{ currentHint }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="detectCompleted" class="final-result">
            <h3 class="result-title"><i class="el-icon-s-opportunity"></i> 检测结果</h3>
            <el-alert 
              :title="`发现 ${vulnerabilityCount} 处高危漏洞`"
              type="error"
              :closable="false"
              class="result-alert">
              <div class="result-detail">
                <div class="vul-item">
                  <span class="vul-type"><i class="el-icon-warning"></i> {{ vulnerabilityType }}</span>
                  <el-tag effect="dark" type="danger">严重</el-tag>
                </div>
                <el-collapse v-model="activeCollapse" class="vul-details">
                  <el-collapse-item title="漏洞详情" name="1">
                    <div class="detail-item">
                      <label>CVE 编号:</label> 
                      <span class="cve-id">CVE-2023-12345</span>
                    </div>
                    <div class="detail-item">
                      <label>影响位置:</label> 
                      <code>contracts/ERC20.sol:45-52</code>
                    </div>
                    <div class="detail-item">
                      <label>漏洞描述:</label>
                      <p>在算术运算中未使用安全校验，攻击者可通过超大数值输入导致整数溢出...</p>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-alert>

            <div class="risk-assessment">
              <div class="risk-score">
                <span class="label">风险评分:</span>
                <el-rate
                  v-model="riskLevel"
                  disabled
                  :max="5"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"/>
                <span class="score">8.7/10</span>
              </div>
              <div class="time-cost">
                <i class="el-icon-clock"></i> 检测耗时: {{ detectionTime }}
              </div>
            </div>

            <div class="action-buttons">
              <el-button 
                type="primary" 
                @click="showAISuggestion"
                class="ai-button">
                <i class="el-icon-magic-stick"></i> AI快速修复建议
              </el-button>
              <el-button 
                type="warning"
                @click="goToAdvanced"
                class="advanced-button">
                <i class="el-icon-position"></i> 进阶漏洞定位
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI建议对话框 -->
    <el-dialog 
      :title="`${vulnerabilityType} 修复建议`" 
      :visible.sync="showAIDialog"
      width="800px"
      top="5vh">
      <div class="ai-suggestion">
        <el-alert
          title="智能建议基于 OpenZeppelin 最佳实践"
          type="info"
          show-icon
          class="suggestion-alert"/>
        
        <div class="code-compare">
          <h4><i class="el-icon-document-remove"></i> 漏洞代码</h4>
          <pre class="vulnerable-code">function transfer(address to, uint value) public {
    balances[msg.sender] -= value;  // 危险操作
    balances[to] += value;
}</pre>

          <h4><i class="el-icon-document-add"></i> 修复方案</h4>
          <pre class="fixed-code">using SafeMath for uint;

function transfer(address to, uint value) public {
    balances[msg.sender] = balances[msg.sender].sub(value); // 安全操作
    balances[to] = balances[to].add(value);
}</pre>
        </div>

        <div class="implementation-steps">
          <h4><i class="el-icon-guide"></i> 实施步骤</h4>
          <ol>
            <li>安装 OpenZeppelin 库：<code>npm install @openzeppelin/contracts</code></li>
            <li>在合约头部引入 SafeMath：<code>import "@openzeppelin/contracts/utils/math/SafeMath.sol";</code></li>
            <li>声明使用 SafeMath：<code>using SafeMath for uint256;</code></li>
            <li>替换所有算术运算符为 SafeMath 方法</li>
          </ol>
        </div>

        <div class="dialog-actions">
          <el-button 
            type="success"
            @click="copyCode"
            class="copy-button">
            <i class="el-icon-document-copy"></i> 复制修复代码
          </el-button>
        </div>
      </div>
    </el-dialog>
  </d2-container>
</template>

<script>
export default {
  data() {
    return {
      contractCode: '',
      uploadedFile: null,
      codeLines: 0,
      codeLength: 0,
      detecting: false,
      detectCompleted: false,
      progress: 0,
      scanSpeed: '计算中...',
      scannedLines: 0,
      totalLines: Math.floor(Math.random() * 11) + 80,
      showAIDialog: false,
      vulnerabilityType: '数值溢出 (Integer Overflow)',
      vulnerabilityCount: 1,
      riskLevel: 4,
      activeCollapse: ['1'],
      currentHint: '',
      detectionTime: '0分0秒',
      startTime: null,
      hints: [
        '正在解析合约结构...',
        '分析函数调用关系...',
        '检测重入漏洞模式...',
        '验证权限控制逻辑...',
        '扫描算术运算风险...'
      ]
    }
  },
  computed: {
    progressStatus() {
      return this.progress < 100 ? 'success' : 'exception'
    }
  },
  watch: {
    contractCode(newVal) {
      this.codeLines = newVal.split('\n').length
      this.codeLength = newVal.length
    }
  },
  methods: {
    handleUpload(file) {
      this.uploadedFile = file
      this.startDetection()
      return false
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i])
    },
    startDetection() {
      this.detecting = true
      this.startTime = new Date()
      let fakeSpeed = Math.random() * 5000 + 15000
      let hintInterval = setInterval(() => {
        this.currentHint = this.hints[Math.floor(Math.random() * this.hints.length)]
      }, 2000)

      const timer = setInterval(() => {
        if (this.progress >= 100) {
          clearInterval(timer)
          clearInterval(hintInterval)
          this.detectCompleted = true
          this.detecting = false
          this.calculateDetectionTime()
          return
        }

        this.progress += Math.random() * 15
        this.scannedLines = Math.floor(this.totalLines * this.progress / 100)
        this.scanSpeed = `${Math.floor(fakeSpeed / 60)} 行/秒`
        
        if (this.progress > 100) this.progress = 100
      }, 300)
    },
    calculateDetectionTime() {
      const end = new Date()
      const diff = (end - this.startTime) / 1000
      const minutes = Math.floor(diff / 60)
      const seconds = Math.floor(diff % 60)
      this.detectionTime = `${minutes}分${seconds.toString().padStart(2, '0')}秒`
    },
    showAISuggestion() {
      this.showAIDialog = true
    },
    goToAdvanced() {
      this.$router.push('/repair-detail')
    },
    copyCode() {
      const code = `using SafeMath for uint;

function transfer(address to, uint value) public {
    balances[msg.sender] = balances[msg.sender].sub(value);
    balances[to] = balances[to].add(value);
}`
      navigator.clipboard.writeText(code)
      this.$message.success('修复代码已复制到剪贴板')
    },
    handleCodeInput() {
      // 可添加代码语法校验逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
.header-section {
  margin-bottom: 20px;
  .version-alert {
    margin-top: 10px;
  }
}

.main-content {
  margin-top: 20px;
}

.input-section {
  .upload-container {
    margin-bottom: 20px;
    .file-preview {
      margin-top: 10px;
      text-align: center;
    }
  }
  
  .code-editor {
    position: relative;
    .code-stats {
      position: absolute;
      bottom: 10px;
      right: 15px;
      .el-tag {
        margin-left: 5px;
      }
    }
  }
}

.result-section {
  .result-card {
    height: 100%;
    
    .progress-title {
      color: #606266;
      margin-bottom: 20px;
    }
    
    .progress-container {
      .el-progress {
        margin-bottom: 15px;
      }
      
      .progress-details {
        .stats-item {
          margin: 8px 0;
          .label {
            color: #909399;
            margin-right: 10px;
          }
          .value {
            color: #303133;
            font-weight: 500;
          }
        }
        
        .dynamic-hint {
          margin-top: 15px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          color: #606266;
        }
      }
    }
  }
  
  .final-result {
    .result-title {
      color: #303133;
      margin-bottom: 15px;
    }
    
    .vul-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .vul-type {
        margin-right: 10px;
        color: #f56c6c;
      }
    }
    
    .vul-details {
      margin-top: 15px;
      .detail-item {
        margin: 10px 0;
        label {
          color: #909399;
          margin-right: 8px;
        }
        .cve-id {
          color: #f56c6c;
          font-weight: bold;
        }
      }
    }
    
    .risk-assessment {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
      .risk-score {
        display: flex;
        align-items: center;
        .label {
          margin-right: 10px;
        }
        .score {
          margin-left: 15px;
          color: #e6a23c;
          font-weight: bold;
        }
      }
      .time-cost {
        margin-top: 10px;
        color: #909399;
      }
    }
  }
}

.ai-suggestion {
  .code-compare {
    margin: 15px 0;
    pre {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 4px;
      &.vulnerable-code {
        border-left: 3px solid #f56c6c;
      }
      &.fixed-code {
        border-left: 3px solid #67c23a;
      }
    }
  }
  
  .implementation-steps {
    ol {
      padding-left: 20px;
      li {
        margin: 8px 0;
        code {
          background: #f0f2f5;
          padding: 2px 6px;
          border-radius: 3px;
        }
      }
    }
  }
  
  .dialog-actions {
    margin-top: 20px;
    text-align: center;
  }
}

.action-buttons {
  margin-top: 30px;
  text-align: center;
  .el-button {
    margin: 0 10px;
    padding: 12px 25px;
  }
}
</style>