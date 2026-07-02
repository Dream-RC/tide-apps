

import { useState } from "react";
import { RouterProvider } from "react-router";
import LoadingScreen from "@/components/tide-ui/loading-screen";
import { createRouter } from "@/routes";

const router = createRouter();

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && (
        <LoadingScreen onFinished={() => setLoading(false)} />
      )}
      <RouterProvider router={router} />
    </>
  );
};

export default App;