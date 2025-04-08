<template>
  <d2-container class="result-page">
    <div class="result-container">
      <el-result
        :title="resultTitle"
        :sub-title="subTitle"
        :icon="resultIcon"
      >
        <template slot="extra">
          <div class="stats">
            <div class="stat-item">
              <i class="el-icon-data-analysis"></i>
              检测速度：{{ speed }} 行/小时
            </div>
            <div class="stat-item">
              <i class="el-icon-document"></i>
              合约行数：{{ lines }}
            </div>
          </div>
          <div v-if="hasVulnerability" class="vulnerability">
            <el-alert
              title="检测到高危漏洞"
              type="error"
              description="数值溢出 (Integer Overflow)"
              show-icon
            />
            <el-button 
              v-if="hasVulnerability"
              type="warning" 
              @click="showFixSuggestion"
              style="margin-top: 15px;"
            >
              查看修复建议
            </el-button>
          </div>
          <div v-else class="safe">
            <el-alert
              title="合约安全性良好"
              type="success"
              description="未检测到已知漏洞"
              show-icon
            />
          </div>
          <el-button 
            type="primary" 
            @click="$router.push('/')"
            style="margin-top: 20px;"
          >
            返回重新检测
          </el-button>
        </template>
      </el-result>
    </div>
  </d2-container>
</template>

<script>
export default {
  name: 'detect-result',
  computed: {
    resultTitle() {
      return this.hasVulnerability ? '发现安全漏洞' : '合约安全性良好'
    },
    subTitle() {
      return this.hasVulnerability 
        ? '请立即处理检测到的漏洞' 
        : '本次检测未发现已知安全问题'
    },
    resultIcon() {
      return this.hasVulnerability ? 'warning' : 'success'
    },
    speed() {
      return this.$route.params.speed.toLocaleString()
    },
    lines() {
      return this.$route.params.lines
    },
    hasVulnerability() {
      return this.$route.params.hasVulnerability
    }
  }
}
</script>

<style lang="scss" scoped>
.result-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);

  .stats {
    margin: 20px 0;
    display: flex;
    justify-content: center;
    gap: 30px;
    
    .stat-item {
      font-size: 16px;
      color: #666;
      
      i {
        margin-right: 8px;
        color: #67C23A;
      }
    }
  }

  .vulnerability, .safe {
    margin: 30px 0;
  }
}
</style>