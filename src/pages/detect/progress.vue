<template>
  <d2-container class="page">
    <div class="progress-container">
      <el-progress
        :percentage="percentage"
        :stroke-width="20"
        text-inside
        status="success"
      />
      <div class="stats">
        <div class="stat-item">
          <i class="el-icon-timer"></i>
          已用时间：{{ elapsedTime }}
        </div>
        <div class="stat-item">
          <i class="el-icon-document"></i>
          合约行数：{{ lines }}
        </div>
      </div>
    </div>
  </d2-container>
</template>

<script>
import axios from 'axios'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'detect-progress',
  data () {
    return {
      percentage: 0,
      startTime: Date.now(),
      elapsedTime: '0s',
      lines: 0,
      intervalId: null,
      randomFactor: 1 + (Math.random() - 0.5) * 0.2,
      detectFinished: false,
      detectResult: null,
      code: '',
      // 新增检测相关状态
      status: 'init',
      vulnerabilityCount: 0,
      vulnerabilityType: '',
      riskLevel: 0,
      detectionTime: '0分0秒'
    }
  },
  computed: {
    ...mapState('d2admin/page', [
      'opened',
      'current'
    ])
  },
  mounted () {
    // 兼容query和params
    this.lines = this.$route.query.lines || this.$route.params.lines || 0
    this.code = this.$route.query.code || this.$route.params.code || ''
    this.startProgress()
    this.startDetection()
  },
  beforeDestroy () {
    clearInterval(this.intervalId)
  },
  methods: {
    ...mapActions('d2admin/page', [
      'close'
    ]),
    startProgress () {
      const start = Date.now()
      this.intervalId = setInterval(() => {
        const elapsed = Date.now() - start
        // 进度条最多到99%，等检测完成后再到100%
        if (!this.detectFinished) {
          this.percentage = Math.min(99, Math.floor((elapsed / 1000) * 100 * this.randomFactor))
        } else {
          this.percentage = 100
        }
        this.elapsedTime = `${(elapsed / 1000).toFixed(1)}s`

        // 检测完成且进度条到100%时跳转
        if (this.detectFinished && this.percentage >= 100) {
          clearInterval(this.intervalId)
          setTimeout(() => {
            // 计算检测速度（行/小时），避免除零
            let speed = 0
            if (this.lines && this.detectionTime) {
              // detectionTime 格式为 "X分YY秒"
              const match = this.detectionTime.match(/(\d+)分(\d+)秒/)
              let seconds = 0
              if (match) {
                seconds = parseInt(match[1]) * 60 + parseInt(match[2])
              }
              if (seconds > 0) {
                speed = Math.floor(this.lines / (seconds / 3600))
              }
            }
            // 判断是否有漏洞
            let hasVulnerability = true
            if (this.detectResult && Array.isArray(this.detectResult.vulnerabilities)) {
              hasVulnerability = this.detectResult.vulnerabilities.length > 0
            }
            // 关闭当前标签页并跳转
            this.close({ tagName: this.current }).then(() => {
              this.$nextTick(() => {
                this.$router.push({
                  name: 'detect-result',
                  query: {
                    speed,
                    lines: this.lines,
                    hasVulnerability
                  }
                })
              })
            })
          }, 300)
        }
      }, 10)
    },
    startDetection () {
      this.status = 'detecting'
      const startTime = new Date()
      axios.post('http://localhost:5000/api/detect', {
        code: this.code
      })
        .then(response => {
          if (response.data.status === 'success') {
            this.status = 'completed'
            this.vulnerabilityCount = response.data.vulnerabilities.length
            if (this.vulnerabilityCount > 0) {
              this.vulnerabilityType = response.data.vulnerabilities[0].type
              this.riskLevel = this.calculateRiskLevel(response.data.confidence)
            } else {
              this.vulnerabilityType = '无漏洞'
            }
            this.detectResult = response.data
          } else {
            this.status = 'completed'
            this.vulnerabilityType = '检测失败'
            this.detectResult = null
          }
        })
        .catch(error => {
          console.error('检测失败:', error)
          this.status = 'completed'
          this.vulnerabilityType = '检测失败'
          this.detectResult = null
          // 可选：显示错误提示
        })
        .finally(() => {
          this.detectFinished = true
          // 计算检测耗时
          const end = new Date()
          const diff = (end - startTime) / 1000
          const minutes = Math.floor(diff / 60)
          const seconds = Math.floor(diff % 60)
          this.detectionTime = `${minutes}分${seconds.toString().padStart(2, '0')}秒`
        })
    },
    calculateRiskLevel (confidence) {
      return Math.min(5, Math.ceil(confidence * 5))
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);

  .stats {
    margin-top: 30px;
    display: flex;
    justify-content: space-around;

    .stat-item {
      font-size: 16px;
      color: #666;

      i {
        margin-right: 8px;
        color: #409EFF;
      }
    }
  }

  ::v-deep .el-progress-bar {
    padding-right: 70px;
  }
}
</style>
