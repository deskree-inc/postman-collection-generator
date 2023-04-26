import {PostmanControllerInterface} from "./interfaces/postmanController.interface";
import {Collection, Item, ItemGroup} from "postman-collection";
import * as fs from "fs";
import * as path from "path";
import {PostmanRouteInterface} from "./interfaces/postmanRoute.interface";

export class Postman {

    private postmanCollection
    private readonly _collectionName: string;
    private readonly _baseUrl: string;
    private _verbose: boolean = false;
    private skipExceptions: boolean = false;

    public set verbose(value: boolean) {
        this._verbose = value;
    }
    constructor(integrationName: string, baseUrl: string, skipExceptions?: boolean) {
        this._collectionName = integrationName;
        this._baseUrl = baseUrl;
        this.skipExceptions = skipExceptions !== undefined ? skipExceptions : false;
        this.postmanCollection = new Collection({
            info: {
                name: this._collectionName
            }
        });
    }

    private generateControllers(dirPath: string): PostmanControllerInterface[] {
        const files = fs.readdirSync(dirPath);
        const response = [];
        for(const file of files) {
            const location = path.join(`${process.cwd()}/${dirPath}/${file}`);
            const _module = require(path.join(`${process.cwd()}/${dirPath}`, file)).default;
            if (_module) {
                const obj = new _module();
                if (this._verbose) {
                    Postman.debug(`Saving ${location}`);
                }
                if (Postman.isPostmanCollection(obj)) {
                    response.push(obj);
                }

            }
        }
        return response;
    }

    private static isPostmanCollection(object: any): object is PostmanControllerInterface {
        return 'name' in object && 'description' in object;
    }

    private generatePostmanCollection(controller: PostmanControllerInterface) {
        if (controller.hasOwnProperty('routes')) {
            if (this._verbose) {
                Postman.debug('Generating postman collection');
                Postman.debug(`Working on ${controller.name}`);
            }
            const group: ItemGroup<Item> = new ItemGroup({name: controller.name});
            group.describe(controller.description);

            controller.routes.forEach((obj) => {
                const request: PostmanRouteInterface = {
                    url: `${this._baseUrl}${obj.url}`,
                    method: obj.method,
                    headers: {}
                };
                if (obj.hasOwnProperty('body')) {
                    request['body'] = {
                        mode: 'raw',
                        raw: JSON.stringify(obj.body),
                        options: {
                            raw: {
                                language: "json"
                            }
                        }
                    }
                }
                if (Object.prototype.hasOwnProperty.call(obj, 'headers') && obj.headers !== undefined) {
                    request.headers = obj.headers;
                }
                request.headers['Content-Type'] = 'application/json';
                if (Object.prototype.hasOwnProperty.call(obj, 'params') && obj.params !== undefined) {
                    request.url += '?';
                    for (const param of obj.params) {
                        request.url += `${param}&`
                    }
                    request.url = request.url.slice(0, -1);
                }
                if (obj.hasOwnProperty('description')) {
                    request['description'] = obj.description
                }
                const item = {
                    name: obj.name ? obj.name : obj.url,
                    request: request
                }
                // @ts-ignore
                group.items.add(item);
            });

            this.postmanCollection.items.add(group);
        }

    }

    private saveFile(outputPath: string) {
        // Convert the collection to JSON
        // so that it can be exported to a file
        const collectionJSON = this.postmanCollection.toJSON();
        // Create a collection.json file. It can be imported to postman
        fs.writeFile(`${outputPath}/collection.json`, JSON.stringify(collectionJSON), (e) => {
            if (e) {
                if (!this.skipExceptions) {
                    if (typeof e === "string") {
                        Postman.debug(e);
                    } else if (typeof e === "object"){
                        Postman.debug(JSON.stringify(e));
                    } else {
                        console.error(e);
                    }
                    process.exit(1);
                    throw e;
                }
            } else {
                if (this._verbose) {
                    Postman.debug('File saved');
                    Postman.debug(JSON.stringify(collectionJSON));
                }
                // process.exit(0);
            }
        });
    }

    public run(dirPath: string, outputPath: string) {
        try {
            Postman.debug(`Initialized postman collection generation from directory ${dirPath}. Saving data to ${outputPath}`);
            const controllers = this.generateControllers(dirPath);
            Postman.debug("List of all controllers:");
            for (const controller of controllers) {
                Postman.debug(controller);
                this.generatePostmanCollection(controller)
            }
            this.saveFile(outputPath);
        } catch (e) {
            if (typeof e === "string") {
                Postman.debug(e);
            } else if (typeof e === "object"){
                Postman.debug(JSON.stringify(e));
            } else {
                console.error(e);
            }
            throw e;
        }
    }

    private static debug(message: string | PostmanControllerInterface) {
        console.info(message);
    }
}
