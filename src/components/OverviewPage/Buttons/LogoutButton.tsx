import {useAuth0} from "@auth0/auth0-react";
import {Button} from '@mui/material';
import React from "react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button variant="contained" style={{float: 'right'}} className="float-right" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </Button>
  );
};

export default LogoutButton;