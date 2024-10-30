import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mount } from '@vue/test-utils';
import index from '@/views/system/resultPage/index.vue';

describe('index', () => {
  it('should handle detect function correctly', async () => {
    const mock = new MockAdapter(axios);
    const responseData = `loading model params...
collecting transaction executing data...
The following code snippets are most likely to cause faults, and the ranking is in descending order of faulty suspiciousness:
Top-0: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 1689:185
Top-1: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 3574:738
Top-2: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 4426:2288
Top-3: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 7944:173
Top-4: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 2988:109`;

    mock.onPost('http://localhost:5000/detect').reply(200, responseData);

    const wrapper = mount(index);
    await wrapper.vm.detect();

    expect(wrapper.vm.results).toHaveLength(5);
    mock.restore();
  });
});