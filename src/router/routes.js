import layoutHeaderAside from '@/layout/header-aside'

// 由于懒加载页面太多的话会造成webpack热更新太慢，所以开发环境不使用懒加载，只有生产环境使用懒加载
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)

/**
 * 在主框架内显示
 */
const frameIn = [
  {
    path: '/',
    redirect: { name: 'index' },
    component: layoutHeaderAside,
    children: [
      // 首页
      {
        path: '/fullcheck',
        name: 'fullcheck',
        meta: {
          auth: true
        },
        component: () => import('@/pages/fullcheck/index'),
        meta: {
          title: '全流程漏洞检查'
        }
      },
      {
        path: 'index',
        name: 'index',
        meta: {
          auth: true
        },
        component: _import('system/index')
        // component: () => import('@/pages/fullcheck/index')
      },
      // 新建
      {
        path: 'detect/locateOne',
        name: 'locateOne',
        meta: {
          title: '漏洞定位修复',
          auth: true
        },
        component: _import('system/detect/locateOne')
      },
      // 加入
      // // 配置
      // {
      //   path: 'profile',
      //   name: 'profile',
      //   meta: {
      //     title: '个人配置',
      //     auth: true
      //   },
      //   component: _import('system/profile')
      // },
      // 汇总页面
      {
        path: 'resultPage',
        name: 'resultPage',
        meta: {
          title: '检测结果',
          auth: true
        },
        component: _import('system/resultPage')
      },
      {
        path: '/locate/transactionUpload',
        name: 'transactionUpload',
        meta: {
          title: '漏洞定位',
          auth: true
        },
        component: _import('system/locate/transactionUpload')
      },
      {
        path: 'locate/locateResult',
        name: 'locateResult',
        meta: {
          title: '漏洞定位结果',
          auth: true
        },
        component: _import('system/locate/locateResult')
      },
      {
        path: 'locate/dappFLocateResult',
        name: 'dappFLocateResult',
        meta: {
          title: 'DAPPSCAN定位结果',
          auth: true
        },
        component: _import('system/locate/dappFLocateResult')
      },
      {
        path: 'detect/detectResult',
        name: 'detectResult',
        meta: {
          title: '漏洞检测结果',
          auth: true
        },
        component: _import('system/detect/detectResult')
      },
      {
        path: 'locate/locateConfidence',
        name: 'locateConfidence',
        meta: {
          title: '漏洞置信度分数',
          auth: true
        },
        component: _import('system/locate/locateConfidence')
      },
      {
        path: 'fuzzTest',
        name: 'fuzzTest',
        meta: {
          title: '底层系统模糊测试',
          auth: true
        },
        component: _import('system/fuzzTest')
      },
      {
        // path: '/udetail/:channelname/:uid',
        path: 'detect/locateMul',
        name: 'locateMul',
        meta: {
          title: '修复结果',
          auth: true
        },
        component: _import('system/detect/locateMul')
      },
      {
        path: '/detect/progress',
        name: 'detect-progress',
        component: () => import('@/pages/detect/progress'),
        meta: { title: '检测进度' }
      },
      {
        path: '/detect/result',
        name: 'detect-result',
        component: () => import('@/pages/detect/detectResult'),
        meta: { title: '检测结果' }
      },
      {
        path: '/locate/vuldatabase',
        name: 'vulnerability-database',
        component: () => import('@/pages/locate/vuldatabase'), 
        meta: { 
          title: '漏洞数据库',
          icon: 'fa fa-database' 
        }
      },
      {
        path: '/locate/vulrepair',
        name: 'vulnerability-repair',
        component: () => import('@/pages/locate/vulrepair'),
        meta: { 
          title: '精准检测与修复',
          icon: 'el-icon-magic-stick' 
        }
      },
      // // 演示页面
      // {
      //   path: 'page1',
      //   name: 'page1',
      //   meta: {
      //     title: '页面 1',
      //     auth: true
      //   },
      //   component: _import('demo/page1')
      // },
      // {
      //   path: 'page2',
      //   name: 'page2',
      //   meta: {
      //     title: '页面 2',
      //     auth: true
      //   },
      //   component: _import('demo/page2')
      // },
      // {
      //   path: 'page3',
      //   name: 'page3',
      //   meta: {
      //     title: '页面 3',
      //     auth: true
      //   },
      //   component: _import('demo/page3')
      // },
      // 系统 前端日志
      {
        path: 'log',
        name: 'log',
        meta: {
          title: '前端日志',
          auth: true
        },
        component: _import('system/log')
      },
      // 刷新页面 必须保留
      {
        path: 'refresh',
        name: 'refresh',
        hidden: true,
        component: _import('system/function/refresh')
      },
      // 页面重定向 必须保留
      {
        path: 'redirect/:route*',
        name: 'redirect',
        hidden: true,
        component: _import('system/function/redirect')
      },
      
      {
        path: '/repair-detail',
        name: 'repair-detail',
        component: () => import('@/pages/fullcheck/repair-detail'),
        meta: {
          title: '漏洞精准定位'
        }
      },
      {
        path: '/lowlevel-check',
        name: 'lowlevel-check',
        component: () => import('@/pages/fullcheck/lowlevel-check'),
        meta: {
          title: '漏洞补丁修复'
        }
      },
      {
        path: '/new',
        name: 'new',
        component: () => import('@/pages/fullcheck/new'),
        meta: {
          title: '底层漏洞检测'
        }
      }
      
    ]
  }
]

/**
 * 在主框架之外显示
 */
const frameOut = [
  // 登录
  {
    path: '/login',
    name: 'login',
    component: _import('system/login')
  }
]

/**
 * 错误页面
 */
const errorPage = [
  {
    path: '*',
    name: '404',
    component: _import('system/error/404')
  }
]

// 导出需要显示菜单的
export const frameInRoutes = frameIn

// 重新组织后导出
export default [
  ...frameIn,
  ...frameOut,
  ...errorPage
]
