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
      <!-- 左侧输入区域 -->
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
    // 在此输入合约代码...}"
              resize="none"
              class="code-input">
            </el-input>
            <transition name="el-zoom-in-top">
              <div v-if="hasContent" class="code-stats">
                <el-tag size="mini">行数: {{ codeLines }}</el-tag>
                <el-tag size="mini" type="warning">字符数: {{ codeLength }}</el-tag>
              </div>
            </transition>
          </div>

          <el-button 
            type="primary" 
            @click="startDetection"
            :disabled="!hasContent || detecting"
            class="start-button">
            {{ detecting ? '检测进行中...' : '开始检测' }}
          </el-button>
        </el-card>
      </el-col>

      <!-- 右侧结果区域 -->
      <el-col :span="12" class="result-section">
        <el-card shadow="hover" class="result-card">
          <!-- 初始状态 -->
          <div v-if="status === 'init'" class="status-prompt">
            <i class="el-icon-document-checked"></i>
            <p>请上传或输入合约代码开始安全检测</p>
          </div>

          <!-- 检测中 -->
          <div v-if="status === 'detecting'">
            <h3 class="progress-title"><i class="el-icon-loading"></i> 检测进度</h3>
            <div class="progress-container">
              <el-progress 
                :percentage="progress" 
                :stroke-width="18"
                :text-inside="true"
                striped
                :color="progressColor"/>
              
              <div class="progress-details">
                <div class="stats-grid">
                  <div class="stats-item">
                    <span class="label"><i class="el-icon-timer"></i> 已检测行数</span>
                    <span class="value">{{ scannedLines }} / {{ totalLines }}</span>
                  </div>
                  <div class="stats-item">
                    <span class="label"><i class="el-icon-cpu"></i> 检测速度</span>
                    <span class="value">{{ scanSpeed }} 行/秒</span>
                  </div>
                </div>
                
                <div class="dynamic-hint">
                  <i class="el-icon-chat-dot-round"></i> {{ currentHint }}
                </div>
              </div>
            </div>
          </div>

          <!-- 检测完成 -->
          <div v-if="status === 'completed'" class="final-result">
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
      status: 'init', // init/detecting/completed
      hasContent: false,
      progress: 0,
      scanSpeed: 0,
      scannedLines: 0,
      totalLines: 0,
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
    progressColor() {
      return [
        { color: '#409EFF', percentage: 30 },
        { color: '#67C23A', percentage: 70 },
        { color: '#E6A23C', percentage: 100 }
      ]
    }
  },
  watch: {
    contractCode(newVal) {
      this.hasContent = newVal.length > 0
      this.codeLines = newVal.split('\n').length
      this.codeLength = newVal.replace(/\s/g, '').length
    }
  },
  methods: {
    handleUpload(file) {
      if (file.size > 10 * 1024 * 1024) {
        this.$message.error('文件大小超过10MB限制')
        return false
      }
      
      this.uploadedFile = file
      const reader = new FileReader()
      reader.onload = (e) => {
        this.contractCode = e.target.result
      }
      reader.readAsText(file)
      return false
    },

    startDetection() {
      this.status = 'detecting'
      this.progress = 0
      this.scannedLines = 0
      this.totalLines = this.codeLines
      this.startTime = new Date()
      
      // 模拟检测过程
      const hintInterval = setInterval(() => {
        this.currentHint = this.hints[Math.floor(Math.random() * this.hints.length)]
      }, 2500)

      const timer = setInterval(() => {
        const step = Math.random() * 8 + 4
        this.progress = parseFloat(Math.min(this.progress + step, 100).toFixed(0))
        
        this.scannedLines = Math.floor(this.totalLines * this.progress / 100)
        this.scanSpeed = Math.floor(Math.random() * 8000 + 12000)
        
        if (this.progress >= 100) {
          clearInterval(timer)
          clearInterval(hintInterval)
          this.status = 'completed'
          this.calculateDetectionTime()
        }
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

    copyCode() {
      const code = `using SafeMath for uint;

function transfer(address to, uint value) public {
    balances[msg.sender] = balances[msg.sender].sub(value);
    balances[to] = balances[to].add(value);
}`
      navigator.clipboard.writeText(code)
      this.$message.success('修复代码已复制到剪贴板')
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i])
    },

    goToAdvanced() {
      this.$router.push('/repair-detail')
    }
  }
}
</script>

<style lang="scss" scoped>
.header-section {
  margin-bottom: 20px;
  h2 {
    color: #303133;
    margin-bottom: 10px;
  }
  .version-alert {
    margin-top: 10px;
    width: fit-content;
  }
}

.main-content {
  margin-top: 20px;
  .el-col {
    transition: all 0.3s;
  }
}

.input-section {
  .upload-container {
    margin-bottom: 20px;
    .file-preview {
      margin-top: 10px;
      text-align: center;
      .el-tag {
        max-width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  
  .code-editor {
    position: relative;
    margin-bottom: 15px;
    
    .code-stats {
      margin-top: 10px;
      text-align: right;
      .el-tag {
        margin-left: 8px;
        font-family: monospace;
      }
    }
  }
  
  .start-button {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
    letter-spacing: 1px;
  }
}

.result-section {
  .result-card {
    min-height: 680px;
    
    .status-prompt {
      text-align: center;
      padding: 60px 0;
      color: #909399;
      i {
        font-size: 48px;
        color: #C0C4CC;
        margin-bottom: 20px;
      }
      p {
        font-size: 16px;
        margin: 0;
      }
    }

    .progress-title {
      color: #409EFF;
      text-align: center;
      margin: 20px 0 30px;
      i {
        margin-right: 8px;
      }
    }

    .progress-container {
      padding: 0 20px;
      
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin: 25px 0;
        
        .stats-item {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 12px;
          .label {
            color: #606266;
            display: block;
            margin-bottom: 6px;
            i {
              margin-right: 5px;
            }
          }
          .value {
            font-size: 18px;
            color: #303133;
            font-weight: 600;
          }
        }
      }
      
      .dynamic-hint {
        margin-top: 25px;
        padding: 12px;
        background: linear-gradient(145deg, #f6f8fa, #ebedf0);
        border-radius: 6px;
        color: #606266;
        border-left: 4px solid #409EFF;
        i {
          margin-right: 8px;
          color: #409EFF;
        }
      }
    }

    .final-result {
      .result-title {
        color: #303133;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .vul-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
        padding: 12px;
        background: #fef0f0;
        border-radius: 4px;
        .vul-type {
          color: #f56c6c;
          font-weight: 500;
        }
      }
      
      .risk-assessment {
        margin-top: 25px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 6px;
        .risk-score {
          display: flex;
          align-items: center;
          gap: 15px;
          .label {
            color: #606266;
          }
          .score {
            color: #E6A23C;
            font-weight: bold;
          }
        }
        .time-cost {
          margin-top: 15px;
          color: #909399;
          text-align: right;
        }
      }
    }
  }
}

.ai-suggestion {
  .code-compare {
    margin: 20px 0;
    pre {
      padding: 14px;
      border-radius: 6px;
      line-height: 1.6;
      &.vulnerable-code {
        background: #fef0f0;
        border: 1px solid #fde2e2;
      }
      &.fixed-code {
        background: #f0f9eb;
        border: 1px solid #e1f3d8;
      }
    }
  }
  
  .dialog-actions {
    margin-top: 25px;
    text-align: center;
  }
}

.action-buttons {
  margin: 30px 0;
  display: flex;
  justify-content: center;
  gap: 15px;
}
.status-prompt {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  
  i {
    font-size: 48px;
    margin-bottom: 20px;
    display: block;
  }
}

.start-button {
  width: 100%;
  margin-top: 15px;
  padding: 12px 20px;
}

.code-stats {
  position: absolute;
  bottom: -40px;
  right: 0;
  transition: all 0.3s;

  .el-tag {
    margin-left: 8px;
  }
}

.progress-title {
  color: #409EFF;
  margin-bottom: 20px;
  text-align: center;
}

.progress-details {
  margin-top: 20px;
  
  .stats-item {
    margin: 12px 0;
    display: flex;
    justify-content: space-between;
    
    .label {
      color: #606266;
    }
    
    .value {
      color: #303133;
      font-weight: 500;
    }
  }
}

</style>
