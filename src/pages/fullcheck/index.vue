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
                {{ uploadedFile.name }}
              </el-tag>
            </div>

            <!-- 上传漏洞报告（可选） -->
            <el-upload
              action="#"
              :before-upload="handleReportUpload"
              :show-file-list="false"
              accept=".json">
              <el-button size="mini" type="info" icon="el-icon-upload">上传漏洞报告（可选）</el-button>
              <span v-if="uploadedReport" style="margin-left:8px;">{{ uploadedReport.name }}</span>
            </el-upload>
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

          <el-upload
            action="#"
            :before-upload="handleReportUpload"
            :show-file-list="false"
            accept=".json">
            <el-button size="mini" type="info" icon="el-icon-upload">上传漏洞报告（可选）</el-button>
            <span v-if="uploadedReport" style="margin-left:8px;">{{ uploadedReport.name }}</span>
          </el-upload>

          <el-button
            type="primary"
            @click="startDetection"
            :disabled="!hasContent || detecting"
            class="start-button">
            {{ detecting ? '检测进行中...' : '开始检测' }}
          </el-button>
        </el-card>
      </el-col>

      <!-- 右侧参数输入区域 -->
      <el-col :span="12" class="param-section">
        <el-card shadow="hover">
          <el-form :model="form" label-width="110px" class="param-form">
            <el-form-item label="项目名称">
              <el-input v-model="form.projectName" placeholder="请输入项目名称" />
            </el-form-item>
            <el-form-item label="合约地址">
              <el-input v-model="form.contractAddress" placeholder="请输入合约地址（可选）" />
            </el-form-item>
            <el-form-item label="交易地址">
              <el-input v-model="form.txAddress" placeholder="请输入交易地址（可选）" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="form.systemVersion" placeholder="如 1.0.0" />
            </el-form-item>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="底层系统类型">
                  <el-select v-model="form.systemType" placeholder="请选择系统类型">
                    <el-option label="以太坊" value="Ethereum" />
                    <el-option label="Fabric" value="Fabric" />
                    <el-option label="其他" value="Other" />
                  </el-select>
                </el-form-item>
                <el-form-item label="底层系统文件">
                  <el-upload
                    action="#"
                    :before-upload="handleSystemUpload"
                    :show-file-list="false"
                    drag>
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">拖拽或点击上传底层系统文件</div>
                  </el-upload>
                  <div v-if="form.systemFile" class="file-preview">
                    <el-tag type="info">
                      <i class="el-icon-document"></i>
                      {{ form.systemFile.name }}
                    </el-tag>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
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
        <!-- 删除冗余的评价区域 -->
      </div>
    </el-dialog>
  </d2-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      contractCode: '',
      uploadedFile: null,
      uploadedReport: null,
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
      ],
      form: {
        projectName: '',
        contractAddress: '',
        txAddress: '',
        systemType: '',
        systemVersion: '',
        systemFile: null,
        contractFile: null
      }
    }
  },
  computed: {
    progressColor () {
      return [
        { color: '#409EFF', percentage: 30 },
        { color: '#67C23A', percentage: 70 },
        { color: '#E6A23C', percentage: 100 }
      ]
    }
  },
  watch: {
    contractCode (newVal) {
      this.hasContent = newVal.length > 0
      this.codeLines = newVal.split('\n').length
      this.codeLength = newVal.replace(/\s/g, '').length
      this.saveContractCode(newVal)
      // 新增：打印contract模块状态
      console.log('contract vuex state:', this.$store.state.contract)
    }
  },
  methods: {
    ...mapActions('contract', ['saveContractFile', 'saveContractCode', 'saveUploadedReport']),
    handleUpload (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.$message.error('文件大小超过10MB限制')
        return false
      }

      this.uploadedFile = file
      const reader = new FileReader()
      reader.onload = (e) => {
        this.contractCode = e.target.result
        this.saveContractCode(e.target.result)
        // 新增：打印contract模块状态
        console.log('contract vuex state:', this.$store.state.contract)
      }
      reader.readAsText(file)
      return false
    },
    handleReportUpload(file) {
      this.uploadedReport = file
      return false
    },
    async startDetection() {
      console.log('准备上传的合约文件:', this.uploadedFile);
      if (!this.uploadedFile) {
        this.$message.error('请上传合约文件');
        return;
      }
      this.status = 'detecting';
      this.detecting = true;

      // 1. 上传合约文件和漏洞报告到后端
      const formData = new FormData();
      formData.append('contract', this.uploadedFile);
      if (this.uploadedReport) formData.append('report', this.uploadedReport);

    handleReportUpload (file) {
      this.uploadedReport = file
      this.saveUploadedReport(file)
      return false
    },

    startDetection () {
      // 跳转到进度展示页，由progress页负责检测和后续跳转
      // 跳转前确保合约内容已存入vuex
      if (this.uploadedFile) {
        this.saveContractFile(this.uploadedFile)
        console.log('startDetection: 保存文件到vuex', this.uploadedFile)
      }
      if (this.contractCode) {
        this.saveContractCode(this.contractCode)
        console.log('startDetection: 保存代码到vuex', this.contractCode)
      }
      this.$router.push({
        path: '/detect/progress',
        query: {
          code: this.contractCode,
          lines: this.codeLines
        }
      })
    },

    // 风险评分计算方法
    calculateRiskLevel (confidence) {
      return Math.min(5, Math.ceil(confidence * 5))
    },

    calculateDetectionTime () {
      const end = new Date()
      const diff = (end - this.startTime) / 1000
      const minutes = Math.floor(diff / 60)
      const seconds = Math.floor(diff % 60)
      this.detectionTime = `${minutes}分${seconds.toString().padStart(2, '0')}秒`
    },

    showAISuggestion () {
      this.showAIDialog = true
    },

    copyCode () {
      const code = `using SafeMath for uint;

function transfer(address to, uint value) public {
    balances[msg.sender] = balances[msg.sender].sub(value);
    balances[to] = balances[to].add(value);
}`
      navigator.clipboard.writeText(code)
      this.$message.success('修复代码已复制到剪贴板')
    },

    formatFileSize (bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i])
    },

    goToAdvanced () {
      this.$router.push('/repair-detail')
    }
  },
  async mounted() {

    const { bugs, report, pdfOriginal, pdfPatched, pdfConstructorOriginal, pdfConstructorPatched } = this.$route.query;

    const bugsRes = await axios.get(bugs);
    this.bugDetails = bugsRes.data;

    const reportRes = await axios.get(report);
    this.patchData = reportRes.data;

    this.originalPdf = pdfOriginal;
    this.patchedPdf = pdfPatched;
    this.constructorOriginalPdf = pdfConstructorOriginal;
    this.constructorPatchedPdf = pdfConstructorPatched;
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
  align-items: stretch;
  .el-col {
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    height: 100%;
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

  .el-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
}

.param-section {
  // 让右侧卡片和表单宽度自适应父容器，避免被边界截断
  .el-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    // 让卡片内容撑满
    box-sizing: border-box;
  }
  .param-form {
    width: 100%;
    max-width: none;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 32px 24px 12px 24px;
    box-shadow: 0 2px 8px #e6e6e6;
    min-height: 100%;
    box-sizing: border-box;
  }
  .el-form-item {
    // 防止输入框溢出被截断
    .el-input,
    .el-select,
    .el-upload {
      width: 100%;
      box-sizing: border-box;
    }
  }
  .file-preview {
    margin-top: 10px;
    .el-tag {
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
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
