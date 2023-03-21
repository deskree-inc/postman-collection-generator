import {PostmanRouteInterface} from "./postmanRoute.interface";

export interface PostmanControllerInterface {
    name: string,
    description: string,
    routes: Array<PostmanRouteInterface>
}
