import useAppStore from "@/store/modules/app";
import { useRenderLayout } from "./useRenderLayout";

const Layout = () => {
    const { layout } = useAppStore();
    const { renderDefaults, renderClassics } = useRenderLayout();

    const renderLayout = () => {
        switch (layout) {
            case "defaults":
                return renderDefaults();
            case "classics":
                return renderClassics();
            default:
                return renderDefaults();
        }
    };

    return (
        <section className="h-svh">
            {renderLayout()}
        </section>
    );
};

export default Layout;
