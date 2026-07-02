import { Outlet } from "react-router";

export const useRenderLayout = () => {
    const renderDefaults = () => {
        return (
            <section className="screen-container">
                <Outlet />
            </section>
        );
    };

    const renderClassics = () => {
        return (
            <section className="screen-container">
                <Outlet />
            </section>
        );
    };

    return {
        renderDefaults,
        renderClassics,
    };
};