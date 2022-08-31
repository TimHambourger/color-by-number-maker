import App from "App";
import { GRAY_LIGHT } from "app/colorPalette";
import { put } from "app/nano";
import { store } from "app/store";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

put("body", {
  background: GRAY_LIGHT,
  margin: 0,
});

put("*", {
  boxSizing: "border-box",
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
