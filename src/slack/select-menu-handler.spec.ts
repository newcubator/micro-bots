import { interactionHandler } from './interaction-handler';
import { selectMenuHandler } from './select-menu-handler';

it("handle interaction with wrong action type", async () => {
    const result = await selectMenuHandler({
        body: ""
    } as any);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(200);
});
