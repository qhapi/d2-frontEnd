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
        path: 'index',
        name: 'index',
        meta: {
          auth: true
        },
        component: _import('system/index')
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
      {
        path: 'detect/contractUpload',
        name: 'contractUpload',
        meta: {
          title: '漏洞挖掘',
          auth: true
        },
        component: _import('system/detect/contractUpload')
      },
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
      //汇总页面
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
        path: 'detect/detectResult',
        name: 'detectResult',
        meta: {
          title: '漏洞检测结果',
          auth: true
        },
        component: _import('system/detect/detectResult')
      },
      {
        path: 'fuzzTest',
        name: 'fuzzTest',
        meta: {
          title: '底层模糊测试',
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
