import layoutHeaderAside from '@/layout/header-aside'

// 由于懒加载页面太多的话会造成webpack热更新太慢，所以开发环境不使用懒加载，只有生产环境使用懒加载
const _import = require('@/libs/util.import.' + process.env.NODE_ENV)

/**
 * 在主框架内显示
 */
const frameIn = [
  {
    path: '',
    redirect: { name: 'fullcheck' },
    component: layoutHeaderAside,
    children: [
      // 首页
      {
        path: '/fullcheck',
        name: 'fullcheck',
        meta: {
          auth: true,
          title: '全流程漏洞检查'
        },
        component: () => import('@/pages/fullcheck/index')
      },
      {
        path: 'fuzzTest',
        name: 'fuzzTest',
        meta: {
          title: '底层系统模糊测试',
          auth: true
        },
        component: () => import('@/pages/fuzz')
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
        name: 'vulnrepair',
        component: () => import('@/pages/locate/vulrepair'),
        meta: {
          title: '精准检测与修复',
          icon: 'el-icon-magic-stick'
        }
      },
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
        path: '/lowlevel-check',
        name: 'lowlevel-check',
        component: () => import('@/pages/fuzz/lowlevel-check'),
        meta: {
          title: '漏洞补丁修复'
        }
      },
      {
        path: '/new',
        name: 'new',
        component: () => import('@/pages/fuzz/new'),
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
