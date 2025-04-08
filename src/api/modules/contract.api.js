import http from '../service.js'

export default {
  // 合约漏洞检测接口
  checkContract: data => http.post('/api/contract/check', data, {
    headers: { 'Content-Type': 'application/solidity' }, // 特殊内容类型标识
    timeout: 30000 // 超时时间延长至30秒
  }),
  
  // 历史检测记录查询接口（扩展功能）
  getCheckHistory: params => http.get('/api/contract/history', { params })
}