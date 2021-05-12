import {PostmanController} from "./interfaces/postmanController";
import {Collection, Item, ItemGroup} from "postman-collection";
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

    private async generateControllers(dirPath: string): Promise<PostmanController[]> {
        const files = fs.readdirSync(dirPath);
        const response = [];
        for(const file of files) {
            const location = path.join(`${process.cwd()}/${dirPath}/${file}`);
            const _module = await import(`${location}`) as PostmanController;
            if (_module) {
                if (this._verbose) {
                    Postman.debug(`Saving ${location}`);
                }
                response.push(_module);
            }
        }
        return response;

    }

    private generatePostmanCollection(controller: PostmanController) {

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
            const postmanRequest = new Item({
                name: obj.name,
                request: request
            });
            group.items.add(postmanRequest);
        });

        this.postmanCollection.items.add(group);
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

    public async run(dirPath: string, outputPath: string) {
        try {
            const controllers = await this.generateControllers(dirPath);
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
