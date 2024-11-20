import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.scss";

import { HomePage } from "./pages/home/home-page";

const container = document.createElement("div");
container["className"] = "app";
document.body.append(container);

const root = createRoot(container);

root.render(<HomePage />);
