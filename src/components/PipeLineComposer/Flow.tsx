import React, { useCallback, useEffect, useState, MouseEvent } from "react"
import ReactFlow, {
  Node,
  Background,
  BackgroundVariant,
  useReactFlow,
  useOnSelectionChange,
  Edge,
  Connection
} from "reactflow";

import { onNodesChange, onEdgesChange, onConnect, addNode, removeNode, setNodes, removeEdge, setEdges } from "../../redux/slices/pipelineSlice";

import CustomNode from "./Nodes/CustomNode";

import "reactflow/dist/style.css";
import styled from "styled-components";
import DataSinkNode from "./Nodes/DataSinkNode";
import ConfigurationSidebar from "./ConfigurationSidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/states";
import OrganizationNode from "./Nodes/OrganizationNode";

import 'reactflow/dist/style.css';
import '@reactflow/node-resizer/dist/style.css';

import { getNodePositionInsideParent, sortNodes } from "./utils";
import { BaseInstantiationData, BaseTemplateData, DataSinkInstantiationData, DataSourceInstantiationData, InstantiationData, NodeData, OperatorInstantiationData } from "../../redux/states/pipelineState";
import DataSourceNode from "./Nodes/DataSourceNode";
import { current } from "@reduxjs/toolkit";
import { getEdges, getNode, getNodes } from "../../redux/selectors";
import { useAppSelector } from "../../hooks";

const nodeTypes = {
  operator: CustomNode,
  dataSource: DataSourceNode,
  dataSink: DataSinkNode,
  organization: OrganizationNode
};

const ReactFlowStyled = styled(ReactFlow)`
  background-color: #333;
`;

const getId = () => `node-${crypto.randomUUID()}`;

const getHandleId = () => `handle-${crypto.randomUUID()}`;

const BasicFlow = () => {
  const dispatch = useDispatch()

  const { getIntersectingNodes } = useReactFlow();

  const nodes = useSelector(getNodes);
  const edges = useSelector(getEdges);
  const reactFlow = useReactFlow();

  const [lastSelected, setLastSelected] = useState<Node | Edge | undefined>();
  const [selectedDeletables, setSelectedDeletables] = useState<Array<Node<NodeData> | Edge | undefined>>([]);

  const connectionLineStyle = { stroke: 'white', strokeOpacity: 1, strokeWidth: "1px" }

  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes, edges: selectedEdges }) => {
      const selecteds = [...selectedNodes, ...selectedEdges] as Array<Node<NodeData> | Edge>;
      //console.log("currentlySelected", selecteds, "previouslySelected", selectedDeletables)
      //console.log("lastSelected", lastSelected)

      const set = new Set(selectedDeletables) as Set<Node<NodeData> | Edge | undefined>;
      var foundItem: Node | Edge | undefined = undefined;

      for (const item of selecteds) {
        if (!set.has(item)) {
          foundItem = item; // Return the first item that's not in set2
        }
      }

      setLastSelected(foundItem);
      setSelectedDeletables([...selectedNodes, ...selectedEdges]);

      var newEdges: Edge[] = edges!.map(edge => {
        if (!selectedEdges.find(x => x.id === edge.id)) {
          return { ...edge, style: { ...edge.style, stroke: 'white', strokeOpacity: 1, strokeWidth: "1px" } }
        }
        return { ...edge, style: { ...edge.style, stroke: '#007bff', strokeOpacity: 1, strokeWidth: "2px" } }
      });

      dispatch(setEdges(newEdges));
    },
  });

  useEffect(() => {
    const handleKeyDown = (event: { key: string; }) => {
      if (event.key === 'Delete') {
        selectedDeletables.filter((x): x is Node<NodeData> => true).forEach(node => dispatch(removeNode(node)));
        selectedDeletables.filter((x): x is Edge => true).forEach(edge => dispatch(removeEdge(edge)));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDeletables]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const { type, data, algorithmType } = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const intersections = getIntersectingNodes({
        x: position.x,
        y: position.y,
        width: 40,
        height: 40,
      }).filter((n) => n.type === 'organization');
      const orgNode = intersections[0];

      const handleSetup = new Map<string, BaseTemplateData>();
      handleSetup.set('dataSource', { 
        sourceHandles: [{ id: getHandleId() }], 
        targetHandles: [],
      });
      handleSetup.set('dataSink', { 
        sourceHandles: [], 
        targetHandles: [{ id: getHandleId()}],
      });
      handleSetup.set('conformance', { 
        sourceHandles: [{ id: getHandleId()}], 
        targetHandles: [{ id: getHandleId()}, { id: getHandleId()}],
      });
      handleSetup.set('miner', { 
        sourceHandles: [{ id: getHandleId()}], 
        targetHandles: [{ id: getHandleId()}],
      });
      handleSetup.set('custom', { 
        sourceHandles: [{ id: getHandleId()}], 
        targetHandles: [{ id: getHandleId()}],
      });
      handleSetup.set('organization', { 
        sourceHandles: [], 
        targetHandles: [],
      });

      const nodeStyle = type === 'organization' ? { width: 400, height: 200, zIndex: -1000 } : undefined;

      const newNode: Node<NodeData> = {
        id: getId(),
        type,
        position,
        style: nodeStyle,
        data: {
          label: `${data}`,
          templateData: handleSetup.get(algorithmType)!,
          instantiationData: {},
        },
      };

      if (orgNode) {
        // if we drop a node on a group node, we want to position the node inside the group
        newNode.position = getNodePositionInsideParent(
          {
            position,
            width: 40,
            height: 40,
          },
          orgNode
        ) ?? { x: 0, y: 0 };
        newNode.parentNode = orgNode?.id;
        newNode.extent = "parent";
      }

      dispatch(addNode(newNode));
    },
    [reactFlow],
  );

  const onNodeDragStop = useCallback(
    (_: MouseEvent, node: Node) => {
      if (node.type === 'organization' || node.parentNode) {
        return;
      }


      const intersections = getIntersectingNodes(node).filter(
        (n) => n.type === 'organization'
      );
      const organizationNode = intersections[0];

      // when there is an intersection on drag stop, we want to attach the node to its new parent
      if (intersections.length && node.parentNode !== organizationNode?.id) {

        const nextNodes: Node[] = nodes!.map((n) => {
          if (n.id === organizationNode.id) {
            return {
              ...n,
              className: '',
            };
          } else if (n.id === node.id) {
            const position = getNodePositionInsideParent(n, organizationNode) ?? {
              x: 0,
              y: 0,
            };

            return {
              ...n,
              position,
              parentNode: organizationNode.id,
              extent: 'parent',
            } as Node;
          }

          return n;
        })
          .sort(sortNodes);

        dispatch(setNodes(nextNodes));
      }
    },
    [nodes]
  );

  const onNodeDrag = useCallback(
    (_: MouseEvent, node: Node) => {
      if (!node) {
        return;
      }
      if (node.type !== 'node' && !node.parentNode) {
        return;
      }

      const intersections = getIntersectingNodes(node).filter(
        (n) => n.type === 'group'
      );
      const groupClassName =
        intersections.length && node.parentNode !== intersections[0]?.id
          ? 'active'
          : '';

      const newNodes: Node[] = nodes!.map((n) => {
        if (n.type === 'organization') {
          return {
            ...n,
            className: groupClassName,
          };
        } else if (n.id === node.id) {
          return {
            ...n,
            position: node.position,
          };
        }

        return { ...n };
      });

      dispatch(setNodes(newNodes));
    },
    [nodes]
  );

  // to hide the attribution
  const proOptions = {
    account: 'paid-enterprise',
    hideAttribution: true,
  };

  const isValidConnection = (connection: Connection) => {
    const sourceNode = nodes?.find(node => node.id === connection.source)
    const targetNode = nodes?.find(node => node.id === connection.target)
    const sourceHandle = sourceNode?.data.templateData.sourceHandles.find(handle => handle.id === connection.sourceHandle)
    const targetHandle = targetNode?.data.templateData.targetHandles.find(handle => handle.id === connection.targetHandle)

    console.log(sourceHandle?.type)
    console.log(targetHandle?.type)

    if ( targetNode?.type === "dataSink") {
      return true
    } else {
      if (targetHandle?.type === undefined || sourceHandle?.type  === undefined) {
        return false
      }
      return sourceHandle?.type === targetHandle?.type
    }
  }

  return (
    <ReactFlowStyled
      proOptions={proOptions}
      style={{ flexGrow: 1 }}
      nodes={nodes}
      edges={edges}
      onNodesChange={x => dispatch(onNodesChange(x))}
      onEdgesChange={x => dispatch(onEdgesChange(x))}
      onConnect={x => { dispatch(onConnect(x)) }}
      isValidConnection={isValidConnection}
      nodeTypes={nodeTypes}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onDrop={onDrop}
      onDragOver={onDragOver}
      fitView
      selectNodesOnDrag={false}
      connectionLineStyle={connectionLineStyle}
    >
      <Background variant={BackgroundVariant.Dots} color="#d9d9d9" />
      {lastSelected && <ConfigurationSidebar selectableProp={lastSelected} />}
    </ReactFlowStyled>
  );
};

export default BasicFlow;
