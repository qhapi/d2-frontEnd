<template>
    <d2-container>
        <el-row :gutter="20">
            <el-col :span="10">
                <el-card class="box-card">
                    <h2>漏洞检测结果</h2>
                    <div class="echart" id="mychart" :style="myChartStyle" v-if="showChart"></div>
                    <el-button type="text" @click="navigateTo('/detect/detectResult')">跳转</el-button>
                </el-card>
            </el-col>
            <el-col :span="10" @click="navigateTo('/fuzzTest')">
                <el-card class="box-card">
                    <h2>底层模糊测试</h2>
                    <el-button type="text" @click="navigateTo('/fuzzTest')">跳转</el-button>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="10" @click="navigateTo('/detect/locateMul')">
                <el-card class="box-card">
                    <el-button type="text" @click="navigateTo('/detect/locateMul')">跳转</el-button>
                </el-card>
            </el-col>
            <el-col :span="10">
                <el-card class="box-card">
                    <!-- 内容省略 -->
                    <el-button type="text" @click="navigateTo('/details')">查看详情</el-button>
                </el-card>
            </el-col>
        </el-row>
    </d2-container>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data () {
    return {
      myChart: {},
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
      showChart: true // 控制图表是否显示
    }
  },
  computed: {
  },
  mounted () {
    this.$nextTick(() => {
      this.initEcharts()
      if (this.chartData) {
        this.myChart.setOption(this.chartData) // 恢复图表的数据
      }
    })
  },
  beforeRouteLeave (to, from, next) {
    this.chartData = this.myChart.getOption() // 保存图表的数据
    if (this.myChart != null) {
      this.myChart.dispose()
      this.myChart = null
    }
    next()
  },
  watch: {
    showChart (newVal, oldVal) {
      if (newVal && !oldVal) {
        this.$nextTick(() => {
          this.initEcharts()
        })
      } else if (!newVal && oldVal) {
        if (this.myChart != null) {
          this.myChart.dispose()
          this.myChart = null
        }
      }
    }
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
      this.myChart = echarts.init(document.getElementById('mychart'))
      this.myChart.setOption(option)
      window.addEventListener('resize', () => {
        this.myChart.resize()
      })
    }
  }
}
</script>

<style>
.el-row {
  margin-top: 20px;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
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
