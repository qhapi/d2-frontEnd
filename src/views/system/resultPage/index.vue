<template>
  <d2-container>
    <el-row :gutter="20" type="flex" align="stretch">
      <el-col :span="12">
        <el-card class="box-card">
          <h2>漏洞检测结果</h2>
          <el-button type="text" @click="navigateTo('/detect/detectResult')">跳转</el-button>
          <!-- 确保图表自适应容器大小 -->
          <div class="echart" ref="mychart" :style="myChartStyle" v-if="showChart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <h2>底层模糊测试</h2>
          <el-button type="text" @click="navigateTo('/fuzzTest')">跳转</el-button>
          <div>
            <el-row :gutter="20" type="flex" style="flex-wrap: wrap;">
              <el-col :span="12" class="col-height">
                <el-card align="middle" shadow="always">
                  <h4>运行概述</h4>
                  <h3>28.4万</h3>
                  <h4>执行次数</h4>
                  <el-divider></el-divider>
                  <h3>1</h3>
                  <h4>节点分布数</h4>
                  <el-button type="text">查看详情</el-button>
                </el-card>
              </el-col>
              <el-col :span="12" class="col-height">
                <el-card align="middle" shadow="always">
                  <h4>代码覆盖率详情</h4>
                  <h3>31.36%</h3>
                  <h4>执行次数</h4>
                  <el-divider></el-divider>
                  <h3>118</h3>
                  <h4>测试代码行</h4>
                  <el-button type="text">查看详情</el-button>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" type="flex" style="flex-wrap: wrap;">
      <el-col :span="12" @click="navigateTo('/detect/locateMul')">
        <el-card class="box-card">
          <el-button type="text" @click="navigateTo('/detect/locateMul')">跳转</el-button>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <!-- 内容省略 -->
          <el-button type="text" @click="navigateTo('/details')">查看详情</el-button>
        </el-card>
      </el-col>
    </el-row>
    <!-- 显示漏洞数据 -->
    <el-card class="box-card">
      <h2>嫌疑函数信息</h2>
      <el-row :gutter="20" type="flex" style="flex-wrap: wrap;">
        <el-col :span="24">
          <el-collapse v-model="activeNames" accordion>
            <el-collapse-item v-for="(result, index) in faults" :key="index">
              <template slot="title">
                                <span style="float:left; font-weight:bold; font-size:14px; color:#2C8DF4;">
                                    {{ `Top-${index + 1}: ${result.description}` }}
                                </span>
              </template>
              <div>
                <!--代码内容：-->
              </div>
              <div>代码地址：<a :href="result.address" target="_blank">{{ result.address }}</a></div>
              <div>偏移量：{{ result.offset }}</div>
              <div>嫌疑排行：{{ result.rank }}</div>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
    </el-card>
  </d2-container>
</template>

<script>
import * as echarts from 'echarts'
import 'element-ui/lib/theme-chalk/index.css'

export default {
  data () {
    return {
      myChart: null,
      myChartStyle: { width: '100%', height: '520px', background: 'white' },
      data: [
        { value: 10480, name: '正常' },
        { value: 735, name: '漏洞1' },
        { value: 580, name: '漏洞2' },
        { value: 484, name: '漏洞3' },
        { value: 300, name: '漏洞4' }
      ],
      datadetail: [],
      currentPage: 1,
      totalCount: 100,
      pageSizes: [10, 20, 50, 100],
      PageSize: 10,
      chartData: null, // 用来保存图表的数据
      showChart: true, // 控制图表是否显示
      results: [], // 保存检测结果
      faults: [], // 保存 requestFaults 获取的数据
      activeNames: [] // 初始化 el-collapse 的展开状态，默认为空数组
    }
  },
  created () {
    this.showContracts()
    console.log(this.data)
  },
  mounted () {
    this.$nextTick(() => {
      this.initEcharts()
      if (this.chartData) {
        this.myChart.setOption(this.chartData) // 恢复图表的数据
      }
    })
  },
  methods: {
    navigateTo (module) {
      this.$router.push({ path: module })
    },
    initEcharts () {
      const option = {
        title: {
          text: '漏洞检测结果',
          subtext: 'test',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['正常', '漏洞1', '漏洞2', '漏洞3', '漏洞4']
        },
        series: [
          {
            name: '漏洞比例',
            type: 'pie',
            radius: '50%',
            data: this.data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c} ({d}%)'
                },
                labelLine: { show: true }
              }
            }
          }
        ]
      }
      this.myChart = echarts.init(this.$refs.mychart)
      this.myChart.setOption(option)
      window.addEventListener('resize', () => {
        this.myChart.resize()
      })
    },
    async showContracts () {
      const db = await this.$store.dispatch('d2admin/db/database', {
        user: true
      })
      const faultLines = db.get('data').value().split('\n')
      for (let i = 0; i < faultLines.length - 1; i++) {
        const values = faultLines[i].split(',')
        this.faults.push({
          rank: values[0],
          description: values[1],
          address: values[2],
          offset: values[3]
        })
      }
    }
  }
}
</script>

<style scoped>
.box-card {
  min-height: 300px;
}

/* 为echart容器添加自适应样式 */
.echart {
  width: 100%; /* 宽度占满容器 */
  height: auto; /* 高度自适应 */
}

.el-row {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex; /* 使用 flex 布局 */
  flex: 1;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
  flex: 1;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
