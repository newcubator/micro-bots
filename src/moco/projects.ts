import axios from 'axios';
import { autoPage } from './auto-page';
import { MOCO_TOKEN } from './token';
import { MocoProject } from './types/moco-types';

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/projects.md
 */

export async function getProjects() {
    return autoPage<MocoProject>((page: number) => getProjectsPaged(page));
}

const getProjectsPaged = (page) => axios.get<MocoProject>('https://newcubator.mocoapp.com/api/v1/projects', {
    headers: {
        'Authorization': 'Token token=' + MOCO_TOKEN
    },
    params: { include_archived: true, page },
});

