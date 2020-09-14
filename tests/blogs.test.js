const Page = require('./helpers/page');
 
let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in,', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog create form', async () => {
        const label = await page.getContentsOf('form label');
    
        expect(label).toEqual('Blog Title');
    });

    describe('And using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'Test Title');
            await page.type('.content input', 'Test Content');
            await page.click('form button');
        });

        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('Submitting when saving adds blog to index page,', async () => {
            await page.click('button.green');
            await page.waitFor('div.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('Test Title');
            expect(content).toEqual('Test Content');
        });
    });

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('User is not logged in', async () => {
    test('user cannot create blog posts', async () => {
        const result = await page.post('/api/blogs', { title: 'api run title', content: 'api run content' })
        
        expect(result).toEqual({ error: "You must log in!" });
    });

    test('user cannot get a list of posts', async () => {
        const result =  await page.get('/api/blogs');
        
        expect(result).toEqual({ error: "You must log in!" });
    });
});