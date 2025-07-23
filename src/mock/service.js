import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
 
export default {
 
    bootstrap () {
 
        var mock = new MockAdapter(axios)
    
        mock.onGet('/users').reply(200, {
            data: `
              loading model params...
              collecting transaction executing data...
              The following code snippets are most likely to cause faults, and the ranking is in descending order of faulty suspiciousness:
              Top-0: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 1689:185
              Top-1: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 3574:738
              Top-2: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 4426:2288
              Top-3: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 7944:173
              Top-4: fault function at contracts/SushiMaker.sol -> 0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50, offset is 2988:109
            `
        });
    }
 
}