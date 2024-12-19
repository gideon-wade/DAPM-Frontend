import { Edge, Node } from "reactflow";
import { DataSinkNodeData, DataSourceNodeData, FlowData, OperatorNodeData, OrganizationNodeData } from "../../../redux/states/pipelineState";
/**
 * All new changes are made by:
 * @Author: s204166
 */

export const validate = (flowdata: FlowData) :  [string,string][] => {
  const errors: [string, string][] = [];

  // all miners must have an operator
  flowdata.nodes.forEach((node: Node) => {
    if (node.type === "operator") {
      const data = node.data as OperatorNodeData;
      if (!(data.instantiationData.algorithm?.organizationId && data.instantiationData.algorithm?.repositoryId)) {
        errors.push(["A miner does not have a valid operator", node.id]);
      }
    }
  });

  // all data sources must contain a file
  flowdata.nodes.forEach((node: Node) => {
    if (node.type === "dataSource") {
      const data = node.data as DataSourceNodeData;
      if (!(data.instantiationData.resource?.organizationId && data.instantiationData.resource?.repositoryId)) {
        errors.push(["A data source does not contain a file", node.id]);
      }
    }
  });

  // all edges must have at least one connection
  const edgeSourceHandlesIds = flowdata.edges.map((edge: Edge) => edge.sourceHandle);
  flowdata.nodes.forEach((node: Node<any>) => {
    if (node.data.templateData.sourceHandles.some((handle: any) => !edgeSourceHandlesIds.includes(handle.id))) {
      errors.push(["A node is not connected", node.id]);
    }
  });

  // mining output edge must have a file name
  flowdata.nodes.forEach((node: Node) => {
    if (node.type === "dataSink") {
      const data = node.data as DataSinkNodeData;
      if (!data.instantiationData.repository) {
        errors.push(["There needs to be at least one valid datasink", node.id]);
      }
    }
  });

  // all organization nodes must have an organization selected
  flowdata.nodes.forEach((node: Node) => {
    if (node.type === "organization") {
      const data = node.data as OrganizationNodeData;
      if (!(data.instantiationData.organization?.id && data.instantiationData.organization?.name && data.instantiationData.organization?.domain)) {
        errors.push(["Organization node does not have a valid organization selected", node.id]);
      }
    }
  });

  // datasink must have an output repository
  flowdata.nodes.forEach((node: Node) => {
    if (node.type === "dataSink") {
      const data = node.data as DataSinkNodeData;
      if (!(data.instantiationData.repository?.id && data.instantiationData.repository?.name && data.instantiationData.repository?.organizationId)) {
        errors.push(["Datasink does not have a valid repository selected", node.id]);
      }
    }
  });

  return errors;
};
