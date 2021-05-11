import {PostmanRoute} from "./postmanRoute";

export interface PostmanController {
    name: string,
    description: string,
    routes: Array<PostmanRoute>
}