<template>
  <d2-container>
    <div class="echart" id="mychart" :style="myChartStyle"></div>
    <el-table ref="tableRef" :data="datadetail.slice((currentPage-1)*PageSize,currentPage*PageSize)" @row-click="rowClicked">
      <el-table-column prop="name" label="合约名称" sortable ></el-table-column>
      <el-table-column prop="type" label="漏洞类型" sortable ></el-table-column>
    </el-table>
    <div class="tabListPage">
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :hide-on-single-page="true"
                     :current-page="currentPage"
                     :page-sizes="pageSizes"
                     :page-size="PageSize" layout="total, sizes, prev, pager, next, jumper"
                     :total="totalCount">
      </el-pagination>
    </div>
    <el-row>
      <el-col :span="20"><div class="grid-content"></div></el-col>
      <el-col :span="4"><el-button @click="buttonClicked">全部修复</el-button></el-col>
    </el-row>
  </d2-container>
</template>
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
<script>
// import axios from 'axios'
import * as echarts from 'echarts'
export default {
  name: 'detectResult',
  data () {
    return {
      myChart: {},
      myChartStyle: { width: '100%', height: '520px', background: 'white' },
      data: [],
      datadetail: [],
      currentPage: 1,
      totalCount: 100,
      pageSizes: [10, 20, 50, 100],
      PageSize: 10
    }
  },
  computed: {
  },
  created () {
    // eslint-disable-next-line no-unused-expressions
    this.data = [
      { value: 10480, name: '正常' },
      { value: 735, name: '漏洞1' },
      { value: 580, name: '漏洞2' },
      { value: 484, name: '漏洞3' },
      { value: 300, name: '漏洞4' }
      // eslint-disable-next-line no-sequences
    ]
    this.generateData()
  },
  mounted () {
    this.initEcharts()
  },
  methods: {
    generateData () {
      const states = ['修复成功', '修复异常', '修复失败'] // 可能的状态
      this.datadetail = Array.from({ length: 100 }, (v, i) => ({
        name: `test${i + 1}.sol`,
        type: String(Math.floor(Math.random() * 10) + 1),
        state: states[Math.floor(Math.random() * states.length)]
      }))
    },
    handleSizeChange (val) {
      this.PageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    buttonClicked () {
      this.$router.push('/locateMul')
    },
    rowClicked (row, column, event) {
      console.log(row)
      this.$router.push('/locateOne')
    },
    initEcharts () {
      // const xdata = Array.from({ length: this.round }, (_, i) => i + 1)
      const option = {
        title: {
          text: '漏洞检测结果',
          subtext: 'test',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
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
            }
          }
        ]
      }
      this.myChart = echarts.init(document.getElementById('mychart'))
      this.myChart.setOption(option)
      // 随着屏幕大小调节图表
      window.addEventListener('resize', () => {
        this.myChart.resize()
      })
    }
  }
}
</script>
