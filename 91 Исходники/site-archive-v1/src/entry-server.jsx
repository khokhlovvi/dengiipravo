import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";

export { pages, site } from "./content.js";

export function render(url) {
  return renderToString(<App url={url} />);
}
