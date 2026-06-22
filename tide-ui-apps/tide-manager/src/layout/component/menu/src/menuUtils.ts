export const hasOneShowingChild = (
    children: AppRouteRecordRaw[] = [],
    parent: AppRouteRecordRaw
): HasOneShowingChild => {
    const onlyOneChild = ref<OnlyOneChildType>()

    const showingChildren = children.filter((v) => {
        const meta = (v.meta ?? {}) as RouteMeta
        if (meta.hidden) {
            return false
        } else {
            // Temp set(will be used if only has one showing child)
            onlyOneChild.value = v
            return true
        }
    })

    // When there is only one child router, the child router is displayed by default
    if (showingChildren.length === 1) {
        return {
            oneShowingChild: true,
            onlyOneChild: unref(onlyOneChild)
        }
    }

    // Show parent if there are no child router to display
    if (!showingChildren.length) {
        onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
        return {
            oneShowingChild: true,
            onlyOneChild: unref(onlyOneChild)
        }
    }

    return {
        oneShowingChild: false,
        onlyOneChild: unref(onlyOneChild)
    }
}