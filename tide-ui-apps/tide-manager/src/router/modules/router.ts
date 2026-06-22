export const Layout = () => import("@/layout/Layout.vue");

/**
 *  基础性路由
 *
 * 所有节点都是挂载此节点下
 */
export const baseRoutes: AppRouteRecordRaw[] = [
    {
        path: "/login",
        component: () => import("@/views/system/login/Login.vue"),
        name: "Login",
        meta: {
            hidden: true,
            noTagsView: true,
        },
    },
    {
        path: "/",
        component: Layout,
        redirect: "/index",
        name: "Home",
        meta: {},
        children: [
            {
                path: "index",
                component: () => import("@/views/system/home/index.vue"),
                name: "Index",
                meta: {
                    title: "首页",
                    icon: "shouye",
                    noCache: false,
                    affix: true,
                },
            },
        ],
    },

    {
        path: "/member",
        component: Layout,
        name: "member",
        meta: {
            hidden: true,
        },
        children: [
            {
                path: "level/form/:id?",
                component: () =>
                    import("@/views/member/level/components/level-form.vue"),
                name: "MemberLevelForm",
                meta: {
                    // title: "字典数据",
                    // noCache: true,
                    // hidden: true,
                    // canTo: true,
                    // icon: "",
                    // activeMenu: "/system/dict",
                },
            },
        ],
    },

    {
        path: "/workflow",
        component: Layout,
        name: "workflow",
        meta: {
            hidden: true,
        },
        children: [
            {
                path: "form/edit",
                component: () => import("@/views/workflow/form/editor/index.vue"),
                name: "WorkflowFormEditor",
                meta: {
                    noCache: true,
                    hidden: true,
                    canTo: true,
                    title: "设计流程表单",
                    // activeMenu: "/bpm/manager/form",
                },
            },
            {
                path: "manager/design",
                component: () => import("@/views/workflow/model/index.vue"),
                name: "WorkflowModel",
                meta: {
                    noCache: true,
                    hidden: true,
                    canTo: true,
                    title: "流程设计",
                    activeMenu: "/workflow/manager/design",
                },
            },
            {
                path: "manager/model/create",
                component: () =>
                    import("@/views/workflow/model/form/index.vue"),
                name: "WorkflowModelCreate",
                meta: {
                    noCache: true,
                    hidden: true,
                    canTo: true,
                    title: "创建流程",
                    activeMenu: "/form/manager/model",
                },
            },
        ],
    },
];
