<template>
  <d2-container>
    <el-row>
      <el-col span="8">
        <el-result icon="success" title="成功修复：80" subTitle="80%">
        </el-result>
      </el-col>
      <el-col span="8">
        <el-result icon="warning" title="修复异常：10" subTitle="10%">
        </el-result>
      </el-col>
      <el-col span="8">
        <el-result icon="error" title="修复错误：10" subTitle="10%">
        </el-result>
      </el-col>
    </el-row>
    <el-row>
      <el-table id="table" :data="datadetail" @row-click="rowClicked">
        <el-table-column prop="name" label="合约名称" sortable :width="calculatedWidth75"></el-table-column>
        <el-table-column prop="type" label="漏洞类型" sortable :width="calculatedWidth25"></el-table-column>
      </el-table>
    </el-row>
    <el-row>
      <el-col :span="20"><div class="grid-content"></div></el-col>
      <el-col :span="4"><el-button @click="buttonClicked">全部导出</el-button></el-col>
    </el-row>
  </d2-container>
</template>

<script>
import axios from 'axios'
import * as echarts from 'echarts'
export default {
  name: 'locateMul',
  data () {
    return {
      myChart: {},
      myChartStyle: { width: '100%', height: '520px', background: 'white' },
      channelname: this.$route.params.channelname,
      uid: this.$route.params.uid,
      contribution: 0,
      contributions: [],
      lastround: 0,
      rounds: []
    }
  },
  created () {
    this.getChannelDetails(this.channelname, this.uid)
  },
  mounted () {
    this.initEcharts()
  },
  methods: {
    getChannelDetails (channelname, uid) {
      axios.post('http://localhost:5500/getContri', '19'
      ).then(response => {
        // console.log(response)
        this.contributions = response.data.filter(obj => `client${obj.ClientID}` === `${uid}`).map(obj => obj.Contri)[0]
        this.contribution = this.contributions.at(-1)
        this.rounds = Array.from({ length: this.contributions.length }, (_, i) => i + 1)
        this.lastround = this.rounds.at(-1)
        this.initEcharts()
      })
    },
    initEcharts () {
      const xdata = this.rounds
      const option = {
        xAxis: {
          data: xdata,
          axisTick: {
            show: false,
            alignWithLabel: true
          }
        },
        tooltip: {
          trigger: 'item'
        },
        yAxis: {},
        series: [
          {
            data: this.contributions,
            type: 'line' // 类型设置为折线图
          }
        ]
      }
      this.myChart = echarts.init(document.getElementById('umychart'))
      this.myChart.setOption(option)
      // 随着屏幕大小调节图表
      window.addEventListener('resize', () => {
        this.myChart.resize()
      })
    }
  }
}
</script>
