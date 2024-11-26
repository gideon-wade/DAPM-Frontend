import {FormEvent, useState} from "react";
import {Box, Button, FormControl, FormLabel, MenuItem, Modal, Select, TextField, Typography} from '@mui/material';
import {putResource} from '../../../services/backendAPI';
import {Organization, Repository} from "../../../redux/states/apiState";
import {SelectChangeEvent} from '@mui/material/Select';

export interface UploadButtonProps {
  orgs: Organization[],
  reps: Repository[],
  open: boolean,
  onClose: () => void,
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ResourceUpload = ({orgs, reps, open, onClose}: UploadButtonProps) => {
  const dataTypes = ["eventLog", "bpmnModel", "petriNet"]

  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);

  const handleOrgChange = (event: SelectChangeEvent<string>) => {
    const orgId = event.target.value as string;
    setSelectedOrg(orgId);
    setFilteredRepos(reps.filter(repo => repo.organizationId === orgId));
    setSelectedRepo(''); // Reset selected repo when org changes
  };

  const handleClose = () => {
    onClose();
  };

  const handleRepoChange = (event: SelectChangeEvent<string>) => {
    setSelectedRepo(event.target.value as string);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formEntries = Object.fromEntries(formData.entries());

    console.log('Form Data:', formEntries);

    if (formData.get('ResourceFile')) {
      try {
        const result = await putResource(selectedOrg, selectedRepo, formData);
        console.log('Resource successfully uploaded:', result);
      } catch (error) {
        console.error('Error uploading resource:', error);
      }
    } else {
      console.error('No file selected.');
    }

    alert("Form Submitted");
    onClose(); // Close the form on submit
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-create-repository"
      aria-describedby="modal-create-repository"
    >
      <Box sx={style}>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{color: 'white'}}>
            Upload Resource
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal" sx={{mb: 2}}>
              <FormLabel>Organization</FormLabel>
              <Select
                name="Organization"
                value={selectedOrg}
                onChange={handleOrgChange}
                sx={{width: '100%'}}
                defaultValue={orgs[0]?.id || ""}
              >
                {orgs.map((org) => <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" sx={{mb: 2}}>
              <FormLabel>Repository</FormLabel>
              <Select
                name="Repository"
                value={selectedRepo}
                onChange={handleRepoChange}
                sx={{width: '100%'}}
                disabled={!selectedOrg}
                variant={"standard"}>
                {filteredRepos.map((repo) => <MenuItem key={repo.id} value={repo.id}>{repo.name}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" sx={{mb: 2}}>
              <FormLabel>Resource name</FormLabel>
              <TextField name="Name"/>
            </FormControl>

            <FormControl fullWidth margin="normal" sx={{mb: 2}}>
              <FormLabel>Resource type</FormLabel>
              <Select
                name="ResourceType"
                labelId="resourceType-select-lable"
                id="resourceType-select"
                sx={{width: '100%'}}
                variant={"standard"}>
                {dataTypes.map((resource) => <MenuItem key={resource} value={resource}>{resource}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" sx={{mb: 2}}>
              <FormLabel>Upload File</FormLabel>
              <input type="file" name="ResourceFile" style={{color: "gray"}}/>
            </FormControl>

            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2}}>
              <Button onClick={handleClose}
                      sx={{backgroundColor: "gray", padding: "1px", color: "black"}}>Cancel</Button>
              <Button type="submit" sx={{backgroundColor: "white", padding: "1px", color: "black"}}>Submit</Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Modal>
  );
}

export default ResourceUpload;