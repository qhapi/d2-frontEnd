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
export default {
  name: 'detect-progress',
  data() {
    return {
      percentage: 0,
      startTime: Date.now(),
      elapsedTime: '0s',
      lines: this.$route.params.lines,
      intervalId: null,
      randomFactor: 1 + (Math.random() - 0.5) * 0.2
    }
  },
  mounted() {
    this.startProgress()
  },
  beforeDestroy() {
    clearInterval(this.intervalId)
  },
  methods: {
    startProgress() {
      const start = Date.now()
      this.intervalId = setInterval(() => {
        const elapsed = Date.now() - start
        this.percentage = Math.min(100, Math.floor((elapsed / 1000) * 100 * this.randomFactor))
        this.elapsedTime = `${(elapsed / 1000).toFixed(1)}s`
        
        if (this.percentage >= 100) {
          clearInterval(this.intervalId)
          setTimeout(() => {
            this.$router.push({
              name: 'detect-result',
              params: {
                speed: Math.floor(this.lines / (elapsed / 3600000)),
                hasVulnerability: this.$route.params.detectType === 'file',
                lines: this.lines
              }
            })
          }, 300)
        }
      }, 10)
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