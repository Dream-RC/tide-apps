// 创建实例
import { type App as VueApp, createApp } from "vue";
import App from "./App.vue";
import "@/plugins/tailwind/index.css";
import "@/styles/index.scss";
import "vue-sonner/style.css";
import {
    qiankunWindow,
    renderWithQiankun,
} from "vite-plugin-qiankun/dist/helper";

import router, { setupRouter } from "@/router";

import { setupStore } from "@/store";

import "./permission";

let app: VueApp<Element> | null = null;

function render(props: any = {}) {
    const { container } = props;
    app = createApp(App);
    setupStore(app);
    setupRouter(app);

    const mountEl = container
        ? container.querySelector("#app")
        : document.getElementById("app")!;

    return router.isReady().then(() => {
        app!.mount(mountEl);
    });
}

renderWithQiankun({
    async mount(props: any) {
        console.log("[tide-ui-manager] mount", props);
        await render(props);
    },
    async bootstrap() {
        console.log("[tide-ui-manager] bootstrap");
    },
    async unmount() {
        console.log("[tide-ui-manager] unmount");
        app?.unmount();
        app = null;
    },
    async update() {},
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    render({});
}
