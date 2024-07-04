<template>
  <d2-container>
    <el-row :gutter="20" type="flex"  v-loading="loading" style="flex-wrap: wrap;">
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
  </d2-container>
</template>

<script>
export default {
  name: 'locateResult',

  data () {
    return {
      results: [], // 保存检测结果
      faults: [], // 保存 requestFaults 获取的数据
      activeNames: [] // 初始化 el-collapse 的展开状态，默认为空数组
    }
  },
  created () {
    this.showContracts()
  },
  methods: {
    async showContracts () {
      const db = await this.$store.dispatch('d2admin/db/database', {
        user: true
      })
      const faultLines = db.get('data').value().split('\n')
      for (let i = 0; i < faultLines.length - 1; i++) {
        const values = faultLines[i].split(',')
        this.faults.push({
          rank: `Top-${values[0]}`,
          description: `fault function at ${values[1]}`,
          address: values[2],
          offset: values[3]
        })
      }
    }
  }
}

</script>
