import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Node } from "reactflow";
import { AppBar, Box, Button, TextField, Toolbar, Typography } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EditIcon from '@mui/icons-material/Edit';

import { getActiveFlowData, getActivePipeline, getPipelines } from "../../redux/selectors";
import { updatePipelineName } from "../../redux/slices/pipelineSlice";
import { DataSinkNodeData, DataSourceNodeData, OperatorNodeData, OrganizationNodeData } from "../../redux/states/pipelineState";
import { putCommandStart, putExecution, putPipeline, executionStatus, fetchRepositoryPipelines, fetchPipeline } from "../../services/backendAPI";
import { getOrganizations, getRepositories } from "../../redux/selectors/apiSelector";
import { getHandleId, getNodeId } from "./Flow";

export default function PipelineAppBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const STATUS = {
    UNDEPLOYED: "Undeployed",
    DEPLOYED: "Deployed",
    FINISHED: "Finished",
    ERROR: "Error",
  };
  const [status, setStatus] = useState(STATUS.UNDEPLOYED);
  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  const organizations = useSelector(getOrganizations)
  const repositories = useSelector(getRepositories)

  const pipelineName = useSelector(getActivePipeline)?.name

  const setPipelineName = (name: string) => {
    dispatch(updatePipelineName(name))
  }

  const flowData = useSelector(getActiveFlowData)
  console.log("FlowData: ", flowData);
  // TODO: need to be tested
  const generateJson = async () => {

    setStatus(STATUS.DEPLOYED);
    const edges = flowData!.edges.map(edge => {
      return {sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle}
    });

    console.log("copied", edges)
    
    const dataSinks = flowData?.edges.map((edge) => {
      if (edge.data?.filename) {
        const newTarget = getHandleId()
        const egeToModify = edges.find(e => e.sourceHandle == edge.sourceHandle && e.targetHandle == edge.targetHandle)
        egeToModify!.targetHandle = newTarget
        const originalDataSink = flowData!.nodes.find(node => node.id === edge.target) as Node<DataSinkNodeData>
        console.log("O data: ", originalDataSink);
        return {
          type: originalDataSink?.type,
          data: {
            ...originalDataSink?.data,
            templateData: { sourceHandles: [], targetHandles: [{ id: newTarget }] },
            instantiationData: {
              resource: {
                //...originalDataSink?.data?.instantiationData.repository, 
                organizationId: originalDataSink?.data?.instantiationData.repository?.organizationId,
                repositoryId: originalDataSink?.data?.instantiationData.repository?.id,
                name: edge?.data?.filename
              }
            }
          },
          position: originalDataSink?.position,
          id: getNodeId(),
          width: 100,
          height: 100,
        }
      }
    }).filter(node => node !== undefined) as any

    console.log(JSON.stringify(dataSinks))

    const requestData = {
      name: pipelineName,
      pipeline: {
        nodes: flowData?.nodes?.filter(node => node.type === 'dataSource').map(node => node as Node<DataSourceNodeData>).map(node => {
          return {
            type: node.type,
            data: {
              ...node.data,
              instantiationData: {
                resource: {
                  //...node?.data?.instantiationData.resource,
                  organizationId: node?.data?.instantiationData.resource?.organizationId,
                  repositoryId: node?.data?.instantiationData.resource?.repositoryId,
                  resourceId: node?.data?.instantiationData.resource?.id,
                },
              }
            },
            width: 100, height: 100, position: node?.position, id: node.id, label: "",
          } as any
        }).concat(
          flowData?.nodes?.filter(node => node.type === 'organization').map(node => node as Node<OrganizationNodeData>).map(node => {
            return {
              type: node.type, data: {
                ...node.data
              },
              width: node?.width, height: node?.height, position: node?.position, id: node.id, label: "",
            } as any
          })
        ).concat(
          flowData?.nodes?.filter(node => node.type === 'operator').map(node => node as Node<OperatorNodeData>).map(node => {
            return {
              type: node.type, data: {
                ...node.data,
                instantiationData: {
                  resource: {
                    //...node?.data?.instantiationData.algorithm,
                    organizationId: node?.data?.instantiationData.algorithm?.organizationId,
                    repositoryId: node?.data?.instantiationData.algorithm?.repositoryId,
                    resourceId: node?.data?.instantiationData.algorithm?.id,
                  }
                }
              },
              width: 100, height: 100, position: node?.position, id: node.id, label: "",
            } as any
          })
        ).concat(dataSinks),
          edges: edges.map(edge => {
           return { sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle }
        })
      }
    }

    let org = flowData?.nodes?.filter(node => node.type === 'organization').map(node => node as Node<OrganizationNodeData>).map(node => {
            return {
              type: node.type, data: {
                templateData: { targetHandles: [], sourceHandles: [{ id: getHandleId(), type: "petrinet" }] },
                instantiationData: {
                  resource: {
                    //...node?.data?.instantiationData.algorithm,
                    organizationId: node?.data?.instantiationData?.organization?.id,
                    repositoryId: node?.data?.instantiationData?.organization?.domain,
                    name: node?.data?.instantiationData?.organization?.name,
                  }
                }
              },
              width: node?.width, height: node?.height, position: node?.position, id: node.id, label: "",
            } as any
          });

    console.log("Org data:", org);

    console.log("Request data:", requestData)

    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    const pipelineId = await putPipeline(selectedOrg.id, selectedRepo.id, requestData)
    const executionId = await putExecution(selectedOrg.id, selectedRepo.id, pipelineId)

    console.log("selectedOrg", selectedOrg)
    console.log("selectedRepo", selectedRepo)
    console.log("executionId", executionId)
    console.log("pipelineId", pipelineId)

    await putCommandStart(selectedOrg.id, selectedRepo.id, pipelineId, executionId)
    await executionStatus(selectedOrg.id, selectedRepo.id, pipelineId, executionId)
    setStatus(STATUS.FINISHED);
  }

  const getPipelines = async () => {
    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    console.log("selectedOrg", selectedOrg)
    console.log("selectedRepo", selectedRepo)

    const response = await fetchRepositoryPipelines(selectedOrg.id, selectedRepo.id)
    console.log("response", response)
  }
  const getAPipeline = async (pipelineId: string) => {
    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    console.log("selectedOrg", selectedOrg)
    console.log("selectedRepo", selectedRepo)

    const response = await fetchPipeline(selectedOrg.id, selectedRepo.id, pipelineId)
    console.log("response", response)
  }

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ flexGrow: 1 }}>
        <Button onClick={() => navigate('/')}>
          <ArrowBackIosNewIcon sx={{ color: "white" }} />
        </Button>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          {isEditing ? (
            <TextField
              value={pipelineName}
              onChange={(event) => setPipelineName(event?.target.value as string)}
              autoFocus
              onBlur={handleFinishEditing}
              inputProps={{ style: { textAlign: 'center', width: 'auto' } }}
            />
          ) : (
            <Box onClick={handleStartEditing} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
              <Typography>{pipelineName}</Typography>
              <EditIcon sx={{ paddingLeft: '10px' }} />
            </Box>
          )}
        </Box>
        <Typography variant="body1" sx={{ color: "white" }}>
          Status: {status}
        </Typography>
        <Button onClick={() => status != STATUS.DEPLOYED ? generateJson() : alert("Pipeline is already deployed")}>
          <Typography variant="body1" sx={{ color: "white" }}>Deploy pipeline</Typography>
        </Button>
        <Button onClick={() => getPipelines()}>
          <Typography variant="body1" sx={{ color: "white" }}>get pipelines</Typography>
        </Button>
        <TextField
          label="Enter text"
          variant="outlined"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              getAPipeline(inputValue);
            }
          }}
          sx={{ marginLeft: 2, backgroundColor: "black", borderRadius: 1 }}
        />
        
        
      </Toolbar>
    </AppBar>
  )
}