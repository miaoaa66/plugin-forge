import { HomeFilled, InfoFilled, Switch } from '@element-plus/icons-vue'

/**
 * 侧边栏菜单配置
 * - 顶层项：{ key, label, icon }
 * - 含子菜单：{ key, label, icon, children: [{ key, label }] }
 * key 同时作为路由路径
 */
export const menuList = [
  {
    key: '/',
    label: '首页',
    icon: HomeFilled,
  },
  {
    key: '/about',
    label: '关于',
    icon: InfoFilled,
  },
  {
    key: '/variable',
    label: '变量格式转换',
    icon: Switch,
  },
]

/**
 * 把两层菜单拍平成可搜索的扁平列表
 * - 含 children 的顶层项：每个 child 拍平为 { key, label, category, icon }
 * - 无 children 的叶子项（首页/、关于/about、变量格式转换/variable）：{ key, label, category: null, icon }
 */
export function flattenMenu(menu = menuList) {
  const list = []
  for (const item of menu) {
    if (item.children && item.children.length) {
      for (const child of item.children) {
        list.push({
          key: child.key,
          label: child.label,
          category: item.label,
          icon: item.icon,
        })
      }
    } else {
      list.push({
        key: item.key,
        label: item.label,
        category: null,
        icon: item.icon,
      })
    }
  }
  return list
}