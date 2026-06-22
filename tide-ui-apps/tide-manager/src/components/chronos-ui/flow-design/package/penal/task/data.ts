import UserTask from './task-components/UserTask.vue'

export const installedComponent = {
  UserTask: {
    name: '用户任务',
    component: UserTask
  },
}

export const getTaskCollapseItemName = (elementType) => {
  return installedComponent[elementType].name
}

export const isTaskCollapseItemShow = (elementType) => {
  return installedComponent[elementType]
}
