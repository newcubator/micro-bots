import axios from 'axios';
import { MOCO_TOKEN } from './token';
import { MocoDeal } from './types/moco-types';

/*
 * @See https://github.com/hundertzehn/mocoapp-api-docs/blob/master/sections/deals.md
 */

export async function getDealById(id: string) {
    return axios.get<MocoDeal>(`https://newcubator.mocoapp.com/api/v1/deals/${id}`, {
        headers: {
            'Authorization': 'Token token=' + MOCO_TOKEN
        },
    }).then(response => response.data);
}


