export interface PostmanRouteInterface {
    name?: string,
    url: string,
    method: string,
    description?: string,
    body?: Record<string, any>,
    headers: Record<string, any>,
    params?: Array<string>
}
