import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import IndexView from '../views/Index.vue'
import MatchListView from '../views/MatchList.vue'
import AdminInterfaceView from '../views/AdminInterface.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: IndexView
  },
  {
    path: '/admin',
    name: 'admin',
    component: MatchListView
  },
  {
    path: '/admin/:matchID',
    name: 'admininterface',
    component: AdminInterfaceView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
