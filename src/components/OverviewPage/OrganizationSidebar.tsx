import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
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
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOrganizations, getRepositories, getResources, getPipelines } from '../../redux/selectors/apiSelector';
import { organizationThunk, repositoryThunk, resourceThunk } from '../../redux/slices/apiSlice';
import { Organization, Pipeline, Repository, Resource } from '../../redux/states/apiState';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { v4 as uuidv4 } from 'uuid';
import ResourceUploadButton from './Buttons/ResourceUploadButton';
import { downloadResource, fetchOrganisation, fetchOrganisationRepositories, fetchOrganisations, fetchPipeline, fetchRepositoryPipelines, fetchRepositoryResources, fetchResource, putPipeline, putRepository } from '../../services/backendAPI';
import CreateRepositoryButton from './Buttons/CreateRepositoryButton';
import AddOrganizationButton from './Buttons/AddOrganizationButton';
import OperatorUploadButton from './Buttons/OperatorUploadButton';
import { Padding } from '@mui/icons-material';
import { json } from 'stream/consumers';
import { addNewPipeline } from '../../redux/slices/pipelineSlice';



const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
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

  useEffect(() => {
    dispatch(organizationThunk());
  }, [dispatch]);

  useEffect(() => {
    if (organizations.length > 0) {
      dispatch(repositoryThunk(organizations));
      if (repositories.length > 0) dispatch(resourceThunk({ organizations, repositories }));
    }
  }, [dispatch, organizations, repositories]);

  // Load the pipeline
  const  [pipelines, setPipelines] = useState<Pipeline[]>([]);
  useEffect(() => {
    async function loadPipelines(orgid: string, repid: string) {
        const jsonPipelineData = await fetchRepositoryPipelines(orgid, repid);
        // convert to array of pipelines
        // const pipelines = Object.keys(jsonPipelineData).map((key) => jsonPipelineData[key]);
        const pipelines = jsonPipelineData.result.pipelines

        // const pipelines = await fetchRepositoryPipelines(orgid, repid);
        setPipelines(pipelines);
        console.log("pipe in that weird function : ", pipelines)
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
    setOpenOrgs(prev => ({ ...prev, [orgId]: !prev[orgId] }));
  };

  const handlePipelineClick = async (pipeline: Pipeline) => {
    console.log('Pipeline clicked:', pipeline);
    
    const response = await fetchPipeline(pipeline.organizationId, pipeline.repositoryId, pipeline.id);
    // addNewPipeline({id: response.result.pipelines[0].id, flowData: {edges : response.result.pipelines[0].pipeline.edges, nodes: response.result.pipelines[0].pipeline.nodes}});

    addNewPipeline({id: response.result.pipelines[0].id, flowData: response.result.pipelines[0].pipeline});
    console.log("Called addd new");
    //addNewPipeline({ id: `pipeline-${uuidv4()}`, flowData: { nodes: [], edges: [] } });
    
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
      <Divider />
      <DrawerHeader>
        <Typography sx={{ width: '100%', textAlign: 'center' }} variant="h6" noWrap component="div">
          Organisations
        </Typography>
        <AddOrganizationButton />
      </DrawerHeader>
      <List>
        {organizations.map((organization) => (
          <React.Fragment key={organization.id}>
            <ListItem sx={{ justifyContent: 'space-between' }} disablePadding>
              <ListItemButton onClick={() => handleToggle(organization.id)}>
                <ListItemText 
                  primary={organization.name} 
                  primaryTypographyProps={{ style: { fontSize: '25px', marginBlock: '0rem' } }} 
                />
                <IconButton edge="end">
                  {openOrgs[organization.id] ? <ExpandLess /> : <ExpandMore />}
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
                          primaryTypographyProps={{ style: { fontSize: '25px', marginBlock: '10px' } }} 
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemText 
                          primary="Resources" 
                          primaryTypographyProps={{ style: { fontSize: '0.9rem' } }} 
                        />
                        <Box sx={{ marginLeft: 'auto' }}>
                          <ResourceUploadButton orgId={repository.organizationId} repId={repository.id} />
                        </Box>
                      </ListItem>
                      {resources.map((resource) => (
                        resource.repositoryId === repository.id && resource.type !== "operator" && (
                          <ListItem key={resource.id} disablePadding>
                            <ListItemButton sx={{ paddingBlock: 0 }} onClick={() => handleDownload(resource)}>
                              <ListItemText 
                                secondary={resource.name} 
                                secondaryTypographyProps={{ fontSize: "0.8rem" }} 
                              />
                            </ListItemButton>
                          </ListItem>
                        )
                      ))}

                      <ListItem>
                        <ListItemText 
                          primary="Operators" 
                          primaryTypographyProps={{ style: { fontSize: '0.9rem' } }} 
                        />
                        <Box sx={{ marginLeft: 'auto' }}>
                          <OperatorUploadButton orgId={repository.organizationId} repId={repository.id} />
                        </Box>
                      </ListItem>
                      {resources.map((resource) => (
                        resource.repositoryId === repository.id && resource.type === "operator" && (
                          <ListItem key={resource.id} disablePadding>
                            <ListItemButton sx={{ paddingBlock: 0 }}>
                              <ListItemText 
                                secondary={resource.name} 
                                secondaryTypographyProps={{ fontSize: "0.8rem" }} 
                              />
                            </ListItemButton>
                          </ListItem>
                        )
                      ))}

                      
<ListItem>
                <ListItemText 
                    primary="Saved Pipelines" 
                    primaryTypographyProps={{ style: { fontSize: '0.9rem' } }} 
                />
            </ListItem>
            {Array.isArray(pipelines) && pipelines.map((pipeline) => (
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
                <ListItem sx={{ justifyContent: 'center' }}>
                  <Box sx={{ width: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <CreateRepositoryButton orgId={organization.id} />
                  </Box>
                </ListItem>
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default PersistentDrawerLeft;