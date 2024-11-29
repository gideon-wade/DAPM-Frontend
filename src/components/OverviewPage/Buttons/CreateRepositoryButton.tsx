import { FormEvent, useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Modal, TextField, Typography, CircularProgress, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { putRepository } from "../../../services/backendAPI";

export interface CreateRepositoryButtonProps {
  orgId: string,
}

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

const CreateRepositoryButton = ({ orgId }: CreateRepositoryButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeout, setTimeout] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [repositoryName, setRepositoryName] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setLoading(false);
    setTimeout(0);
    setRepositoryName('');
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!repositoryName) return;

    setLoading(true);
    setTimeout(0);

    try {
      const result = await putRepository(orgId, repositoryName);
      console.log('repository successfully created:', result);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error creating repository:', error);
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
      <Button onClick={handleOpen}>Add Repository</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-create-repository"
        aria-describedby="modal-create-repository"
      >
        <Box sx={style}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: 'white' }}>
              Create repository
            </Typography>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Repository name</FormLabel>
                <TextField 
                  name="Name" 
                  value={repositoryName}
                  onChange={(e) => setRepositoryName(e.target.value)}
                  disabled={loading}
                />
              </FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Button 
                  type="submit" 
                  sx={{ backgroundColor: "gray", padding: "1px", color: "black" }}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Submit'}
                </Button>
                {loading && <CircularProgress size={24} />}
                {timeout >= 5 && timeout < 10 && (
                  <Typography variant="body2" color="text.secondary">
                    Awaiting backend confirmation
                  </Typography>
                )}
              </Box>
            </form>
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
            Repository Created!
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
};

export default CreateRepositoryButton;