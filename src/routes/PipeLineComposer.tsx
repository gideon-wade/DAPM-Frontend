import {Box} from "@mui/material";
import {Controls, ReactFlowProvider} from "reactflow";
import {withAuthenticationRequired} from "@auth0/auth0-react";

import Flow from "../components/PipeLineComposer/Flow";
import Sidebar from "../components/PipeLineComposer/NodesSidebar";
import PipelineAppBar from "../components/PipeLineComposer/PipelineAppBar";
import LoadingSpinner from "../components/LoadingSpinner";

/**
 * All new changes are made by:
 * @Author: s204423, s204452, and s205339
 */

export default function PipelineComposer() {
    return (
        <ReactFlowProvider>
            <Flow />
            <Box sx={{ display: 'flex' }}>
            <PipelineAppBar />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Sidebar />
                <Controls style={{ position: 'fixed', bottom: '0px', left: '240px' }} />
            </Box>
            </Box>
        </ReactFlowProvider>
    )
}

/*
export default withAuthenticationRequired(PipelineComposer, {
    onRedirecting: () => (<LoadingSpinner />)
});
*/