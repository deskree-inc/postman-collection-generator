
import {Postman} from '../../postman'
import {PostmanController} from "../../interfaces/postmanController";
import * as fs from "fs";

jest.mock('fs');

const mockWriteSync = jest.spyOn(fs as any, 'writeFile').mockImplementation();
const obj = [{
    name: 'Test',
    description: 'Description',
    routes: [{
        name: 'test endpoint',
        url: 'test',
        method: 'GET',
        description: 'Some description',
        body: 'body'
    }]
} as PostmanController];
describe('Postman Unit test', () =>{
    beforeEach(() => {
        jest.resetAllMocks();
    })
    it('Generate controllers', async () => {
        const postman = new Postman('Test', 'https://test.com');
        const generateControllers = jest.spyOn(Postman.prototype as any, 'generateControllers').mockImplementation(() => obj);
        await postman.run('../', './');
        expect(mockWriteSync).toHaveBeenCalledTimes(1);
        expect(generateControllers).toHaveBeenCalledTimes(1);
    });
    it('Generate controllers with routes without body', async () => {
        const postman = new Postman('Test', 'https://test.com');
        const newObj = [{
            name: 'Test',
            description: 'Description',
            routes: [{
                name: 'test endpoint',
                url: 'test',
                method: 'GET',
                description: 'Some description',
                body: null
            }]
        } as PostmanController];
        const generateControllers = jest.spyOn(Postman.prototype as any, 'generateControllers').mockImplementation(() => newObj);
        await postman.run('../', './');
        expect(mockWriteSync).toHaveBeenCalledTimes(1);
        expect(generateControllers).toHaveBeenCalledTimes(1);
    })

    it('Generate controllers with routes with body', async () => {
        const postman = new Postman('Test', 'https://test.com');
        const generateControllers = jest.spyOn(Postman.prototype as any, 'generateControllers').mockImplementation(() => obj);
        await postman.run('../', './');
        expect(mockWriteSync).toHaveBeenCalledTimes(1);
        expect(generateControllers).toHaveBeenCalledTimes(1);
    })

    it('Generate controllers with verbose', async () => {
        const postman = new Postman('Test', 'https://test.com');
        const generateControllers = jest.spyOn(Postman.prototype as any, 'generateControllers').mockImplementation(() => obj);
        postman.verbose = true;
        mockWriteSync.mockImplementation((f,d,callback: () => void) => {
            callback()
        });
        await postman.run('../', './');
        expect(mockWriteSync).toHaveBeenCalledTimes(1);
        expect(generateControllers).toHaveBeenCalledTimes(1);
    })

    it('Generate controllers with exception', async () => {
        const postman = new Postman('Test', 'https://test.com');
        const generateControllers = jest.spyOn(Postman.prototype as any, 'generateControllers').mockRejectedValue('error');
        try {
            await postman.run('../', './');
        } catch (e) {

            expect(generateControllers).toHaveBeenCalledTimes(1);
            expect(mockWriteSync).toHaveBeenCalledTimes(0);
            expect(e.message).toBe('controllers is not iterable');
        }

    })

    it('Generate controllers with exception on readFileSync', async () => {
        const postman = new Postman('Test', 'https://test.com');
        const generateControllers = jest.spyOn(Postman.prototype as any, 'generateControllers').mockImplementation(() => obj);
        mockWriteSync.mockImplementation((f,d,callback: (error:string) => void) => {
            callback('error')
        });
        try {
            await postman.run('../', './');
        } catch (e) {
            expect(generateControllers).toHaveBeenCalledTimes(1);
            expect(mockWriteSync).toHaveBeenCalledTimes(1);
            expect(e).toBe('error');
        }

    })

    it('Generate controllers with routes with headers', async () => {
        const postman = new Postman('Test', 'https://test.com');
        const newObj = [{
            name: 'Test',
            description: 'Description',
            routes: [{
                name: 'test endpoint',
                url: 'test',
                method: 'GET',
                description: 'Some description',
                body: null,
                headers: [{
                    'X-Auth': 'key'
                }]
            }]
        } as PostmanController];
        const generateControllers = jest.spyOn(Postman.prototype as any, 'generateControllers').mockImplementation(() => newObj);
        await postman.run('../', './');
        expect(mockWriteSync).toHaveBeenCalledTimes(1);
        expect(generateControllers).toHaveBeenCalledTimes(1);
    })

    it('Generate controllers with routes with params', async () => {
        const postman = new Postman('Test', 'https://test.com');
        const newObj = [{
            name: 'Test',
            description: 'Description',
            routes: [{
                name: 'test endpoint',
                url: 'test',
                method: 'GET',
                description: 'Some description',
                body: null,
                headers: [{
                    'X-Auth': 'key'
                }],
                params: ['query', 'user']
            }]
        } as PostmanController];
        const generateControllers = jest.spyOn(Postman.prototype as any, 'generateControllers').mockImplementation(() => newObj);
        await postman.run('../', './');
        expect(mockWriteSync).toHaveBeenCalledTimes(1);
        expect(generateControllers).toHaveBeenCalledTimes(1);
    })

})
