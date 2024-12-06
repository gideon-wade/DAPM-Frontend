import {Box} from "@mui/material";
import {useAuth0, withAuthenticationRequired} from '@auth0/auth0-react';

import OrganizationSidebar from "../components/OverviewPage/OrganizationSidebar";
import PipelineGrid from "../components/OverviewPage/PipelineGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import {useState} from 'react';

/**
 * All new changes are made by:
 * @Author: s204423, s204452, and s205339
 */


export default function UserPage(){
    //const { user } = useAuth0();
    const [currentFolderID, setCurrentFolderID] = useState('');

    function changeFolder(folderID: string) {
        setCurrentFolderID(folderID)
    }

    return (
        <div>
            <Box sx={{display: 'flex'}}>
                {/*<p>e-mail: {user?.email}</p> <br/>*/}
                {<OrganizationSidebar currentFolderID={currentFolderID} setCurrentFolderID={changeFolder}  />}
                {<PipelineGrid currentFolderID={currentFolderID} setCurrentFolderID={changeFolder} />}
            </Box>
        </div>
    )
}
/*
export default withAuthenticationRequired(UserPage, {
    onRedirecting: () => (<LoadingSpinner />)
});
*/