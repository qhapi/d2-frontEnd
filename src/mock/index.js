import { Faults } from './data/service';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mock = {
    init() {
        const mock = new MockAdapter(axios);

        mock.onGet('http://localhost:5000/detect').reply(200, {
            data: Faults
        });
    }
};

export default mock;
