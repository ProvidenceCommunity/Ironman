import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Index from '@/views/Index.vue';
import MatchList from "@/views/MatchList.vue";

const routes: RouteRecordRaw[] = [
    { path: '/', component: Index },
    { path: '/admin', component: MatchList }
];

export default createRouter({
    history: createWebHistory(),
    routes
});
