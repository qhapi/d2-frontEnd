<template>
  <d2-container>
    <el-row :gutter="20" type="flex">
     <el-col :span="10">
       <el-card ref="topcard" class="box-card">
         <div>
           <el-row :gutter="20">
             <el-col :span="12">
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
             <el-col :span="12">
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
      <el-col :span=14>
        <el-card class="box-card">
          <div class="echart" id="mychart" :style="myChartStyle"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="10">
        <el-card class="box-card">
        <div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card align="middle" shadow="always">
                <span>缺陷数:1</span>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card align="middle" shadow="always">
                <span>用例生成数:4</span>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card align="middle" shadow="always">
                <span>测试执行次数：28.4万</span>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card align="middle" shadow="always">
                <span>每秒执行次数：0</span>
              </el-card>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card align="middle" shadow="always">
                <span>路径覆盖数:21</span>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card align="middle" shadow="always">
                <span>cpu时长：4214s</span>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>
      </el-col>
      <el-col :span=14>
        <el-card class="box-card">
          <div class="echart" id="mypie" :style="myChartStyle"></div>
        </el-card>
      </el-col>
    </el-row>
  </d2-container>
</template>
<script>
</script>
<style>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  min-height: 300px;
}
</style>
<script>
import * as echarts from 'echarts';

export default {
  name: 'fuzzTest',
  data() {
    return {
      myChart: {},
      myChartStyle: { width: '100%', height: '366px', background: 'white' },
      id: 0,
      times: [1714032919759,
        1714034719759,
        1714036519759,
        1714038319759,
        1714040119759,
        1714041919759,
        1714043719759,
        1714045519759,
        1714047319759,
        1714049119759,
        1714050919759,
        1714052719759,
        1714054519759,
        1714056319759,
        1714058119759,
        1714059919759,
        1714061719759,
        1714063519759,
        1714065319759,
        1714067119759,
        1714068919759,
        1714070719759,
        1714072519759,
        1714074319759,
        1714076119759,
        1714077919759,
        1714079719759,
        1714081519759,
        1714083319759,
        1714085119759,
        1714086919759,
        1714088719759,
        1714090519759,
        1714092319759,
        1714094119759,
        1714095919759,
        1714097719759,
        1714099519759,
        1714101319759,
        1714103119759,
        1714104919759,
        1714106719759,
        1714108519759,
        1714110319759,
        1714112119759,
        1714113919759,
        1714115719759,
        1714117519759], // 存储时间点的数组
      cases: [237,
        162,
        107,
        277,
        377,
        497,
        330,
        473,
        309,
        315,
        284,
        259,
        201,
        392,
        458,
        208,
        276,
        253,
        462,
        458,
        259,
        274,
        438,
        429,
        221,
        363,
        386,
        367,
        321,
        110,
        150,
        190,
        400,
        190,
        338,
        253,
        492,
        352,
        235,
        403,
        184,
        471,
        366,
        145,
        314,
        381,
        299,
        278], // 存储用例数的数组
      desc: '',
      pie: [
        { value: 104, name: '内存问题' }
      ]
    }
  },
  mounted() {
    this.initEcharts();
  },
  methods: {
    initEcharts() {
      const option = {
        title: {
          text: '实时用例',
          left: 'center'
        },
        xAxis: {
          type: 'time',
          axisTick: {
            show: false,
            alignWithLabel: true
          },
          axisLabel: {
            formatter: (value) => echarts.format.formatTime('MM-dd hh:mm', value)
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            params = params[0];
            return echarts.format.formatTime('yyyy-MM-dd hh:mm:ss', params.value[0]) + ' : ' + params.value[1];
          }
        },
        yAxis: {
          type: 'value',
          name: '用例数'
        },
        series: [{
          data: this.cases.map((item, index) => [this.times[index], item]),
          type: 'line'
        }]
      };
      const option2 = {
        title: {
          text: '缺陷类型',
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
            name: '缺陷比例',
            type: 'pie',
            radius: '50%',
            data: this.pie,
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
      this.myChart = echarts.init(document.getElementById('mychart'));
      this.myChart.setOption(option);
      window.addEventListener('resize', () => {
        this.myChart.resize();
      });
      this.mypie = echarts.init(document.getElementById('mypie'));
      this.mypie.setOption(option2);
      window.addEventListener('resize', () => {
        this.mypie.resize();
      });
    }
  }
}
</script>
