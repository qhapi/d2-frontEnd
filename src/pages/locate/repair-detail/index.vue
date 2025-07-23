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
      <!-- 主界面（移除左侧面板，全宽显示） -->
      <el-col :span="24">
        <el-card class="main-panel">

          <!-- 主要内容区域 -->
          <template v-if="locateCompleted">
            <!-- 漏洞对比 -->
            <div class="vulnerability-compare">
              <div class="compare-header">
                <h4><i class="el-icon-warning-outline"></i> 控制流程图对比</h4>
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-document"
                  @click="showVulDetailDialog">
                  查看漏洞详情
                </el-button>
              </div>

              <!-- PDF 对比 -->
              <div class="pdf-comparison">
                <div class="pdf-container">
                  <div class="pdf-item">
                    <h5>原始合约控制流</h5>
                    <pdf
                      v-if="originalPdf"
                      :src="originalPdf"
                      :page="1"
                      @num-pages="pageCount = $event"
                      @page-loaded="currentPage = $event"
                      @loaded="loading = false"
                      @error="handlePdfError"
                    ></pdf>
                    <div v-else class="pdf-placeholder">
                      暂无 PDF 文件
                    </div>
                  </div>
                  <div class="pdf-item">
                    <h5>修复后控制流</h5>
                    <pdf
                      v-if="patchedPdf"
                      :src="patchedPdf"
                      :page="1"
                      @num-pages="pageCount = $event"
                      @page-loaded="currentPage = $event"
                      @loaded="loading = false"
                      @error="handlePdfError"
                    ></pdf>
                    <div v-else class="pdf-placeholder">
                      暂无 PDF 文件
                    </div>
                  </div>
                </div>

                <!-- 图像操作工具栏 -->
                <div class="image-tools">
                  <el-button-group>
                    <el-button size="small" icon="el-icon-zoom-in" @click="zoomIn">放大</el-button>
                    <el-button size="small" icon="el-icon-zoom-out" @click="zoomOut">缩小</el-button>
                    <el-button size="small" icon="el-icon-refresh" @click="resetZoom">重置</el-button>
                  </el-button-group>
                  <span class="scale-info">缩放比例: {{ (pdfScale * 100).toFixed(0) }}%</span>
                </div>
              </div>

              <!-- 漏洞统计信息 -->
              <div class="vul-stats">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-card shadow="hover" class="stat-card">
                      <div class="stat-title">发现漏洞数</div>
                      <div class="stat-value">{{ bugDetails.length }}</div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card shadow="hover" class="stat-card">
                      <div class="stat-title">平均代码覆盖率</div>
                      <div class="stat-value">{{ averageCodeCoverage }}%</div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card shadow="hover" class="stat-card">
                      <div class="stat-title">平均执行时间</div>
                      <div class="stat-value">{{ averageExecutionTime }}s</div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </div>
          </template>

          <!-- 分析中状态 -->
          <template v-else>
            <div class="analyzing-panel">
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
            </div>
          </template>

          <!-- 漏洞详情弹窗 -->
          <el-dialog
            title="漏洞详情与修复方案"
            :visible.sync="vulDetailDialogVisible"
            width="80%"
            :before-close="handleDialogClose"
            class="vul-detail-dialog">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="漏洞列表" name="list">
                <el-collapse v-model="activeVul">
                  <el-collapse-item
                    v-for="(bug, index) in bugDetails"
                    :key="index"
                    :title="`漏洞 ${index + 1}: ${bug?.type || '未知类型'}`"
                    :name="index">
                    <div class="bug-info">
                      <el-descriptions :column="2" border>
                        <el-descriptions-item label="漏洞类型">{{ bug.type || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="程序计数器">{{ bug.pc || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="代码覆盖率">{{ bug.code_coverage != null ? bug.code_coverage + '%' : '-' }}</el-descriptions-item>
                        <el-descriptions-item label="执行时间">{{ bug.execution_time != null ? bug.execution_time.toFixed(2) + 's' : '-' }}</el-descriptions-item>
                        <el-descriptions-item label="检测工具">{{ bug.tool || '-' }}</el-descriptions-item>
                      </el-descriptions>

                      <!-- 修复步骤 -->
                      <div class="patch-steps">
                        <h6>修复步骤</h6>
                        <div v-for="(patch, pIndex) in getPatchesForBug(bug.pc)" :key="pIndex" class="patch-step">
                          <el-card class="patch-card">
                            <div slot="header">
                              <span>步骤 {{ pIndex + 1 }}</span>
                              <el-tag size="small" :type="patch.insert_mode === 'before' ? 'warning' : 'success'">
                                {{ patch.insert_mode === 'before' ? '前置插入' : '后置插入' }}
                              </el-tag>
                            </div>
                            <div class="patch-content">
                              <div class="code-block">
                                <div class="code-header">
                                  <span>删除的代码</span>
                                  <el-tag size="mini" type="info" v-if="!patch.delete">无删除代码</el-tag>
                                </div>
                                <pre v-if="patch.delete">{{ patch.delete }}</pre>
                              </div>
                              <div class="code-block">
                                <div class="code-header">
                                  <span>插入的代码</span>
                                  <el-button
                                    size="mini"
                                    type="primary"
                                    icon="el-icon-document-copy"
                                    @click="copyCode(patch.insert)">
                                    复制
                                  </el-button>
                                </div>
                                <pre>{{ patch.insert }}</pre>
                              </div>
                            </div>
                          </el-card>
                        </div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-tab-pane>
              <el-tab-pane label="修复统计" name="stats">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="控制流图恢复率">{{ patchData.control_flow_graph_recovery }}</el-descriptions-item>
                  <el-descriptions-item label="控制流图恢复时间">
                    {{ patchData.control_flow_graph_recovery_time != null ? patchData.control_flow_graph_recovery_time.toFixed(3) : '-' }}s
                  </el-descriptions-item>
                  <el-descriptions-item label="原始部署大小">{{ patchData.original_deployment_size }}</el-descriptions-item>
                  <el-descriptions-item label="修复后部署大小">{{ patchData.patched_deployment_size }}</el-descriptions-item>
                  <el-descriptions-item label="原始运行时大小">{{ patchData.original_runtime_size }}</el-descriptions-item>
                  <el-descriptions-item label="修复后运行时大小">{{ patchData.patched_runtime_size }}</el-descriptions-item>
                  <el-descriptions-item label="总执行时间">
                    {{ patchData.execution_time != null ? patchData.execution_time.toFixed(3) : '-' }}s
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
            </el-tabs>
          </el-dialog>
        </el-card>
      </el-col>
    </el-row>
  </d2-container>
</template>

<script>

import pdf from 'vue-pdf'

export default {
  components: {
    pdf
  },
  data () {
    return {
      currentStep: 0,
      locateProgress: 0,
      locateCompleted: false,
      currentFunction: '',
      analysisLogs: [],
      vulLevel: 4,
      activeVul: [0],
      bugDetails: [],
      patchData: {},
      originalPdf: '',
      patchedPdf: '',
      constructorOriginalPdf: '',
      constructorPatchedPdf: '',
      vulDetailDialogVisible: false,
      activeTab: 'list',
      uploadedFile: null,
      uploadedReport: null,
      pdfLoading: false,
      pageCount: 0,
      currentPage: 1,
      loading: true,
      error: false,
      pdfScale: 1.0
    }
  },
  computed: {
    currentStepText () {
      const steps = ['代码解析', '模式匹配', '路径验证', '修复建议']
      return steps[this.currentStep] || '准备中'
    },
    averageCodeCoverage () {
      if (!this.bugDetails.length) return 0
      const sum = this.bugDetails.reduce((acc, bug) => acc + bug.code_coverage, 0)
      return (sum / this.bugDetails.length).toFixed(1)
    },
    averageExecutionTime () {
      if (!this.bugDetails.length) return 0
      const sum = this.bugDetails.reduce((acc, bug) => acc + bug.execution_time, 0)
      return (sum / this.bugDetails.length).toFixed(2)
    }
  },
  async mounted () {
    const { bugs, report, pdfOriginal, pdfPatched, pdfConstructorOriginal, pdfConstructorPatched } = this.$route.query
    let bugsLoaded = false
    let reportLoaded = false

    if (bugs) {
      const bugsRes = await this.$axios.get(bugs)
      this.bugDetails = bugsRes.data
      bugsLoaded = true
    }

    if (report) {
      const reportRes = await this.$axios.get(report)
      this.patchData = reportRes.data
      reportLoaded = true
    }

    this.originalPdf = pdfOriginal
    this.patchedPdf = pdfPatched
    this.constructorOriginalPdf = pdfConstructorOriginal
    this.constructorPatchedPdf = pdfConstructorPatched

    if (bugsLoaded && reportLoaded) {
      this.locateCompleted = true
    }
  },
  methods: {
    simulateLocation () {
      const logInterval = setInterval(() => {
        this.addLog('process', '正在分析函数: ' + this.getRandomFunction())
      }, 1500)

      const timer = setInterval(() => {
        const step = Math.random() * 8 + 4
        this.locateProgress = parseFloat(Math.min(this.locateProgress + step, 100).toFixed(0))
        this.currentStep = Math.floor(this.locateProgress / 25)

        if (this.locateProgress >= 100) {
          clearInterval(timer)
          clearInterval(logInterval)
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
      // 保持最多50条日志
      if (this.analysisLogs.length > 50) this.analysisLogs.shift()
    },
    getRandomFunction () {
      const functions = [
        'transfer()', 'approve()', 'mint()',
        'burn()', 'balanceOf()', 'allowance()'
      ]
      return functions[Math.floor(Math.random() * functions.length)]
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
    onPdfRendered () {
      console.log('PDF rendered successfully')
    },
    onPdfLoading (loading) {
      this.pdfLoading = loading
    },
    onPdfError (error) {
      console.error('PDF loading error:', error)
      this.$message.error('PDF 加载失败')
    },
    zoomIn () {
      const pdfContainers = document.querySelectorAll('.pdf-container canvas')
      pdfContainers.forEach(canvas => {
        const currentScale = parseFloat(canvas.style.transform.replace('scale(', '').replace(')', '')) || 1
        const newScale = Math.min(currentScale + 0.1, 2.0)
        canvas.style.transform = `scale(${newScale})`
        this.pdfScale = newScale
      })
    },
    zoomOut () {
      const pdfContainers = document.querySelectorAll('.pdf-container canvas')
      pdfContainers.forEach(canvas => {
        const currentScale = parseFloat(canvas.style.transform.replace('scale(', '').replace(')', '')) || 1
        const newScale = Math.max(currentScale - 0.1, 0.5)
        canvas.style.transform = `scale(${newScale})`
        this.pdfScale = newScale
      })
    },
    resetZoom () {
      const pdfContainers = document.querySelectorAll('.pdf-container canvas')
      pdfContainers.forEach(canvas => {
        canvas.style.transform = 'scale(1)'
      })
      this.pdfScale = 1.0
    },
    getPatchesForBug (pc) {
      const bugPatch = this.patchData.patches.find(p => p.pc === pc)
      return bugPatch ? bugPatch.patch : []
    },
    copyCode (code) {
      navigator.clipboard.writeText(code).then(() => {
        this.$message.success('代码已复制到剪贴板')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    },
    showVulDetailDialog () {
      this.vulDetailDialogVisible = true
    },
    handlePdfError (error) {
      console.error('PDF loading error:', error)
      this.error = true
      this.loading = false
      this.$message.error('PDF 加载失败')
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
    overflow-y: auto;

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

      .compare-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .vul-stats {
        margin-top: 20px;

        .stat-card {
          text-align: center;
          padding: 15px;

          .stat-title {
            color: #909399;
            font-size: 14px;
            margin-bottom: 10px;
          }

          .stat-value {
            color: #303133;
            font-size: 24px;
            font-weight: bold;
          }
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

.vul-detail-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px;
  }

  .bug-info {
    .patch-steps {
      margin-top: 20px;

      h6 {
        margin-bottom: 15px;
        color: #606266;
      }

      .patch-step {
        margin-bottom: 15px;

        .patch-card {
          .patch-content {
            display: flex;
            gap: 20px;

            .code-block {
              flex: 1;

              .code-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
              }

              pre {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
                margin: 0;
                font-family: monospace;
                white-space: pre-wrap;
              }
            }
          }
        }
      }
    }
  }
}

.pdf-comparison {
  margin-top: 20px;

  .pdf-container {
    display: flex;
    gap: 20px;
    margin-top: 15px;

    .pdf-item {
      flex: 1;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 15px;
      overflow: auto;

      h5 {
        margin-bottom: 15px;
        color: #303133;
      }

      ::v-deep .vue-pdf-embed {
        width: 100%;
        height: 1000px;
        overflow: auto;

        canvas {
          width: 100%;
          height: auto;
          transform-origin: top left;
          transition: transform 0.3s ease;
        }
      }

      .pdf-placeholder {
        height: 500px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        background: #f5f7fa;
        border-radius: 4px;
      }
    }
  }
}

.image-tools {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 15px;

  .scale-info {
    color: #606266;
    font-size: 14px;
    min-width: 100px;
  }
}
</style>
