import { ChangeEvent, useState, useEffect } from "react";
import { Box, Button, Modal, TextField, Typography, CircularProgress, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { backendAPIEndpoints } from "../../../services/backendAPI";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function AddOrganizationButton() {
  const { PostNewPeer } = backendAPIEndpoints();
  const [domainName, setDomainName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeout, setTimeout] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setLoading(false);
    setTimeout(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => {
        setTimeout(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (timeout >= 10) {
      setLoading(false);
      setTimeout(0);
      setShowSnackbar(true);
    }
  }, [timeout]);

  const handleUpload = async () => {
    setLoading(true);
    setTimeout(0);
    try {
      await PostNewPeer(domainName);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error posting new peer:", error);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
      setTimeout(0);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    handleClose();
  };

  return (
    <div>
      <Button sx={{ backgroundColor: "gray", padding: "1px", color: "black" }} onClick={handleOpen}>+</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-add-organization"
        aria-describedby="modal-add-organization"
      >
        <Box sx={style}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{color: 'white'}}>
              Connect to Peer
            </Typography>
            <TextField
              id="outlined-controlled"
              label="Domain Name"
              value={domainName}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setDomainName(event.target.value);
              }}
              sx={{marginBlock: '2rem'}}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect'}
              </Button>
              {loading && <CircularProgress size={24} />}
              {timeout >= 5 && timeout < 10 && (
                <Typography variant="body2" color="text.secondary">
                  Awaiting backend confirmation
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message="Connection Timeout"
      />
      <Dialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Success"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Connected to Peer!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessDialogClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}