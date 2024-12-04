import {combineReducers, Reducer} from "redux"
import pipelineReducer from "./pipelineSlice"
import apiReducer from "./apiSlice"
import {RootState} from "../states"

const rootReducer: Reducer<RootState> = combineReducers({
    apiState: apiReducer,
    pipelineState: pipelineReducer,
})

export default rootReducer
