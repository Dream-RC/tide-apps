<script lang="tsx">
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import TreeDropdown from './TreeDropdown.vue';


export default defineComponent({
    name: 'TreeSelect',
    props: {
        menuTree: {
            type: Array as PropType<Tree[]>, // ✅ 这里用 PropType<Tree[]>
            required: true
        },
        modelValue: {
            type: [String, Number],
            default: "0"
        }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {

        return () => (

            <div class="grid gap-2">
                <TreeDropdown
                    menuTree={props.menuTree}
                    modelValue={String(props.modelValue)}
                    onUpdate:modelValue={(value) => {
                        // 对于大数字ID，直接使用字符串避免精度丢失
                        emit('update:modelValue', value);
                    }}
                />
            </div>

        );
    }
});
</script>
