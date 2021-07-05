import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

export default function Test() {

    return (
        <QueryClientProvider client={queryClient}>
            <Example />
        </QueryClientProvider>
    );
}

// axios 대신 useQuery 사용 (데이터 가져오기, 캐싱, 동기화, 업데이트 용이)
function Example() {
    
    const { isLoading, error, data, isFetching } = useQuery("data", () =>
        fetch(
            "https://blooming-island-08375.herokuapp.com/0000.json"
        ).then((res) =>
            res.json())
    );

    if (isLoading) return "Loading...";

    if (error) return "An error has occurred: " + error.message;

    return (
        <div>
            <h1>{data.name}</h1>
            <p>{data.description}</p>
            <strong>👀 {data.properties.highlight[1]}</strong><br />
            <strong>👀 {data.properties.highlight[2]}</strong><br />
            <strong>👀 {data.properties.highlight[3]}</strong><br />
            <strong>👀 {data.properties.highlight[4]}</strong><br />
            <strong>✨ {data.properties.investement.accept_currency}</strong><br />
            <img src={data.image} />
            <div>{isFetching ? "Updating..." : ""}</div>
            {/* <ReactQueryDevtools initialIsOpen /> */}
        </div>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Test />, rootElement);
