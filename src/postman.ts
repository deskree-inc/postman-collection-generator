import {PostmanController} from "./interfaces/postmanController";
import {Collection, Item, ItemGroup} from "postman-collection";
import * as fs from "fs";
import * as path from "path";

export class Postman {
    private controllers: Array<PostmanController> = [];
    private postmanCollection
    private _collectionName: string;
    private _baseUrl: string;


    public set integrationName(value: string) {
        this._collectionName = value;
    }

    public set baseUrl(value: string) {
        this._baseUrl = value;
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

    private generateControllers(dirPath: string) {
        const files = fs.readdirSync(dirPath);
        for(const file of files) {
            const _module = require(path.join(`${process.cwd()}/${dirPath}`, file)).default;
            if (_module) {
                const obj = new _module();
                this.controllers.push(obj);
            }
        }

    }

    public generatePostmanCollection(controller: PostmanController) {

        const group = new ItemGroup({name: controller.name});
        group.describe(controller.description);

        controller.routes.forEach((obj) => {
            let request = {
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
            const postmanRequest = new Item({
                name: obj.name,
                request: request
            });
            group.items.add(postmanRequest);
        });

        this.postmanCollection.items.add(group);
    }

    public saveFile(outputPath: string) {
        // Convert the collection to JSON
        // so that it can be exported to a file
        const collectionJSON = this.postmanCollection.toJSON();

        // Create a collection.json file. It can be imported to postman
        fs.writeFile(`${outputPath}/collection.json`, JSON.stringify(collectionJSON), (err) => {
            if (err) {
                throw(err);
            }
            console.log(`Collection generated`);
        });
    }

    public run(dirPath: string, outputPath: string) {
        this.generateControllers(dirPath);
        for (const controller of this.controllers) {
            this.generatePostmanCollection(controller)
        }
        this.saveFile(outputPath);
    }
}