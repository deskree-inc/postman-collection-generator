export interface PostmanRoute {
    name: string,
    url: string,
    method: string,
    description?: string,
    body?: string,
    headers?: Array<Object>,
    params?: Array<string>
}