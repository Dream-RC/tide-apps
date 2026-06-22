import MyFlowDesigner from "./FlowDesigner.vue";

MyFlowDesigner.install = function (Vue) {
  Vue.component(MyFlowDesigner.name, MyFlowDesigner);
};

// 流程图的设计器，可编辑
export default MyFlowDesigner;
