<template>
  <d2-container class="result-page">
    <div class="detect-layout">
      <!-- 左侧侧边栏 -->
      <aside class="sidebar">
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
                @click="() => { this.$router.push({name: 'vulnrepair'}) }"
                style="margin-top: 15px;"
              >
                执行精准定位修复
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
        <!-- 可疑函数列表（可选，el-menu 组织） -->
        <div v-if="suspiciousFunctions && suspiciousFunctions.length" class="suspicious-functions">
          <h3>可疑函数</h3>
          <el-menu :default-active="suspiciousFunctions[0]?.name" class="suspicious-menu" style="border:none;background:transparent">
            <el-menu-item v-for="(fn, idx) in suspiciousFunctions" :key="fn.name" :index="fn.name">
              <el-tooltip :content="fn.detail" placement="right">
                <span>{{ fn.name }}</span>
              </el-tooltip>
            </el-menu-item>
          </el-menu>
        </div>
      </aside>
      <!-- 右侧主内容区 -->
      <main class="main-content">
        <el-card shadow="hover" class="report-card">
          <h2>大模型安全分析报告</h2>
          <p>本次检测的大模型分析结果如下：</p>
          <ul>
            <li>合约整体安全性评级：<b>A-</b></li>
            <li>检测到 1 个高危漏洞（数值溢出），建议及时修复。</li>
            <li>可疑函数：<b>transfer</b>、<b>mint</b></li>
            <li>建议：对涉及数值运算的函数增加溢出检查，参考 OpenZeppelin SafeMath 库。</li>
          </ul>
          <p style="color: #999; margin-top: 20px;">* 以上报告由大模型自动生成，仅供参考。</p>
        </el-card>
      </main>
    </div>
  </d2-container>
</template>

<script>
export default {
  name: 'detect-result',
  computed: {
    resultTitle () {
      return this.hasVulnerability ? '发现安全漏洞' : '合约安全性良好'
    },
    subTitle () {
      return this.hasVulnerability
        ? '请立即处理检测到的漏洞'
        : '本次检测未发现已知安全问题'
    },
    resultIcon () {
      return this.hasVulnerability ? 'warning' : 'success'
    },
    speed () {
      // 优先从 query 获取
      const val = this.$route.query.speed || this.$route.params.speed
      return val ? Number(val).toLocaleString() : '--'
    },
    lines () {
      return this.$route.query.lines || this.$route.params.lines || '--'
    },
    hasVulnerability () {
      // 兼容 query 和 params
      if (typeof this.$route.query.hasVulnerability !== 'undefined') {
        // query 传递的布尔值是字符串
        return this.$route.query.hasVulnerability === 'true' || this.$route.query.hasVulnerability === true
      }
      return this.$route.params.hasVulnerability
    },
    suspiciousFunctions () {
      // 可扩展：从 query、params 或接口获取
      return this.$route.query.suspiciousFunctions || this.$route.params.suspiciousFunctions || [
        { name: 'transfer', detail: '涉及资金转移，存在溢出风险' },
        { name: 'mint', detail: '铸币函数，需检查权限与溢出' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.detect-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 340px;
  background: #fafbfc;
  border-right: 1px solid #eee;
  padding: 30px 20px 20px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-shrink: 0;
}
.suspicious-functions {
  margin-top: 40px;
  h3 {
    font-size: 16px;
    margin-bottom: 12px;
    color: #333;
  }
  .no-suspicious {
    color: #aaa;
    font-size: 14px;
    padding: 8px 0;
  }
}
.main-content {
  flex: 1 1 0;
  padding: 40px;
  background: #f5f7fa;
  height: 100%;
}
.report-card {
  max-width: 700px;
  margin: 0 auto;
  padding: 30px 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
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
</style>
