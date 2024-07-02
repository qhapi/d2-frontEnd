import Mock from 'mockjs'


const Faults = [];
for (let i = 0; i < 5; i++) {
    Faults.push(Mock.mock({
        rank: `Top-${i}`,
        description: "fault function at contracts/SushiMaker.sol",
        address: "0xe11fc0b43ab98eb91e9836129d1ee7c3bc95df50",
        offset: Mock.Random.range(1000, 8000) + ":" + Mock.Random.range(100, 2300)
    }));
}
export { Faults }