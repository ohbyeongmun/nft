import { createContext, useReducer } from "react";
import {
    SET_COUNT
} from "./actionTypes";

//initial state
const initialState = {
    info: {
        count: '',
    },
};

// create context
const Context = createContext({});

// create reducer
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_COUNT:
            return {
                ...state,
                info: {
                    ...state.info,
                    count: action.payload
                }
            }

        default:
            return state;
    }
};


// create Provider component (High order component)
const Provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const value = { state, dispatch };
    return <Context.Provider value={value}>{children}</Context.Provider>;
};

export { Context, Provider };