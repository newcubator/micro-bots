import { AxiosResponse } from 'axios';

export const autoPage = async <T>(pageableRequestFactory: (page: number) => Promise<AxiosResponse<T>>): Promise<T[]> => {
    const data: T[] = [];
    let page = 1;
    let pagedResponse;

    do {
        pagedResponse = await pageableRequestFactory(page++);
        data.push(...pagedResponse.data);
    } while (pagedResponse.headers.link?.includes('rel="next"'));

    return data;
}
