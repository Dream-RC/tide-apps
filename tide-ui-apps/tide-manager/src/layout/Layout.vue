<script lang="tsx">

import { useAppStore } from "@/store/modules/app";
import { useRenderLayout } from "./useRenderLayout";

import './styles/index.scss'

const { layout } = useAppStore();


const renderLayout = () => {

    switch (layout) {

        case 'defaults':
            const { renderDefaults } = useRenderLayout()
            return renderDefaults()
        case 'classics':
            const { renderClassics } = useRenderLayout()
            return renderClassics()

        default:
            break
    }
}





export default defineComponent({
    name: 'Layout',
    setup() {
        return () => (
            <section>
                {renderLayout()}
            </section>
        )
    }
})



</script>
