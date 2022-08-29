import App from "App";
import { GRAY_LIGHTEST } from "app/colorPalette";
import { put } from "app/nano";
import { store } from "app/store";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

put("body", {
  background: GRAY_LIGHTEST,
  margin: 0,
});

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
