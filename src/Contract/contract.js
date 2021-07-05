import Web3 from 'web3';

import nftAbi from './nft.json';

const nftAddr = '0x11D0611eC05d91713c71B8595863498bb1cC4Ac2';

var web3 = new Web3(window.ethereum);

const nftContract = new web3.eth.Contract(nftAbi, nftAddr);

export { nftContract }