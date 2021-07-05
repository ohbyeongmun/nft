import React, { useState } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import storehash from './storehash';
import web3 from './web3';
import ipfs from './ipfs';
import '../components/custom.css';
const App = () => {

  const [input, setInput] = useState({
    'description': '',
    'external_url': '',
    'image': '',
    'name': '',
    'attribute': [],
  });

  const [info, setInfo] = useState({
    ipfsHash: null,
    buffer: '',
    ethAddress: '',
    blockNumber: '',
    transactionHash: '',
    gasUsed: '',
    txReceipt: ''
  })

  // 파일 업로드 함수
  const captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => convertToBuffer(reader);
  };

  const convertToBuffer = async (reader) => {
    const buffer = await Buffer.from(reader.result);
    setInfo({ buffer });
  };

  const onClick = async () => {
    let table = document.getElementById('TransactionTable');

    try {
      setInfo({ blockNumber: "waiting.." });
      setInfo({ gasUsed: "waiting..." });

      await web3.eth.getTransactionReceipt(info.transactionHash, (err, txReceipt) => {
        console.log(err, txReceipt);
        setInfo({ txReceipt });
        setInfo({ blockNumber: txReceipt.blockNumber });
        setInfo({ gasUsed: txReceipt.gasUsed });
        let row = `            
          <tr>
            <td>Tx Hash</td>
            <td>${txReceipt.transactionHash}</td>
          </tr>

          <tr>
            <td>Block Number</td>
            <td>${txReceipt.blockNumber}</td>
          </tr>

          <tr>
            <td>사용 된 가스</td>
            <td>${txReceipt.gasUsed}</td>
          </tr>`
        table.innerHTML += row;
      });
    }
    catch (error) {
      console.log(error);
    }
  }

  const onSubmit = async (event) => {
    let table = document.getElementById('TransactionTable');
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    console.log('Sending from Metamask account: ' + accounts[0]);
    const ethAddress = await storehash.options.address;

    await ipfs.add(info.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash);
      setInfo({ ipfsHash: ipfsHash[0].hash });

      storehash.methods.sendHash(ipfsHash[0].hash).send({
        from: accounts[0]
      }, (error, transactionHash) => {
        setInfo({ transactionHash: transactionHash });
        let row = `
        <tr>
          <td>Eth 계약에 저장된 IPFS 해시 번호</td>
          <td>${ipfsHash[0].hash}</td>
        </tr>
        <tr>
          <td>Ethereum 계약 주소</td>
          <td>${ethAddress}</td>
        </tr>
        `
        table.innerHTML += row;
      });
    });
  };

  const onChangeValue = async () => {
    let desc = document.getElementById('description').value;
    let img = document.getElementById('image').value;
    let name = document.getElementById('name').value;

    setInput({
      'description': desc,
      'external_url': '',
      'image': `https://ipfs.io/ipfs/${img}`,
      'name': name,
      'attribute': [],
    });

    jsonSubmit();
  }

  const jsonSubmit = async () => {
    await ipfs.files.add(Buffer.from(JSON.stringify(input)))
      .then(res => {
        const hash = res[0].hash
        console.log('added data hash:', hash)
        return ipfs.files.cat(hash)
      })
      .then(output => {
        console.log('retrieved data:', JSON.parse(output))
      })
  }

  return (
    <div className="App">

      <Container >
        <div style={{ borderBottom: '1px solid #BDBDBD' }}>
          <h3> Choose file to send to IPFS </h3>
          <Form onSubmit={onSubmit}>
            <input
              style={{ marginBottom: 5 }}
              type="file"
              onChange={captureFile}
            /><br />
            <button id="btn" type="submit" style={{ marginBottom: 5 }}>
              보내기
            </button>
          </Form>
        </div>

        <div style={{ textAlign: 'center', borderBottom: '1px solid #BDBDBD' }}>
          <table style={{ margin: '0 auto' }}>
            <thead>
              <tr>
                <th>Tx Receipt Category</th>
                <th>Values</th>
              </tr>
            </thead>
            <tbody id="TransactionTable">
            </tbody>
          </table>
          <button onClick={onClick} id="btn" style={{ marginBottom: 15 }}>거래 영수증 받기</button>
        </div>

        <div>
          <p style={{ fontWeight: 'bold', fontSize: 20 }}>NFT 세부정보 담기</p>
          <input className="input" type="text" placeholder="description" id="description" /><br />
          <input className="input" type="text" placeholder="https://ipfs.io/ipfs/여기에 해당하는 Hash만 입력" id="image" /><br />
          <input className="input" type="text" placeholder="name" id="name" style={{ marginBottom: 10 }} /><br />
          <button id="btn" onClick={onChangeValue} style={{ marginBottom: 15 }}>제출하기</button>
        </div>

      </Container >
    </div>
  );
}

export default App;
