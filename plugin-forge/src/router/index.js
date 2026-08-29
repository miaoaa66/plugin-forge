import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const SITE_TITLE = 'Plugin Forge'

const router = createRouter({
  // 固定 '/'：避免 Vite base:'./' 使 BASE_URL 变为 './' 导致 hash 路由异常
  history: createWebHashHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首页' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: '关于' },
    },
    {
      path: '/variable',
      name: 'variable-convert',
      component: () => import('../views/VariableConvertView.vue'),
      meta: { title: '变量格式转换' },
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title ? `${title} - ${SITE_TITLE}` : SITE_TITLE
})

export default router