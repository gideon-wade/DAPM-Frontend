import {FormEvent, useState} from "react";
import Card from "@mui/material/Card";
import {Box, Button, FormControl, TextField, Typography} from "@mui/material";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [pwd, setPwd] = useState('');
    const [loading, setLoading] = useState(false); // TODO: knap spinner, og disable
    const [loginError, setLoginError] = useState('');

    const handleLogin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (loading || !username || !pwd) return

        setLoading(true);

        try {
            console.log(`Logging in with username: ${username} and password: ${pwd}`);

            if (username === "admin" && pwd === "admin123") {
                console.log("Login successful, redirect to /");
                window.location.href = "/";
            } else {
                console.error("Login failed");
                setLoginError("Invalid username or password");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <Card
                sx={{
                    width: "300px",
                    padding: "30px",
                    borderRadius: "25px",
                }}
            >
                <Typography variant="h5">Login to DAPM</Typography>
                {loginError && <Typography variant="body1" color="error">{loginError}</Typography>}
                <form onSubmit={handleLogin}>
                    <FormControl fullWidth>
                        <TextField
                            onChange={(e) => setUsername(e.target.value)}
                            label="Username"
                            variant="outlined"
                            margin="normal"
                            required
                            sx={{
                                marginTop: "40px",
                            }}
                        />
                        <TextField
                            onChange={(e) => setPwd(e.target.value)}
                            label="Password"
                            variant="outlined"
                            margin="normal"
                            required
                            type="password"
                            sx={{
                                marginTop: "20px",
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                marginTop: "25px",
                                color: "black",
                                backgroundColor: "white",
                            }}
                            disabled={loading}
                        >
                            Login
                        </Button>
                    </FormControl>
                </form>
            </Card>
        </Box>
    );
}

export default LoginPage;