import { uniqueId } from 'lodash'

/**
 * @description 给菜单数据补充上 path 字段
 * @description https://github.com/d2-projects/d2-admin/issues/209
 * @param {Array} menu 原始的菜单数据
 */
function supplementPath (menu) {
  return menu.map(e => ({
    ...e,
    path: e.path || uniqueId('d2-menu-empty-'),
    ...e.children ? {
      children: supplementPath(e.children)
    } : {}
  }))
}

export const menuHeader = supplementPath([
  // { path: '/index', title: '合约漏洞速查', icon: 'tachometer' },
  // { path: '/dashboard', title: '控制台', icon: 'tachometer' },
  // { path: '/detect/contractUpload', title: '漏洞挖掘', icon: 'list' },
  // { path: '/detect/detectResult', title: '漏洞检测结果', icon: 'tachometer' },
  // { path: '/locate/locateResult', title: '精准检测与修复', icon: 'list' },
  // { path: '/locate/locateConfidence', title: '漏洞置信度', icon: 'fa fa-square-full' },
  // { path: '/fuzzTest', title: '底层系统模糊测试', icon: 'desktop' },
  // { path: '/index', title: '合约漏洞速查', icon: 'tachometer' },
  // { path: '/locate/vulrepair', title: '精准检测与修复', icon: 'list' },
  // { path: '/fuzzTest', title: '底层系统模糊测试', icon: 'desktop' },
  // { path: '/locate/vuldatabase', title: '漏洞数据库', icon: 'fa fa-square-full' }
  {
    path: '/fullcheck',
    title: '全流程漏洞检查',
    icon: 'el-icon-s-check'
  }
  // { path: '/profile', title: '个人设置', icon: 'locateMul' },
  // {
  //   title: '页面',
  //   icon: 'folder-o',
  //   children: [
  //     { path: '/page1', title: '页面 1' },
  //     { path: '/page2', title: '页面 2' },
  //     { path: '/page3', title: '页面 3' }
  //   ]
  // }
])

export const menuAside = supplementPath([

  { path: '/detect/result', title: '合约漏洞速查', icon: 'tachometer' },
  { path: '/locate/vulrepair', title: '精准检测与修复', icon: 'list' },
  { path: '/fuzzTest', title: '底层系统模糊测试', icon: 'desktop' },
  { path: '/locate/vuldatabase', title: '漏洞数据库', icon: 'fa fa-square-full' },
  { path: '/fullcheck', title: '全流程漏洞检查', icon: 'el-icon-s-check' },
  //{ path: '/fullcheck/repair-detail', title: '漏洞修复详情', icon: 'el-icon-s-check' },
  // { path: '/dashboard', title: '控制台', icon: 'tachometer' },
  // { path: '/detect/detectResult', title: '漏洞检测结果', icon: 'tachometer' },
  // { path: '/locate/vulrepair', title: '精准检测与修复', icon: 'list' },
  // { path: '/locate/locateConfidence', title: '漏洞置信度', icon: 'fa fa-square-full' },
  // { path: '/locate/transactionUpload', title: '漏洞定位修复', icon: 'plus' },
  // { path: '/fuzzTest', title: '底层系统模糊测试', icon: 'desktop' },
  // { path: '/locate/locateConfidence', title: '漏洞数据库', icon: 'fa fa-square-full' }
  // { path: '/profile', title: '个人设置', icon: 'locateMul' },
  // {
  //   title: '页面',
  //   icon: 'folder-o',
  //   children: [
  //     { path: '/page1', title: '页面 1' },
  //     { path: '/page2', title: '页面 2' },
  //     { path: '/page3', title: '页面 3' }
  //   ]
  // }
])
