import {handler} from './twitter-bot';
import Parser from 'rss-parser';
import { TwitterApi } from 'twitter-api-v2';

jest.mock('twitter-api-v2');
jest.mock('rss-parser');

const TwitterMock = TwitterApi as jest.MockedClass<typeof TwitterApi>
const ParserMock = Parser as jest.MockedClass<typeof Parser>


test('handler', async () => {
    await expect(handler()).resolves
    expect(ParserMock.prototype.parseURL).toHaveBeenCalledWith('https://newcubator.com/devsquad/rss.xml')
    expect(TwitterMock.prototype.v2.userByUsername).toHaveBeenCalledWith('newcubator')
});

