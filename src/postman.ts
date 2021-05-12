import {PostmanController} from "./interfaces/postmanController";
import {Collection, Item, ItemGroup, Request} from "postman-collection";
import * as fs from "fs";
import * as path from "path";

export class Postman {

    private postmanCollection
    private readonly _collectionName: string;
    private readonly _baseUrl: string;
    private _verbose: boolean = false;

    public set verbose(value: boolean) {
        this._verbose = value;
    }
    constructor(integrationName: string, baseUrl: string) {
        this._collectionName = integrationName;
        this._baseUrl = baseUrl;
        this.postmanCollection = new Collection({
            info: {
                name: this._collectionName
            }
        });
    }

    private generateControllers(dirPath: string): PostmanController[] {
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

    private static isPostmanCollection(object: any): object is PostmanController {
        return 'name' in object && 'description' in object;
    }

    private generatePostmanCollection(controller: PostmanController) {
        if (controller.hasOwnProperty('routes')) {
            if (this._verbose) {
                Postman.debug('creating');
            }
            const group = new ItemGroup({name: controller.name});
            group.describe(controller.description);

            controller.routes.forEach((obj) => {
                const request = {
                    url: `${this._baseUrl}${obj.url}`,
                    method: obj.method,
                    auth: null,
                    body: null
                };
                if (obj.hasOwnProperty('body')) {
                    request.body = {
                        mode: 'raw',
                        raw: JSON.stringify(obj.body),
                    }
                }
                const postmanRequest = new Request(request);
                if (obj.hasOwnProperty('headers')) {
                    for (const header of obj.headers) {
                        postmanRequest.addHeader(header)
                    }
                }
                if (obj.hasOwnProperty('params')) {
                    postmanRequest.addHeader(obj.params)
                }
                const postmanItem = new Item({
                    name: obj.name,
                    request: postmanRequest
                });
                if (obj.hasOwnProperty('description')) {
                    postmanItem.describe(obj.description);
                }
                group.items.add(postmanItem);
            });

            this.postmanCollection.items.add(group);
        }

    }

    private saveFile(outputPath: string) {
        // Convert the collection to JSON
        // so that it can be exported to a file
        const collectionJSON = this.postmanCollection.toJSON();
        // Create a collection.json file. It can be imported to postman
        fs.writeFile(`${outputPath}/collection.json`, JSON.stringify(collectionJSON), (err) => {
            if (err) {
                throw err;
            }
            if (this._verbose) {
                Postman.debug('File saved');
            }
        });
    }

    public run(dirPath: string, outputPath: string) {
        try {
            const controllers = this.generateControllers(dirPath);
            for (const controller of controllers) {
                this.generatePostmanCollection(controller)
            }
            this.saveFile(outputPath);
        } catch (e) {
            throw e;
        }
    }

    private static debug(message: string) {
        console.info(message);
    }
}
