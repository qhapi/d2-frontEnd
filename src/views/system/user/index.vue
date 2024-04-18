<template>
  <d2-container>
    <h1>{{ channelname }}-{{ uid }}</h1>
    <el-descriptions>
      <el-descriptions-item label="用户id">{{uid}}</el-descriptions-item>
      <el-descriptions-item label="最后轮次">{{lastround}}</el-descriptions-item>
      <el-descriptions-item label="贡献值">{{contribution}}</el-descriptions-item>
    </el-descriptions>
    <div class="echart" id="umychart" :style="myChartStyle"></div>
  </d2-container>
</template>

<script>
import axios from 'axios'
import * as echarts from 'echarts'
export default {
  name: 'udetail',
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
