# postman-generator

This package generates postman collection from express controllers.

## Installing

Install package as a dev dependency via npm.

```
npm install --save @deskree-inc/postman-generator
```

Import package either into the base class of your controllers or to each controller individually:

```
import {PostmanController} from "@deskree-inc/postman-collection-generator";
```

## Using

### Controller Data Structure

postman-generator creates postman collections from express controllers. In order for the collection and items to be generated correctly, each controller has to be a class that implements a `PostmanController` and have the apprpriate data structure. See example below:

```
// exampleController.ts
import {PostmanController} from "@deskree-inc/postman-collection-generator";

export class ExampleController implements PostmanController {

    public name = 'Example Name of Postman Folder';
    public description = 'Example Description of Postman Folder';
    public routes = [
        {
            name: 'GET Something by id',
            url: '/example/{{id}}',
            method: 'GET',
            description: 'Get something from somewhere by some id',
            params: ['some_param=123'],
            headers: [{ key: 'Content-Type', value: 'application/json' }]
        },
        {
            name: 'Create Product',
            url: '/product',
            method: 'POST',
            body: {
                product: {
                    title: "Product Name",
                    price: 12,
                    tags: [
                        "Product"
                    ]
                }
            }
        }
    ]

    ...
```

### Overall Data Structure

| Parameter   | Type   | Required | Description                                |
|-------------|--------|----------|--------------------------------------------|
| name        | string | yes      | Name of Postman folder (itemsGroup)        |
| description | string | no       | Description of Postman folder (itemsGroup) |
| routes      | array  | yes      | List of Postman requests (items)           |


### `routes` Data Structure


| Parameter   | Type             | Required | Description                                                                                                                            |
|-------------|------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------|
| name        | string           | yes      | Name of Postman request                                                                                                                |
| description | string           | no       | Description of Postman request                                                                                                         |
| url         | string           | yes      | Postman request URL                                                                                                                    |
| method      | string           | yes      | Postman request method (ex. GET, POST, PUT, DELETE)                                                                                    |
| params      | array of strings | no       | List of postman request parameters                                                                                                     |
| headers     | array of objects | no       | List of postman request headers. Each header must have the following structure: { key: 'Some header key', value: 'some header value' } |
| body        | object           | no       | Body of postman request                                                                                                                |

### Configure `package.json`

In order to run postman-generator, just add the following line into your `package.json`'s `"scripts"` with appropriate parameters. Example:

```
...
"scripts": {
    "postman": "postman-generator --folder src/controllers --outputDir ./ --integrationName Example --baseURL https://user.deskree.com/api/v1"
}
...
```

Command parameters:

| Parameter         | Type   | Required | Description                                          |
|-------------------|--------|----------|------------------------------------------------------|
| --folder          | string | yes      | Folder with your controllers                         |
| --outputDir       | string | yes      | Folder where you want to save the postman collection |
| --integrationName | string | yes      | Name of your postman collection                      |
| --baseURL         | string | yes      | Base url for all requests within your collection     |

### Run

Once everything is set up and `package.json` is configured, just run the following command to generate your Postman collection:

```
npm run postman
```

### Output

The command will generate `collection.json` file in the specified folder. You can import this collection into Postman.

## Built with

* [Typescript](https://www.typescriptlang.org/)
* [Postman Collection SDK](https://www.postmanlabs.com/postman-collection/)

## Authors

* **Deskree Team** - [deskree-inc](https://github.com/deskree-inc)
* **Gustavo Sanchez** - [antero10](https://github.com/antero10)

## License

This project is licensed under the MIT License
