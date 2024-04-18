<template>
  <d2-container>
    <h1>控制台</h1>
    <el-table id="table" :data="users.slice((currentPage-1)*PageSize,currentPage*PageSize)" :stripe="true">
      <el-table-column prop="uid" label="用户id" sortable></el-table-column>
      <el-table-column prop="channel" label="任务通道" sortable :filters="channelFilters" :filter-method="filterHandler"></el-table-column>
      <el-table-column prop="hostname" label="主机名"></el-table-column>
      <el-table-column prop="port" label="端口"></el-table-column>
      <el-table-column prop="lastround" label="最后轮次" sortable></el-table-column>
      <el-table-column prop="contribution" label="贡献值" sortable></el-table-column>
      <el-table-column fixed="right" label="操作">
        <template #default="scope">
        <el-button link type="primary" size="small" @click="udetail(scope.row.channel, scope.row.uid)">详情</el-button>
        <el-button link type="primary" size="small" @click="remove(scope.row.id)">移除</el-button>
      </template></el-table-column>
    </el-table>
    <div class="tabListPage">
      <el-pagination @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :hide-on-single-page="true"
                    :current-page="currentPage"
                    :page-sizes="pageSizes"
                    :page-size="PageSize" layout="total, sizes, prev, pager, next, jumper"
                    :total="users.length">
      </el-pagination>
    </div>
  </d2-container>
</template>

<script>
import axios from 'axios'
export default {
  name: 'dashboard',
  data () {
    return {
      users: [],
      contributions: [],
      currentPage: 1,
      totalCount: 0,
      pageSizes: [10, 20, 50, 100],
      PageSize: 10,
      channels: [],
      channelFilters: []
    }
  },
  methods: {
    remove: function (id) {
      this.users = this.users.filter(function (item) {
        return item.id !== id
      })
    },
    getChannelList () {
      /* this.channels = ['mnist', 'cifar', 'imagenet']
      for (var channel in this.channels) {
        this.channelFilters.push({ text: channel, value: channel })
      } */
      axios.post('http://localhost:5500/channels', { orgCode: 1 }).then(response => {
        this.channels = response.data.channels
        for (var i = 0; i < this.channels.length; i++) {
          this.channelFilters.push({ text: this.channels[i].name, value: this.channels[i].name })
        }
      })
    },
    getData () {
      var clientlist
      var contri
      axios.post('http://localhost:5500/getLayerList').then(response => {
        clientlist = response.data
        axios.post('http://localhost:5500/getContri', '19').then(response => {
          contri = response.data
          clientlist.forEach((clientArray) => {
            const clientId = clientArray[0].split('-')[0]// Extracting client ID
            var c
            contri.forEach(obj => {
              if (`client${obj.ClientID}` === `${clientId}`) {
                c = obj.Contri[obj.Contri.length - 1]
              }
            })
            this.users.push({
              id: this.users.length + 1,
              uid: clientId,
              channel: 'mnist',
              hostname: 'localhost',
              port: 8011,
              lastround: 20,
              contribution: c
            })
          })
          this.totalCount = this.users.length
        })
      })
    },
    handleSizeChange (val) {
      this.PageSize = val
      this.currentPage = 1
    },
    handleCurrentChange (val) {
      this.currentPage = val
    },
    filterHandler (value, row) {
      return row.channel === value
    },
    udetail (channelname, uid) {
      this.$router.push('udetail/' + channelname + '/' + uid)
    }
  },
  created: function () {
    this.getData()
    this.getChannelList()
  }
}
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

table caption {
  font-size: 2em;
  font-weight: bold;
  margin: 1em 0;
}

th,
td {
  border: 1px solid #999;
  text-align: center;
  padding: 20px 0;
}

td button {
  margin-right: 10px;
}

table thead tr {
  background-color: #eee;
  color: #000;
}

table tbody tr:nth-child(even) {
  background-color: #eee;
}

table tbody tr:hover {
  background-color: #ccc;
}

// table tbody tr td:last-child{
//     background-color: transparent;
// }

table tfoot tr td {
  text-align: right;
  padding-right: 20px;
}
</style>
