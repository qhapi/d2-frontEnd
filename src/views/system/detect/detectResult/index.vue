<template>
  <d2-container>
    <el-row>
      <div class="echart" id="detectchart" :style="detectChartStyle"></div>
      <el-table ref="tableRef" :data="tableData.slice((currentPage-1)*PageSize,currentPage*PageSize)" @row-click="rowClicked">
        <el-table-column prop="name" label="合约名称" sortable ></el-table-column>
        <el-table-column prop="classNum" label="漏洞数量" sortable ></el-table-column>
      </el-table>
    </el-row>
    <el-row>
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
    </el-row>
    <el-row style="position: relative">
      <el-col :span='4' style="position: absolute; right: 10px">
        <el-button @click="$router.push('/locate/locateResult')">详细信息</el-button>
        <el-button @click="buttonClicked">全部修复</el-button>
      </el-col>
    </el-row>
  </d2-container>
</template>

<script>
// import axios from 'axios'
import * as echarts from 'echarts'
export default {
  name: 'detectResult',
  data () {
    return {
      pieData: [],
      detectChart: {},
      detectChartStyle: { width: '100%', height: '520px', background: 'white' },
      tableData: [],
      currentPage: 1,
      totalCount: 100,
      pageSizes: [10, 20, 50, 100],
      PageSize: 10,
      contracts: [],
      jsonData: Object,
      db: null
    }
  },
  created () {
    this.getData()
  },
  mounted () {
  },
  methods: {
    async getData () {
      const db = await this.$store.dispatch('d2admin/db/database', {
        user: true
      })
      fetch('http://localhost:5000/getSlitherJSON', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: this.$store.state.d2admin.user.info.name,
          currentWorkDirectory: db.get('currentWorkDirectory')
        })
      })
        .then(response => response.json())
        .then(jsonData => {
          Object.keys(jsonData).forEach(file => {
            this.tableData.push({ name: file, classNum: jsonData[file].length })
          })
          this.totalCount = this.tableData.length
          const checkCounts = {}
          for (const file in jsonData) {
            jsonData[file].forEach(issue => {
              const checkType = issue.check
              if (checkCounts[checkType]) {
                checkCounts[checkType] += 1
              } else {
                checkCounts[checkType] = 1
              }
            })
          }
          this.pieData = Object.keys(checkCounts).map(check => ({
            value: checkCounts[check],
            name: check
          }))
          this.initEcharts()
        })
    },
    handleSizeChange (val) {
      this.PageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    buttonClicked () {
      this.$router.push('/detect/locateMul') // 转到修复界面
    },
    rowClicked (row, column, event) {
      console.log(row)
      this.$router.push('/detect/locateOne') // 转到对应合约的漏洞修复处
    },
    initEcharts () {
      const option = {
        title: {
          text: '漏洞检测结果',
          subtext: '',
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
            data: this.pieData,
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
      this.detectChart = echarts.init(document.getElementById('detectchart'))
      this.detectChart.setOption(option)
      // 随着屏幕大小调节图表
      window.addEventListener('resize', () => {
        this.detectChart.resize()
      })
    }
  }
}
</script>
