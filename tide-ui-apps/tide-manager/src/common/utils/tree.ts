// export const handleTree = (data: any[], id?: string, parentId?: string, children?: string) => {
//
//     const menu = {
//         id: id || 'id',
//         parentId: parentId || 'parentId',
//         childrenList: children || 'children'
//     }
//
//     const result: any[] = []
//     const childrenMap = {}
//     const nodeId = {}
//     data.forEach(node => {
//         const parentId = node[menu.parentId];
//         if (childrenMap[parentId] == null) {
//             childrenMap[parentId] = [];
//         }
//         nodeId[node[menu.id]] = node
//         childrenMap[parentId].push(node)
//     });
//     data.forEach(node => {
//         const parentId = node[menu.parentId];
//         if (nodeId[parentId] == null) {
//             result.push(node)
//         }
//     });
//     result.forEach(t => {
//         addChildrenList(t);
//     });
//     function addChildrenList(o) {
//         if (childrenMap[o[menu.id]] !== null) {
//             o[menu.childrenList] = childrenMap[o[menu.id]]
//         }
//         if (o[menu.childrenList]) {
//             o[menu.childrenList].forEach(c => {
//                 addChildrenList(c)
//             })
//         }
//     }
//     return result;
// }

export const defaultProps = {
    children: 'children',
    label: 'name',
    value: 'id',
    isLeaf: 'leaf',
    emitPath: false // 用于 cascader 组件：在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
}


interface TreeHelperConfig {
    id: string
    children: string
    pid: string
}

const DEFAULT_CONFIG: TreeHelperConfig = {
    id: 'id',
    children: 'children',
    pid: 'pid'
}

const getConfig = (config: Partial<TreeHelperConfig>) => Object.assign({}, DEFAULT_CONFIG, config)


interface TreeNode {
    id: string;
    parentId: string | null;
    children?: TreeNode[];
}

export const handleTree = (data: TreeNode[],): TreeNode[] => {
    const map = new Map<string, TreeNode>();

    data.forEach(node => {
        map.set(node.id, {...node, children: []});
    });

    // Build the tree structure
    const rootNodes: TreeNode[] = [];
    data.forEach(node => {
        const parentNode = map.get(node.parentId);

        if (parentNode) {
            parentNode.children.push(map.get(node.id)!);
        } else {
            rootNodes.push(map.get(node.id)!);
        }
    });

    return rootNodes;
};

export const treeToList = <T = any>(tree: any, config: Partial<TreeHelperConfig> = {}): T => {
    config = getConfig(config)
    const {children} = config
    const result: any = [...tree]
    for (let i = 0; i < result.length; i++) {
        if (!result[i][children!]) continue
        result.splice(i + 1, 0, ...result[i][children!])
    }
    return result
}

export const filter = <T = any>(
    tree: T[],
    func: (n: T) => boolean,
    config: Partial<TreeHelperConfig> = {}
): T[] => {
    config = getConfig(config)
    const children = config.children as string

    function listFilter(list: T[]) {
        return list
            .map((node: any) => ({...node}))
            .filter((node) => {
                node[children] = node[children] && listFilter(node[children])
                return func(node) || (node[children] && node[children].length)
            })
    }

    return listFilter(tree)
}


/**
 * 获取节点的完整结构
 * @param tree 树数据
 * @param nodeId 节点 id
 */
export const treeToString = (tree: any[], nodeId) => {

    if (typeof tree === 'undefined' || !Array.isArray(tree) || tree.length === 0) {
        return ''
    }

    // 校验是否是一级节点
    const node = tree.find((item) => item.id === nodeId)
    if (typeof node !== 'undefined') {
        return node.name
    }
    let str = ''

    function performAThoroughValidation(arr) {
        if (typeof arr === 'undefined' || !Array.isArray(arr) || arr.length === 0) {
            return false
        }
        for (const item of arr) {
            if (item.id === nodeId) {
                str += ` / ${item.name}`
                return true
            } else if (typeof item.children !== 'undefined' && item.children.length !== 0) {
                str += ` / ${item.name}`
                if (performAThoroughValidation(item.children)) {
                    return true
                }
            }
        }
        return false
    }

    for (const item of tree) {
        str = `${item.name}`
        if (performAThoroughValidation(item.children)) {
            break
        }
    }
    return str
}

export const findPath = <T = any>(
    tree: any,
    func: Fn,
    config: Partial<TreeHelperConfig> = {}
): T | T[] | null => {
    config = getConfig(config)
    const path: T[] = []
    const list = [...tree]
    const visitedSet = new Set()
    const { children } = config
    while (list.length) {
        const node = list[0]
        if (visitedSet.has(node)) {
            path.pop()
            list.shift()
        } else {
            visitedSet.add(node)
            node[children!] && list.unshift(...node[children!])
            path.push(node)
            if (func(node)) {
                return path
            }
        }
    }
    return null
}