import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./shared/infrastructure/store/store";
import { AppRoutes } from "./shared/infrastructure/routing/AppRoutes";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App
