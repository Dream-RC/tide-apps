import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import { createRouter } from "./routes";
import { getAccessToken } from "./common/utils/auth";
import usePermissionStore from "./store/modules/permission";
import useDictStore from "./store/modules/dictStore";
import useUserStore from "./store/modules/user";

const App = () => {
  const [router, setRouter] = useState<ReturnType<typeof createRouter> | null>(
    null,
  );
  // 路由不重定向白名单
  const whiteList = [
    "/login",
  ];

  useEffect(() => {
    const init = async () => {

      const path = window.location.pathname;
      // if (!token) {
      //   if (path !== "/login") {
      //     window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
      //     return;
      //   }
      //   setRouter(createRouter());
      //   return;
      // }

      // if (path === "/login") {
      //   window.location.href = "/index";
      //   return;
      // }

      if (getAccessToken()) {
        // window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        if (path === "/login" || path === "/") {
          window.location.href = `/index`;
        } else {

          const dictStore = useDictStore.getState();
          const userStore = useUserStore.getState();


          if (!dictStore.getIsSetDict()) {
            dictStore.setDictMap();
          }
          if (!userStore.getIsSetUser()) {
            userStore.setUserInfoAction();
          }

        }

      } else {

        if (whiteList.indexOf(path) !== -1) {

        } else {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }
      }


      // await usePermissionStore.getState().generateRoutes();
      // const dynamicRoutes = usePermissionStore.getState().getRouters();
      // console.log(dynamicRoutes);
      setRouter(createRouter());

    };

    init();
  }, []);

  useEffect(() => {
    const unsub = usePermissionStore.subscribe((state) => {
      if (state.routers.length > 0 && router) {
        setRouter(createRouter(state.routers));
      }
    });
    return unsub;
  }, [router]);

  if (!router) {
    return null;
  }

  return <RouterProvider router={router} />;
};

export default App;
