import {Box, CircularProgress} from "@mui/material";

/**
 * All new changes are made by:
 * @Author: s204423, s204452, and s205339
 */

const LoadingSpinner = () => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <CircularProgress />
        </Box>
    );
}

export default LoadingSpinner;