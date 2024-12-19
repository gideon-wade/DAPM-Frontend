import { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {Node } from "reactflow";
import { AppBar, Box, Button, TextField, Toolbar, Typography, Modal, FormControl, FormLabel, Select, MenuItem } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EditIcon from '@mui/icons-material/Edit';

import { getActiveFlowData, getActivePipeline, getPipelines } from "../../redux/selectors";
import { updatePipelineName, updatePipelineId, setFlowdata , updatePipelineState} from "../../redux/slices/pipelineSlice";
import { DataSinkNodeData, DataSourceNodeData, FlowData, OperatorNodeData, OrganizationNodeData } from "../../redux/states/pipelineState";
import { getOrganizations, getRepositories } from "../../redux/selectors/apiSelector";
import { getHandleId, getNodeId } from "./Flow";
import { validate } from "./validation/validation";
import { deletePipeline, putCommandStart, putExecution, putPipeline, executionStatus } from "../../services/backendAPI";
import { toast } from 'react-toastify';

/**
 * All new changes are made by:
 * @Author: s216160, s204166, s204178, s204197, s204423, s204452, and s205339
 */
import { pipeline } from "stream";

export default function PipelineAppBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const startPipeline = async () => {
    const loadingToast = toast.loading("Deploying pipeline: " + pipelineName);
    setShowErrorPopup(false);
    // Continue with the pipeline execution
    const selectedOrg = organizations[0];
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0];
    let pipelineId;
    try {
      pipelineId = await putPipeline(selectedOrg.id, selectedRepo.id, requestDataScope);
    } catch (e) {
      toast.update(loadingToast, {
        render: "There was an error deploying the pipeline",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return;
    }

    const executionId = await putExecution(selectedOrg.id, selectedRepo.id, pipelineId);
    await putCommandStart(selectedOrg.id, selectedRepo.id, pipelineId, executionId);
    toast.update(loadingToast, {
      render: "Running pipeline: " + pipelineName,
      isLoading: true
    });
    try {
      await executionStatus(selectedOrg.id, selectedRepo.id, pipelineId, executionId);
      toast.update(loadingToast, {
        render: "Pipeline finished: " + pipelineName,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (e) {
      toast.update(loadingToast, {
        render: "Failed to run pipeline: " + pipelineName,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  const organizations = useSelector(getOrganizations)
  const repositories = useSelector(getRepositories)
  let requestDataScope = {}
  const pipelineName = useSelector(getActivePipeline)?.name
  const pipelineId = useSelector(getActivePipeline)?.id

  const setPipelineName = (name: string) => {
    if (name.includes('/')) { 
      alert("The name cannot contain '/'");
      return;
    }

    dispatch(updatePipelineName(name))
  }

  const updateFlowState = (state: number) => {
    if (typeof state !== "number") {
        alert("Type must be an integer value");
        return;
    }
    dispatch(updatePipelineState(state)); // Ensure dispatch is accessible
  };

  const flowData = useSelector(getActiveFlowData)
  console.log("FlowData: ", flowData);
  
  const generateJson = async () => {
    //MA
    updateFlowState(1);
    //
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
    requestDataScope = requestData
    const errors = validate(flowData as FlowData).map(error => error[0]);
    console.log("Errors: ", errors);
    if (errors.length > 0) {
      setErrors(errors);
      setShowErrorPopup(true);
      return
    }
    startPipeline()
  }


  const savePipeline = async () => {
    const loadingToast = toast.loading("Saving pipeline: " + pipelineName);
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
    if (pipelineId != undefined && pipelineId.split("-")[0] != "pipelineNew") {
      try {
        const deleted = await deletePipeline(selectedOrg.id, selectedRepo.id, pipelineId.split("-").slice(1).join("-"))
      } catch {

      }
    }
    const pipeline = await putPipeline(selectedOrg.id, selectedRepo.id, requestData)
    dispatch(updatePipelineId("pipeline-"+pipeline.id));
    toast.update(loadingToast, {
      render: "Saved pipeline: " + pipelineName,
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
  }

  const uploadPipeline = async () => {
    let selectedPipeline: HTMLInputElement = document.getElementById("pipelineSelectInput") as HTMLInputElement
    const loadingToast = toast.loading("Uploading pipeline: " + pipelineName);
    if (selectedPipeline!.files!.length > 0) {
      let file = selectedPipeline!.files![0];
      let text = await file.text();
      //console.log(text);
      dispatch(setFlowdata(JSON.parse(text)));
    }
    toast.update(loadingToast, {
      render: "Uploaded pipeline: " + pipelineName,
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
  }

  const downloadPipeline = async () => {
    const selectedOrg = organizations[0]
    const selectedRepo = repositories.filter(repo => repo.organizationId === selectedOrg.id)[0]

    let flowClone = structuredClone(flowData);

    flowClone?.nodes?.forEach((node: Node) => {
      node.selected = false;
      node.dragging = false;
    });
    
    let tmp = document.createElement("a");
    tmp.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURI(JSON.stringify(flowClone)));
    tmp.setAttribute('download', pipelineId+".json");
    tmp.click();
    toast.success("Downloaded pipeline: " + pipelineName);
  }

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
  };
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
  const dataTypes = ["Type1", "Type2", "Type3"];

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
      <Button>
        <label htmlFor="pipelineSelectInput">
        <Typography variant="body1" sx={{ color: "white" }}>Upload pipeline</Typography>
        <input id="pipelineSelectInput" type="file" style={{ display: 'none' }} onChange={() => uploadPipeline()}/>
        </label>
      </Button>
      <Button onClick={() => downloadPipeline()}>
        <Typography variant="body1" sx={{ color: "white" }}>Download pipeline</Typography>
      </Button>
      <Button onClick={() => savePipeline()}>
        <Typography variant="body1" sx={{ color: "white" }}>Save pipeline</Typography>
      </Button>
      
      <Button onClick={() => generateJson()}>
        <Typography variant="body1" sx={{ color: "white" }}>Deploy pipeline</Typography>
      </Button>
      {showErrorPopup && (
      <Modal
        open={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        aria-labelledby="modal-create-repository"
        aria-describedby="modal-create-repository"
      >
        <Box sx={style}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: "white" }}>
              Errors
            </Typography>
            <ul>
              {errors.map((error, index) => (
                <li key={index} style={{ color: "white" }}>{error}</li>
              ))}
            </ul>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <Button onClick={() => setShowErrorPopup(false)} sx={{ backgroundColor: "gray", padding: "6px 12px", color: "white" }}>
                Close
              </Button>
              <Button onClick={startPipeline} sx={{ backgroundColor: "gray", padding: "6px 12px", color: "white" }}>
                Continue Anyway
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    )}
      </Toolbar>
    </AppBar>
        )
      }
       
        
        


