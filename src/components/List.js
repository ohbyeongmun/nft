import React, { useEffect, useState } from 'react'
import { nftContract } from '../Contract/contract';
import axios from 'axios';

const List = () => {

    let length = 10;

    const [count, setCount] = useState();
    const [Token, setToken] = useState({
        no: '',
        amount: '',
        time: '',
        add: '',
        uri: '',
    });

    useEffect(() => {
        nftContract.methods.getTotal().call().then(result => {
            setCount(result);
        })
    }, []);

    const searchCount = () => {
        for (let i = 0; i < count; i++) {
            nftContract.methods.getProduct(i).call().then(result => {
                setToken({
                    no: result[0],
                    amount: result[1],
                    time: result[2],
                    add: result[3],
                    uri: result[4],
                })
            })
        }
        hotelDetail();
    }

    useEffect(() => {
        let table = document.getElementById('ListTable');
        axios.get(`${Token.uri}`).then(response => {
            console.log(response.data);
            console.log(Token.uri);
            let img = response.data.image;
            if (Token.add.length > length) {
                Token.add = Token.add.substr(0, length - 2) + '...';
            }
            let row = `
                    <tbody>
                        <td>${Token.no}</td>
                        <td>${Token.amount}</td>
                        <td>${Token.time}</td>
                        <td>${Token.add}</td>
                        <td><img src=${img}/></td>
                        <td>${Token.uri}</td>
                    </tbody>`
            table.innerHTML += row;
        })
    }, [Token]);

    useEffect(() => {
        let table = document.getElementById('detailTable');
        axios.get(`${Token.uri}`).then(response => {
            if (response.data.external_url === '') {
                response.data.external_url = 'null';
            }
            if (typeof response.data.attribute === 'object' && response.data.attribute.length === 0) {
                response.data.attribute = 'null';
            }
            let row = `
                    <tbody>
                        <td>${response.data.description}</td>
                        <td>${response.data.external_url}</td>
                        <td>${response.data.image}</td>
                        <td>${response.data.name}</td>
                        <td>${response.data.attribute}</td>
                    </tbody>`
            table.innerHTML += row;
        });
    }, [Token]);

    const hotelDetail = async () => {
        let table = document.getElementById('hotelTable');
        const { data } = await axios.get("https://blooming-island-08375.herokuapp.com/0000.json");
        let row = `
                    <tbody>
                        <td>${data.name}</td>
                        <td>${data.description}</td>
                        <td>${data.image}</td>
                        <td>${data.properties.registrar}</td>
                        <td>${data.properties.highlight[0]}</td>
                        <td>${data.properties.product.map_link}</td>
                        <td>${data.properties.investement.accept_currency}</td>
                    </tbody>`
        table.innerHTML += row;
    }


    return (
        <div style={{ width: '100%', height: '100%' }}>

            <div style={{ width: '80%', margin: '0 auto', textAlign: 'center' }}>
                <button onClick={searchCount}>생성정보 확인</button>
            </div><br />
            <div style={{ width: '80%', margin: '0 auto' }}>
                <table id="ListTable" style={{ border: '1px solid black', margin: '0 auto', textAlign: 'center' }}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>발행수량</th>
                            <th>생성시간</th>
                            <th>생성자</th>
                            <th>이미지</th>
                            <th>토큰 uri</th>
                        </tr>
                    </thead>
                </table>
            </div><br />

            <div style={{ width: '80%', margin: '0 auto' }}>
                <table id="detailTable" style={{ border: '1px solid black', margin: '0 auto', textAlign: 'center' }}>
                    <thead>
                        <tr>
                            <th>description</th>
                            <th>external_url</th>
                            <th>image url</th>
                            <th>name</th>
                            <th>attribute</th>
                        </tr>
                    </thead>
                </table>
            </div><br />
            <div style={{ width: '80%', margin: '0 auto' }}>
                <table id="hotelTable" style={{ border: '1px solid black', margin: '0 auto', textAlign: 'center' }}>
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>description</th>
                            <th>image</th>
                            <th>registrar</th>
                            <th>highlight</th>
                            <th>product_map_link</th>
                            <th>investement_currency</th>
                        </tr>
                    </thead>
                </table>
            </div><br />

        </div>
    )
}

export default List
