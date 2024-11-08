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
} from '@mui/material';
import {ExpandMore, ExpandLess} from '@mui/icons-material';
import {useSelector} from 'react-redux';
import {getOrganizations, getRepositories, getResources} from '../../redux/selectors/apiSelector';
import {organizationThunk, repositoryThunk, resourceThunk} from '../../redux/slices/apiSlice';
import {Organization, Repository, Resource} from '../../redux/states/apiState';
import {useAppDispatch, useAppSelector} from '../../hooks';
import ResourceUploadButton from './Buttons/ResourceUploadButton';
import {
  downloadResource,
  fetchOrganisation,
  fetchOrganisationRepositories,
  fetchOrganisations,
  fetchPipeline,
  fetchRepositoryPipelines,
  fetchRepositoryResources,
  fetchResource,
  putPipeline,
  putRepository
} from '../../services/backendAPI';
import CreateRepositoryButton from './Buttons/CreateRepositoryButton';
import AddOrganizationButton from './Buttons/AddOrganizationButton';
import OperatorUploadButton from './Buttons/OperatorUploadButton';
import ResourceList from './ResourceList';
import {Padding} from '@mui/icons-material';

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

  const [openOrgs, setOpenOrgs] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    dispatch(organizationThunk());
  }, []);
  useEffect(() => {
    dispatch(repositoryThunk(organizations));
  }, [organizations]);
  useEffect(() => {
    dispatch(resourceThunk({organizations, repositories}));
  }, [repositories]);

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
          Organisations
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
                      </ListItem>

                      <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                    listName={"Eventlog"} typeName={"eventLog"}></ResourceList>

                      <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                    listName={"BPMN Models"} typeName={"bpmnModel"}></ResourceList>

                      <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                    listName={"Petri Nets"} typeName={"petriNet"}></ResourceList>

                      <ResourceList repository={repository} resources={resources} handleDownload={handleDownload}
                                    listName={"Operators"} typeName={"operator"}></ResourceList>

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
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default PersistentDrawerLeft;