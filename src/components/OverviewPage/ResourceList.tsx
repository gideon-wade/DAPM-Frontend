import React from 'react';
import { ListItem, ListItemButton, ListItemText, Box } from '@mui/material';
import ResourceUploadButton from './Buttons/ResourceUploadButton';
import { Resource } from '../../redux/states/apiState';

interface ResourceListProps {
  repository: { organizationId: string, id: string, name: string };
  resources: Resource[];
  handleDownload: (resource: Resource) => void;
  listName: string;
  typeName: string; // Add the typeName prop
}

const ResourceList: React.FC<ResourceListProps> = ({ repository, resources, handleDownload, listName, typeName }) => {
  return (
    <>
      <ListItem>
        <ListItemText
          primary={listName}
          primaryTypographyProps={{ style: { fontSize: '0.9rem' } }}
        />
        <Box sx={{ marginLeft: 'auto' }}>
          <ResourceUploadButton orgId={repository.organizationId} repId={repository.id} />
        </Box>
      </ListItem>
      {resources.map((resource) => (
        resource.repositoryId === repository.id && resource.type === typeName && (
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
    </>
  );
};

export default ResourceList;