<script lang="tsx">
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Icon } from '../../Icon';


export default defineComponent({
    name: 'TreeDropdown',
    props: {
        menuTree: {
            type: Array as PropType<Tree[]>, // ✅ 这里用 PropType<Tree[]>
            required: true
        },
        modelValue: {
            type: String,
            default: '0'
        }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const openIds = ref<String[]>([]);

        const toggleOpen = (id: String) => {
            const index = openIds.value.indexOf(id);
            if (index !== -1) {
                // 已经打开，移除
                openIds.value.splice(index, 1);
            } else {
                // 未打开，添加
                openIds.value.push(id);
            }
        };

        const handleSelect = (node: Tree) => {
            // 直接传递node.id，使用字符串类型避免精度丢失
            emit('update:modelValue', node.id);
            dropdownOpen.value = false; // 选择后关闭下拉菜单
        };

        // 添加下拉菜单状态控制
        const dropdownOpen = ref(false);

        // 使用字符串类型处理大数字ID，避免精度丢失
        const currentValue = computed(() => {
            return props.modelValue || '0';
        });

        const selectedName = computed(() => {
            const findName = (nodes: Tree[]) => {
                for (let node of nodes) {
                    // 使用宽松比较，兼容数字和字符串类型
                    if (node.id == currentValue.value) return node.name;
                    if (node.children) {
                        const child = findName(node.children);
                        if (child) return child;
                    }
                }
                return undefined;
            };
            return findName(props.menuTree) || "顶级菜单";
        });

        const renderTree = (nodes: Tree[], level = 0) => {
            return nodes.map((node) => (
                
                <div key={node.id}>
                    <DropdownMenuItem
                        className={`cursor-pointer transition-colors duration-200 hover:bg-accent/50 ${node.id === currentValue.value ? '' : ''}`}
                        onClick={() => handleSelect(node)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            paddingLeft: `${level * 24 + 12}px`,
                            paddingRight: '12px',
                            paddingTop: '8px',
                            paddingBottom: '8px',
                            minHeight: '40px'
                        }}
                    >
                        {node.children && node.children.length > 0 && (
                            <span
                                className="flex items-center justify-center w-6 h-6 rounded hover:bg-accent transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation(); // 阻止冒泡
                                    toggleOpen(node.id);
                                }}
                            >
                                {
                                    openIds.value.includes(node.id) ?
                                        <Icon className='text-muted-foreground hover:text-foreground' icon={'shang1'} size={16} />
                                        :
                                        <Icon className='text-muted-foreground hover:text-foreground' icon={'xia1'} size={16} />
                                }
                            </span>
                        )}
                        {!node.children || node.children.length === 0 && (
                            <span className="w-6"></span>
                        )}
                        <span className="flex-1 ml-2 text-sm font-medium">{node.name}</span>
                    </DropdownMenuItem>

                    {node.children &&
                        node.children.length > 0 &&
                        openIds.value.includes(node.id) &&
                        renderTree(node.children, level + 1)}
                </div>
            ));
        }



        return () => (
            <>
                <DropdownMenu v-model:open={dropdownOpen.value}>
                    <DropdownMenuTrigger asChild>
                        <button className="text-left px-4 py-2 border border-input w-full rounded-md h-10 bg-background  transition-colors">
                            <span className="text-sm font-medium">{selectedName.value}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        className="max-h-80 overflow-auto"
                        style={{ width: '340px' }}
                        aria-describedby="tree-dropdown-description"
                    >
                        <div className="p-1">
                            <div id="tree-dropdown-description" className="sr-only">
                                树形菜单选择器
                            </div>
                            {renderTree(props.menuTree)}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        );
    }
});
</script>