import { Providers } from "@/app/providers";
import { Router } from "@/app/router";

const App = () => {
  return (
    <Providers>
      <Router />
    </Providers>
  );
};

export default App;
