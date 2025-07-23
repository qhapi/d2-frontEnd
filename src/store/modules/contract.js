// 合约全局存储模块
const state = {
  contractFile: null, // File 对象
  contractCode: '', // 代码字符串
  uploadedReport: null, // 新增：上传的漏洞报告文件
  analyzeResult: null // 新增：分析结果参数
}

const mutations = {
  setContractFile (state, file) {
    state.contractFile = file
  },
  setContractCode (state, code) {
    state.contractCode = code
  },
  setUploadedReport (state, file) { // 新增
    state.uploadedReport = file
  },
  setAnalyzeResult (state, result) { // 新增
    state.analyzeResult = result
  }
}

const actions = {
  saveContractFile ({ commit }, file) {
    commit('setContractFile', file)
  },
  saveContractCode ({ commit }, code) {
    commit('setContractCode', code)
  },
  saveUploadedReport ({ commit }, file) { // 新增
    commit('setUploadedReport', file)
  },
  saveAnalyzeResult ({ commit }, result) { // 新增
    commit('setAnalyzeResult', result)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
