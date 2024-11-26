import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Node } from "reactflow";
import { AppBar, Box, Button, TextField, Toolbar, Typography } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EditIcon from '@mui/icons-material/Edit';

import { getActiveFlowData, getActivePipeline, getPipelines } from "../../redux/selectors";
import { updatePipelineName, updatePipelineId } from "../../redux/slices/pipelineSlice";
import { DataSinkNodeData, DataSourceNodeData, OperatorNodeData, OrganizationNodeData } from "../../redux/states/pipelineState";
import { putCommandStart, putExecution, putPipeline, executionStatus, fetchRepositoryPipelines, fetchPipeline, deletePipeline } from "../../services/backendAPI";
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
  const pipelineId = useSelector(getActivePipeline)?.id

  const setPipelineName = (name: string) => {
    if (name.includes('/')) { 
      alert("The name cannot contain '/'");
      return;
    }

    dispatch(updatePipelineName(name))
  }

  const flowData = useSelector(getActiveFlowData)
  console.log("FlowData: ", flowData);
  
  const generateJson = async () => {
    var edges = flowData!.edges.map(edge => {
      return { sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle }
    })

    const dataSinks = flowData?.edges.map((edge) => {
      if (edge.data?.filename) {
        const newTarget = getHandleId()
        const egeToModify = edges.find(e => e.sourceHandle == edge.sourceHandle && e.targetHandle == edge.targetHandle)
        egeToModify!.targetHandle = newTarget

        const originalDataSink = flowData!.nodes.find(node => node.id === edge.target) as Node<DataSinkNodeData>
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
          position: { x: 100, y: 100 },
          id: getNodeId(),
          width: 100,
          height: 100,
        }
      }
    }).filter(node => node !== undefined) as any

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
            width: 100, height: 100, position: { x: 100, y: 100 }, id: node.id, label: "",
          } as any
        }).concat(
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
              width: 100, height: 100, position: { x: 100, y: 100 }, id: node.id, label: "",
            } as any
          })
        ).concat(dataSinks),
        edges: edges.map(edge => {
          return { sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle }
        })
      },
      
   
    }
    
    console.log("requestdata",JSON.stringify(requestData))

    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    const pipelineId = await putPipeline(selectedOrg.id, selectedRepo.id, requestData)
    const executionId = await putExecution(selectedOrg.id, selectedRepo.id, pipelineId)
    await putCommandStart(selectedOrg.id, selectedRepo.id, pipelineId, executionId)

  }

  const getPipelines = async () => {
    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    const response = await fetchRepositoryPipelines(selectedOrg.id, selectedRepo.id)
  }
  const getAPipeline = async (pipelineId: string) => {
    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    const response = await fetchPipeline(selectedOrg.id, selectedRepo.id, pipelineId)
  }

  const savePipeline = async () => {

    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    let flowClone = structuredClone(flowData);

    flowClone?.nodes?.forEach((node: Node) => {
      delete node.selected;
      delete node.dragging;
    });
    if (flowClone) {
      flowClone.timestamp = Math.floor(Date.now() / 1000);
    }
    const requestData = {
      name: pipelineName,
      pipeline: flowClone,
      timestamp: flowClone?.timestamp
    };
    console.log("SCOOPY DOOOO: " + pipelineId);//The
    if (pipelineId != undefined) {
      try {
        const deleted = await deletePipeline(selectedOrg.id, selectedRepo.id, pipelineId.split("-").slice(1).join("-"))
      } catch {

      }
    }
    const pipeline = await putPipeline(selectedOrg.id, selectedRepo.id, requestData)
    dispatch(updatePipelineId("pipeline-"+pipeline.id));
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
        <Button onClick={() => savePipeline()}>
          <Typography variant="body1" sx={{ color: "white" }}>Save pipeline</Typography>
        </Button>
        
        <Button onClick={() => status != STATUS.DEPLOYED ? generateJson() : generateJson()}>
          <Typography variant="body1" sx={{ color: "white" }}>Deploy pipeline</Typography>
        </Button>
       
       
        
        
      </Toolbar>
    </AppBar>
  )
}