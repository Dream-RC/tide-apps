import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@/plugins/tailwind/index.css";
import "@/styles/index.scss";

import {
  qiankunWindow,
  renderWithQiankun,
} from "vite-plugin-qiankun/dist/helper";

let root: ReactDOM.Root | null = null;

function render(props: any = {}) {
  const { container } = props;
  const mountEl = container
    ? container.querySelector("#root")
    : document.getElementById("root")!;

  root = ReactDOM.createRoot(mountEl);
  root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>,
  );
}

renderWithQiankun({
  async mount(props: any) {
    console.log("[tide-project] mount", props);
    render(props);
  },
  async bootstrap() {
    console.log("[tide-project] bootstrap");
  },
  async unmount() {
    console.log("[tide-project] unmount");
    root?.unmount();
    root = null;
  },
  async update() { },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
