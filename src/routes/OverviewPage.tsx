import { Box } from "@mui/material";
import { withAuthenticationRequired } from '@auth0/auth0-react';
import OrganizationSidebar from "../components/OverviewPage/OrganizationSidebar";
import PipelineGrid from "../components/OverviewPage/PipelineGrid";

const UserPage = () => {
    return (
        <div>
            <Box sx={{display: 'flex'}}>
                <OrganizationSidebar />
                <PipelineGrid />
            </Box>
        </div>
    )
}

export default withAuthenticationRequired(UserPage, {
    onRedirecting: () => (<div>Redirecting you to the login page...</div>)
});