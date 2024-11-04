import { Box } from "@mui/material";
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

import OrganizationSidebar from "../components/OverviewPage/OrganizationSidebar";
import PipelineGrid from "../components/OverviewPage/PipelineGrid";
import LoadingSpinner from "../components/LoadingSpinner";

// TODO: logout button somewhere
const UserPage = () => {
    const { user } = useAuth0();

    return (
        <div>
            <Box sx={{display: 'flex'}}>
                <p>e-mail: {user?.email}</p> <br/>
                {/*<OrganizationSidebar />*/}
                {/*<PipelineGrid />*/}
            </Box>
        </div>
    )
}

export default withAuthenticationRequired(UserPage, {
    onRedirecting: () => (<LoadingSpinner />)
});