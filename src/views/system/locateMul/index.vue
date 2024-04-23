<template>
  <d2-container>
    <el-row>
      <el-col span="8">
        <el-result icon="success" title="修复成功：80" subTitle="80%">
        </el-result>
      </el-col>
      <el-col span="8">
        <el-result icon="warning" title="修复异常：10" subTitle="10%">
        </el-result>
      </el-col>
      <el-col span="8">
        <el-result icon="error" title="修复失败：10" subTitle="10%">
        </el-result>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <h1>完成列表</h1>
    <el-row>
      <el-table id="table" :data="datadetail.slice((currentPage-1)*PageSize,currentPage*PageSize)" @row-click="rowClicked">
        <el-table-column prop="name" label="合约名称" fit sortable ></el-table-column>
        <el-table-column prop="type" label="漏洞类型" sortable ></el-table-column>
        <el-table-column prop="state" label="修复状态" sortable ></el-table-column>
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
    </el-row>
    <el-row>
      <el-col :span="20"><div class="grid-content"></div></el-col>
      <el-col :span="4"><el-button @click="buttonClicked">全部导出</el-button></el-col>
    </el-row>
  </d2-container>
</template>

<script>
// import axios from 'axios'
// import * as echarts from 'echarts'
export default {
  name: 'locateMul',
  data () {
    return {
      currentPage: 1,
      totalCount: 100,
      pageSizes: [10, 20, 50, 100],
      PageSize: 10,
      datadetail: []
    }
  },
  created () {
    this.generateData()
  },
  mounted () {
    this.initEcharts()
  },
  methods: {
    handleSizeChange (val) {
      this.PageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    generateData () {
      const states = ['修复成功', '修复异常', '修复失败'] // 可能的状态
      this.datadetail = Array.from({ length: 100 }, (v, i) => ({
        name: `test${i + 1}.sol`,
        type: String(Math.floor(Math.random() * 10) + 1),
        state: states[Math.floor(Math.random() * states.length)]
      }))
    },
    rowClicked () {
      this.$router.push('/locateOne')
    }
  }
}
</script>
