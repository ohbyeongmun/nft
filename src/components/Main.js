import React, { useState, useEffect, useContext } from 'react'
import { nftContract } from '../Contract/contract'
import axios from 'axios';
import AppLay from '../ipfs/App';
import { Context } from "../context/index";
import { SET_COUNT } from '../context/actionTypes';
import { useHistory } from "react-router-dom";
import './custom.css';
import { ToastContainer, toast } from 'react-toastify';
import { injectStyle } from "react-toastify/dist/inject-style";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { init } from 'emailjs-com';
import emailjs from 'emailjs-com';

if (typeof window !== "undefined") {
    injectStyle();
}

const address = '0x264A0eeD2cA3C607FbaDC093C11906DE356E12C0';

const Main = () => {

    const history = useHistory();

    const {
        state: { info },
        dispatch
    } = useContext(Context);

    const [Token, setToken] = useState([]);
    const [status, setStatus] = useState();
    const [count, setCount] = useState();
    const [balance, setBalance] = useState();

    // 최초 렌더링시 getTotal() 함수에서 현재 발행된 토큰 수량 dispatch
    useEffect(() => {
        nftContract.methods.getTotal().call().then(result => {
            dispatch({ type: SET_COUNT, payload: result });
            setCount(result);
        });
    }, []);

    // Nft 토큰 발행
    const createNftToken = async () => {
        let value = document.getElementById('tokenAmount').value;
        let id = document.getElementById('createId').value;
        let uri = document.getElementById('tokenUri').value;

        await nftContract.methods.balanceOf(address, id).call().then(result => {
            if (result[1] === undefined) {
                nftContract.methods.mintNft(id, value, address, `https://ipfs.io/ipfs/${uri}`).send({ from: address });
                setStatus('success');
            }
            else {
                console.log('이미 사용중인 식별키 입니다.');
                setStatus('fail');
            }
        });
    }

    // Nft Token information 배열 담기
    const nftTokenSearch = async () => {
        for (let i = 0; i < count; i++) {
            await nftContract.methods.getProduct(i).call().then(result => {
                Token.push({ no: result[0], amount: result[1], time: result[2], add: result[3], uri: result[4] });
            });
            console.log(Token);
        }
        setStatus('success');
        DrawTable();
    }

    // 토큰 전송
    const sendToken = async () => {
        let sendAddr = document.getElementById('sendAddr').value;
        let receiveAddr = document.getElementById('receiveAddr').value;
        let tokenId = document.getElementById('tokenId').value;
        let sendAmount = document.getElementById('sendAmount').value;
        try {
            await nftContract.methods.safeTransferFrom(sendAddr, receiveAddr, tokenId, sendAmount, "0x00").send({
                from: sendAddr,
                gasPrice: "1000000000",
                gasLimit: 220000
            });;
            setStatus('success');
        }
        catch (e) {
            console.log(e);
            setStatus('fail');
        }
    }

    // 토큰 수량 확인
    const balanceOf = async () => {
        let add = document.getElementById('searchAddr').value;
        let id = document.getElementById('searchId').value;
        await nftContract.methods.balanceOf(add, id).call().then(result => {
            setBalance(result);
        });
        setStatus('success');
    }

    // nftTokenSearch 함수에서 Token의 상태가 변경될시 호출
    // 앞에서 받아온 정보로 토큰 세부 정보 테이블 그리기
    const DrawTable = () => {
        let table = document.getElementById('table');
        for (let i = 0; i < count; i++) {
            axios.get(`${Token[i].uri}`).then(response => {
                if (count > 0) {
                    console.log(response);
                    let img = response.data.image;
                    let row = `
                    <div>
                    <p id="tableP">Token Number : ${Token[i].no} <br/>발행수량 : ${Token[i].amount} <br/>생성시간 : ${Token[i].time} <br/>생성자 : ${Token[i].add} <br/>Detail_Information : ${Token[i].uri}
                    <br/>Description : ${response.data.description} <br/>name : ${response.data.name}</p>
                    <img src=${img}/>
                    </div>`
                    table.innerHTML += row;
                }
            });
        }
    }

    // Toast 메세지 함수
    useEffect(() => {
        console.log(status);
        switch (status) {
            case 'success':
                toast("Success!!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return setStatus();
            case 'pending':
                toast("Pending!!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return setStatus();
            case 'fail':
                toast("Fail!!", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return setStatus();
        }
    }, [status]);



    const bodyShot = () => {
        html2canvas(document.body)
            .then(
                function (canvas) {
                    saveAs(canvas.toDataURL(), 'file-name.png');
                    setStatus('success');
                }).catch(function (err) {
                    console.log(err);
                    setStatus('fail');
                });
    }

    const saveAs = (uri, filename) => {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            link.href = uri;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            window.open(uri);
        }
    }

    const sendEmail = () => {
        emailjs.init('user_FCN7Gu15TzKBOJxBMf7Ai');
        let info = document.getElementById('info').value;
        let templateParams = {
            info: info,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            TokenUri: Token[info].uri,
            TokenAmount: Token[info].amount,
            TokenAddress: Token[info].add,
        }
        console.log(templateParams);
        emailjs.send('service_bjrh581', 'template_8esyell', templateParams).then(function (response) {
            console.log('Success!', response.status, response.text);
            setStatus('success');
        }, function (error) {
            console.log('Failed...', error);
            setStatus('fail');
        });
    }

    return (
        <div style={{ width: '100%', margin: '0 auto', height: '100%' }}>
            <div style={{ width: '50%', margin: '0 auto', textAlign: 'center', border: '1px solid #BDBDBD', borderRadius: 15, backgroundColor: '#fff' }}>
                <div style={{ borderBottom: '1px solid #BDBDBD' }}>
                    <p style={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: 15, paddingTop: 5 }}>디지털 자산관리 신규 발행</p>
                </div>
                <div style={{ borderBottom: '1px solid #BDBDBD' }}>
                    <p style={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: 15, paddingTop: 5 }}>발행순서</p>
                    <p style={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: 15, paddingTop: 5 }}>IPFS Image 업로드 {'->'} 토큰 세부 정보 담기 {'->'} 토큰 생성</p>
                </div>
                <AppLay />
                <div style={{ borderBottom: '1px solid #BDBDBD' }}>
                    <div style={{ textAlign: 'center', width: '80%', display: 'inline-block' }}>
                        <span style={{ fontWeight: 'bold', fontSize: 20 }}>토큰 생성</span><br />
                        <span>식별 key 입력</span><br />
                        <input className="input" placeholder="0~9999" id="createId" /><br />
                        <span>발행 수량 입력</span><br />
                        <input className="input" placeholder="1~99999" id="tokenAmount" /><br />
                        <span>uri 입력</span><br />
                        <input className="input" placeholder="https://ipfs.io/ipfs/여기에 해당하는 Hash만 입력" id="tokenUri" /><br /><br />
                        <button id="btn" onClick={createNftToken} style={{ marginBottom: 15 }}>토큰 생성</button>
                    </div>
                </div>
                <div style={{ borderBottom: '1px solid #BDBDBD' }}>
                    <p style={{ fontWeight: 'bold', fontSize: 20 }}>토큰조회</p>
                    <p style={{ fontSize: 15, fontWeight: 'bold' }}>현재까지 발행된 토큰 수량 : <span style={{ color: 'red' }}>{count}</span></p>
                    <table id="table" style={{ width: '100%' }}>
                    </table>
                    <button id="btn" onClick={nftTokenSearch} style={{ marginBottom: 15 }}>토큰 조회</button>
                </div>
                <div style={{ borderBottom: '1px solid #BDBDBD' }}>
                    <p style={{ fontWeight: 'bold', fontSize: 20 }}>토큰전송 소유권이전</p>
                    <input className="input" placeholder="보내는 주소" id="sendAddr" /><br />
                    <input className="input" placeholder="받는 주소" id="receiveAddr" /><br />
                    <input className="input" placeholder="식별 key" id="tokenId" /><br />
                    <input className="input" placeholder="보내는 수량" id="sendAmount" style={{ marginBottom: 15 }} /><br />
                    <button id="btn" onClick={sendToken} style={{ marginBottom: 15 }}>전송 및 이전</button>
                </div>
                <div style={{ borderBottom: '1px solid #BDBDBD' }}>
                    <p style={{ fontWeight: 'bold', fontSize: 20 }}>잔액조회</p>
                    <input className="input" placeholder="주소입력" id="searchAddr" /><br />
                    <input className="input" placeholder="id 입력" id="searchId" /><br />
                    <p>{balance}</p>
                    <button id="btn" onClick={balanceOf} style={{ marginBottom: 15 }}>조회</button>
                </div>
                {/* <div>
                    <button id="btn" onClick={() => history.push('/List')}>List 이동</button>
                </div> */}
                <ToastContainer />
                <input type="text" className="input" id="info" placeholder="정보 조회를 받고자 하는 번호를 입력해주세요." /><br />
                <input type="text" className="input" id="email" placeholder="받을 메일 주소를 입력해주세요" /><br />
                <input type="text" className="input" id="phone" placeholder="연락처를 입력해주세요 (생략 가능)" /><br />
                <textarea id="message" className="input" rows="5" placeholder="내용을 입력해주세요 "></textarea><br />
                <input type="button" id="btn" class="btn white" value="메일보내기" onClick={sendEmail} /><br />
                <button id="btn" onClick={bodyShot}>화면 캡쳐</button><br />
            </div>
        </div>
    )
}

export default Main
