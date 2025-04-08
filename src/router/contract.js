const Layout = () => import('@/layouts/container')
export default {
  path: '/contract',
  component: Layout,
  children: [{
    path: 'check',
    name: 'ContractCheck',
    component: () => import('@/pages/contract/check'),
    meta: { title: '合约漏洞速查', auth: true }
  }]
}