import React, {useState, useEffect} from 'react';
import {styled} from '@mui/material/styles';
import {
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOrganizations, getRepositories, getResources, getPipelines } from '../../redux/selectors/apiSelector';
import { organizationThunk, repositoryThunk, resourceThunk } from '../../redux/slices/apiSlice';
import { Organization, Pipeline, Repository, Resource } from '../../redux/states/apiState';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { v4 as uuidv4 } from 'uuid';
import ResourceUploadButton from './Buttons/ResourceUploadButton';
import {
  downloadResource,
  fetchOrganization,
  fetchOrganizationRepositories,
  fetchOrganizations,
  fetchPipeline,
  fetchRepositoryPipelines,
  fetchRepositoryResources,
  fetchResource,
  putPipeline,
  putRepository,
  deleteRepository
} from '../../services/backendAPI';
import CreateRepositoryButton from './Buttons/CreateRepositoryButton';
import AddOrganizationButton from './Buttons/AddOrganizationButton';
import OperatorUploadButton from './Buttons/OperatorUploadButton';
import { Padding } from '@mui/icons-material';
import { json } from 'stream/consumers';
import DeleteIcon from '@mui/icons-material/Delete';
import ResourceList from './ResourceList';
import { addNewPipeline } from '../../redux/slices/pipelineSlice';
import { getActiveFlowData, getActivePipeline } from "../../redux/selectors";
import { NodeState } from '../../redux/states/pipelineState';



const drawerWidth = 240;

const DrawerHeader = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const PersistentDrawerLeft: React.FC = () => {
  const dispatch = useAppDispatch();
  const organizations: Organization[] = useAppSelector(getOrganizations);
  const repositories: Repository[] = useAppSelector(getRepositories);
  const resources: Resource[] = useSelector(getResources);
  // const pipelines : Pipeline[] = useSelector(getPipelines);

  const [openOrgs, setOpenOrgs] = useState<{ [key: string]: boolean }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');



  useEffect(() => {
    dispatch(organizationThunk());
  }, []);
  useEffect(() => {
    dispatch(repositoryThunk(organizations));
  }, [organizations]);
  useEffect(() => {
    dispatch(resourceThunk({organizations, repositories}));
  }, [repositories]);

  // Load the pipeline
  const  [pipelines, setPipelines] = useState<Pipeline[]>([]);
  useEffect(() => {
    async function loadPipelines(orgid: string, repid: string) {
        const jsonPipelineData = await fetchRepositoryPipelines(orgid, repid);
        // convert to array of pipelines
        // const pipelines = Object.keys(jsonPipelineData).map((key) => jsonPipelineData[key]);
        const pipelines = jsonPipelineData.result.pipelines

        setPipelines(pipelines);
    }
    if (organizations.length > 0 && repositories.length > 0) {
        loadPipelines(organizations[0].id, repositories[0].id);
    }
  }, []);


  const handleDownload = async (resource: Resource) => {
    const response = await downloadResource(resource.organizationId, resource.repositoryId, resource.id);
    await downloadReadableStream(response.url, resource.name);
  };

  const downloadReadableStream = async (url: string, fileName: string) => {
    window.open(url, '_blank');
  };

  const handleToggle = (orgId: string) => {
    setOpenOrgs(prev => ({...prev, [orgId]: !prev[orgId]}));
  };
  const openDeleteDialog = (repository: Repository) => {
    setSelectedRepository(repository);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedRepository(null);
  };

  const handleDeleteRepository = async () => {
    if (!selectedRepository) return;
    setLoading(true);
    try {
      await deleteRepository(selectedRepository.organizationId, selectedRepository.id);
      console.log("Repository deleted successfully");
      dispatch(repositoryThunk(organizations)); // Reload repositories after deletion
      setSuccessMessage(`Repository ${selectedRepository.name} deleted successfully!`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error deleting repository:", error);
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  };
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const handlePipelineClick = async (pipeline: Pipeline) => {
    console.log('Pipeline clicked:', pipeline);
    
    const response = await fetchPipeline(pipeline.organizationId, pipeline.repositoryId, pipeline.id);
    
    dispatch(addNewPipeline({id: "pipeline-"+response.result.pipelines[0].id, name: response.result.pipelines[0].name as string, currentFolderID: "a", flowData: response.result.pipelines[0].pipeline as NodeState}));
    // Add your logic here, e.g., navigate to a pipeline detail page
  };
  return (
    <Drawer
      PaperProps={{
        sx: {
          backgroundColor: '#292929',
        }
      }}
      sx={{
        width: drawerWidth,
        position: 'static',
        flexGrow: 1,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Divider/>
      <DrawerHeader>
        <Typography sx={{width: '100%', textAlign: 'center'}} variant="h6" noWrap component="div">
          Organizations
        </Typography>
        <AddOrganizationButton/>
      </DrawerHeader>
      <List>
        {organizations.map((organization) => (
          <React.Fragment key={organization.id}>
            <ListItem sx={{justifyContent: 'space-between'}} disablePadding>
              <ListItemButton onClick={() => handleToggle(organization.id)}>
                <ListItemText
                  primary={organization.name}
                  primaryTypographyProps={{style: {fontSize: '25px', marginBlock: '0rem'}}}
                />
                <IconButton edge="end">
                  {openOrgs[organization.id] ? <ExpandLess/> : <ExpandMore/>}
                </IconButton>
              </ListItemButton>
            </ListItem>
            <Collapse in={openOrgs[organization.id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {repositories.map((repository) => (
                  repository.organizationId === organization.id && (
                    <React.Fragment key={repository.id}>
                      <ListItem sx={{paddingInline: '5px'}}>
                        <ListItemText
                          primary={repository.name}
                          primaryTypographyProps={{
                            style: {
                              fontSize: '25px',
                              marginBlock: '10px'
                            }
                          }}
                        />
                        <IconButton
                          aria-label="delete"
                          onClick={() => openDeleteDialog(repository)}
                          sx={{
                            color: '#96281b'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>

                      <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                    listName={"Eventlog"} typeName={"eventLog"}></ResourceList>

                      <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                    listName={"BPMN Models"} typeName={"bpmnModel"}></ResourceList>

                      <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                    listName={"Petri Nets"} typeName={"petriNet"}></ResourceList>

                      <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                    listName={"Operators"} typeName={"operator"}></ResourceList>

                      <ListItem>
                        <ListItemText
                          primary="Saved Pipelines"
                          primaryTypographyProps={{ style: { fontSize: '0.9rem' } }}
                        />
                      </ListItem>
                      {Array.isArray(pipelines) && Array.from(
                        pipelines
                          .reduce((map, pipeline) => {

                            if (!pipeline.timestamp || isNaN(pipeline.timestamp)) {
                              return map;
                            }

                            if (!map.has(pipeline.name) || map.get(pipeline.name).timestamp < pipeline.timestamp) {
                              map.set(pipeline.name, pipeline);
                            }
                            return map;

                          }, new Map())
                          .values() // Extract only the values (newest pipelines) from the map
                      )
                        .filter((pipeline) => pipeline.repositoryId === repository.id) // Filter by repository ID
                        .map((pipeline) => (
                          pipeline.repositoryId === repository.id && (
                            <ListItem key={pipeline.id} disablePadding>
                              <ListItemButton sx={{ paddingBlock: 0 }} onClick={() => handlePipelineClick(pipeline)}>
                                <ListItemText
                                  secondary={pipeline.name}
                                  secondaryTypographyProps={{ fontSize: "0.8rem" }}
                                />
                              </ListItemButton>
                            </ListItem>
                          )
                        ))}

                    </React.Fragment>
                  )
                ))}
                <ListItem sx={{justifyContent: 'center'}}>
                  <Box sx={{
                    width: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <CreateRepositoryButton orgId={organization.id}/>
                  </Box>
                </ListItem>
              </List>
              <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
              >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to delete {selectedRepository?.name}?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeDeleteDialog} color="primary">
                    No
                  </Button>
                  <Button onClick={handleDeleteRepository} color="primary" disabled={loading} autoFocus>
                    {loading ? <CircularProgress size={24} /> : "Yes"}
                  </Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={showSuccessDialog}
                onClose={handleCloseSuccessDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Success"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {successMessage}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseSuccessDialog} autoFocus>
                    OK
                  </Button>
                </DialogActions>
              </Dialog>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default PersistentDrawerLeft;