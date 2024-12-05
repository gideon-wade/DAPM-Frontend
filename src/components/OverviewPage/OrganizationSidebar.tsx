import React, {useEffect, useState} from 'react';
import {styled} from '@mui/material/styles';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {useSelector} from 'react-redux';
import {getOrganizations, getRepositories, getResources} from '../../redux/selectors/apiSelector';
import {organizationThunk, repositoryThunk, resourceThunk} from '../../redux/slices/apiSlice';
import {Organization, Pipeline, Repository, Resource} from '../../redux/states/apiState';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {
  deletePipeline,
  deleteRepository,
  downloadResource, fetchOrganizationRepositories,
  fetchPipeline,
  fetchRepositoryPipelines
} from '../../services/backendAPI';
import CreateRepositoryButton from './Buttons/CreateRepositoryButton';
import AddOrganizationButton from './Buttons/AddOrganizationButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ResourceList from './Parts/ResourceList';
import {addNewPipeline} from '../../redux/slices/pipelineSlice';
import {NodeState} from '../../redux/states/pipelineState';
import { toast } from 'react-toastify';
import OperatorUploadButton from './Buttons/OperatorUploadButton';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

/**
 * All new changes are made by:
 * @Author: s204423, s204452, s205339 and s204152
 */

const PersistentDrawerLeft: React.FC = () => {
  const dispatch = useAppDispatch();
  const organizations: Organization[] = useAppSelector(getOrganizations);
  const repositories: Repository[] = useAppSelector(getRepositories);
  const resources: Resource[] = useSelector(getResources);

  const [openOrgs, setOpenOrgs] = useState<{ [key: string]: boolean }>(() => {
    const savedState = localStorage.getItem('openOrgs');
    return savedState ? JSON.parse(savedState) : {};
  });
  const [openRepos, setOpenRepos] = useState<{ [key: string]: boolean }>(() => {
    const savedState = localStorage.getItem('openRepos');
    return savedState ? JSON.parse(savedState) : {};
  });
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

  useEffect(() => {
    localStorage.setItem('openOrgs', JSON.stringify(openOrgs));
  }, [openOrgs]);

  useEffect(() => {
    localStorage.setItem('openRepos', JSON.stringify(openRepos));
  }, [openRepos]);

  // Load the pipeline
  async function loadPipelines(orgid: string, repid: string) {
    const jsonPipelineData = await fetchRepositoryPipelines(orgid, repid);
    // convert to array of pipelines
    // const pipelines = Object.keys(jsonPipelineData).map((key) => jsonPipelineData[key]);
    const pipelines = jsonPipelineData.result.pipelines

    setPipelines(pipelines);
  }

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  useEffect(() => {
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

  const handleToggleOrg = (orgId: string) => {
    setOpenOrgs(prev => ({...prev, [orgId]: !prev[orgId]}));
  };

  const handleToggleRepo = (repoId: string) => {
    setOpenRepos(prev => ({...prev, [repoId]: !prev[repoId]}));
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
      dispatch(repositoryThunk(organizations));
      setSuccessMessage(`Repository ${selectedRepository.name} deleted successfully!`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error deleting repository:", error);
      toast.error("Error in deleting repository");
    } finally {
      setLoading(false);
      closeDeleteDialog();
      toast.success("Deleted repository");
    }
  };
  const handleDeletePipeline = async (organizationId: string, repositoryId: string, pipelineId: string) => {
    const loadingToast = toast.loading("Deleting pipeline");
    try {
      const result = await deletePipeline(organizationId, repositoryId, pipelineId);
      dispatch(() => {loadPipelines(organizationId, repositoryId)});  // Reload repositories after deletion
    } catch (error) {
      console.error("Error deleting pipeline:", error);
      toast.update(loadingToast, {
        render: "Error in deleting pipeline",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
    toast.update(loadingToast, {
      render: "Deleted pipeline",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
  }
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const handlePipelineClick = async (pipeline: Pipeline) => {
    const response = await fetchPipeline(pipeline.organizationId, pipeline.repositoryId, pipeline.id);

    dispatch(addNewPipeline({
      id: "pipeline-" + pipeline.id,
      name: response.result.pipelines[0].name as string,
      currentFolderID: "",
      flowData: response.result.pipelines[0].pipeline as NodeState
    }));
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
              <ListItemButton onClick={() => handleToggleOrg(organization.id)}>
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
              <List component="div" sx={{paddingLeft: '16px'}}>
                {repositories.map((repository) => (
                  repository.organizationId === organization.id && (
                    <React.Fragment key={repository.id}>
                      <ListItem sx={{justifyContent: 'space-between'}} disablePadding>
                        <ListItemButton onClick={() => handleToggleRepo(repository.id)}>
                          <ListItemText
                            primary={repository.name}
                            primaryTypographyProps={{
                              style: {
                                fontSize: '25px',
                                marginBlock: '10px'
                              }
                            }}
                          />
                          <IconButton edge="end">
                            {openRepos[repository.id] ? <ExpandLess/> : <ExpandMore/>}
                          </IconButton>
                        </ListItemButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => openDeleteDialog(repository)}
                          sx={{
                            color: '#96281b'
                          }}
                        >
                          <DeleteIcon/>
                        </IconButton>
                      </ListItem>

                      <Collapse in={openRepos[repository.id]} timeout="auto" unmountOnExit>

                        {/*We hide the items if empty to save some space*/}
                        {resources.filter(resource => resource.repositoryId === repository.id && resource.type === 'eventLog').length > 0 && (
                          <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                        listName={"Eventlog"} typeName={"eventLog"}/>
                        )}
                        {resources.filter(resource => resource.repositoryId === repository.id && resource.type === 'bpmnModel').length > 0 && (
                          <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                        listName={"BPMN Models"} typeName={"bpmnModel"}/>
                        )}
                        {resources.filter(resource => resource.repositoryId === repository.id && resource.type === 'petriNet').length > 0 && (
                          <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                        listName={"Petri Nets"} typeName={"petriNet"}/>
                        )}
                        {resources.filter(resource => resource.repositoryId === repository.id && resource.type === 'operator').length > 0 && (
                          <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                        listName={"Operators"} typeName={"operator"}/>
                        )}
                        {resources.filter(resource => resource.repositoryId === repository.id && resource.type === 'pipeline result').length > 0 && (
                          <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                        listName={"Pipeline results"} typeName={"pipeline result"}/>
                        )}

                        {resources.filter(resource => resource.repositoryId === repository.id && (
                          resource.type === 'eventLog' ||
                          resource.type === 'bpmnModel' ||
                          resource.type === 'petriNet' ||
                          resource.type === 'operator' ||
                          resource.type === 'pipeline result'
                        )).length === 0 && (
                          <ListItem>
                            <ListItemText
                              primary="Resources apear here when uploaded"
                              primaryTypographyProps={{style: {fontSize: '0.7rem', color: 'gray'}}}
                            />
                          </ListItem>
                        )}

                        <ListItem>
                          <ListItemText
                            primary="Saved Pipelines"
                            primaryTypographyProps={{style: {fontSize: '0.9rem'}}}
                          />
                        </ListItem>

                        <OperatorUploadButton orgId={organization.id} repId={repository.id} />

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
                            .values()
                        )
                          .filter((pipeline) => pipeline.repositoryId === repository.id)
                          .map((pipeline) => (
                            pipeline.repositoryId === repository.id && (
                              <ListItem key={pipeline.id} disablePadding>
                                <ListItemButton sx={{paddingBlock: 0}} onClick={() => handlePipelineClick(pipeline)}>
                                  <ListItemText
                                    secondary={pipeline.name}
                                    secondaryTypographyProps={{fontSize: "0.8rem"}}
                                  />
                                  <IconButton
                                      aria-label="delete"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeletePipeline(organization.id, repository.id, pipeline.id).then(r => r);
                                      }}
                                      sx={{
                                        color: '#96281b'
                                      }}
                                  >
                                    <DeleteIcon/>
                                  </IconButton>
                                </ListItemButton>
                              </ListItem>
                            )
                          ))}
                      </Collapse>
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
                    <CreateRepositoryButton
                        orgId={organizations[0]?.id}
                    />
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
                    {loading ? <CircularProgress size={24}/> : "Yes"}
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