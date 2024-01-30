"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const react_router_1 = require("@tanstack/react-router");
require("./css/reset.css");
require("./css/global.css");
// Import the generated route tree
const routeTree_gen_1 = require("./routeTree.gen");
// Create a new router instance
const router = (0, react_router_1.createRouter)({ routeTree: routeTree_gen_1.routeTree });
client_1.default.createRoot(document.getElementById('root')).render(<react_1.default.StrictMode>
    <react_router_1.RouterProvider router={router}/>
  </react_1.default.StrictMode>);
