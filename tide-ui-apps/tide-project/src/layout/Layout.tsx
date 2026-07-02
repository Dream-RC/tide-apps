import useAppStore from "@/store/modules/app";
import { useRenderLayout } from "./useRenderLayout";
import "./style/index.scss";

const Layout = () => {
    const { layout } = useAppStore();

    switch (layout) {
        case "defaults":
            const { renderDefaults } = useRenderLayout();
            return renderDefaults();
        case "classics":
            const { renderClassics } = useRenderLayout();
            return renderClassics();
        default:
            return null;
    }
};

export default Layout;