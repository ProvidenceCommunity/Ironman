import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import IndexView from '../views/Index.vue'
import MatchListView from '../views/MatchList.vue'
import AdminInterfaceView from '../views/AdminInterface.vue'
import PlayerClientView from '../views/PlayerClient.vue';
import OverlayView from '../views/StandardOverlay.vue';
import LocalLoginView from '../views/LocalLogin.vue';
import BingoTournamentOverlay from "@/views/BingoTournamentOverlay.vue";

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
  },
  {
    path: '/client/:matchID/:player',
    name: 'playerclient',
    component: PlayerClientView
  },
  {
    path: '/overlay/:matchID',
    name: 'overlay',
    component: OverlayView
  },
  {
    path: '/bingo-overlay/:matchID',
    name: 'bingotournamentoverlay',
    component: BingoTournamentOverlay
  },
  {
    path: '/login',
    name: 'locallogin',
    component: LocalLoginView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
