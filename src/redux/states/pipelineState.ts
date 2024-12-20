import {Edge, Node} from 'reactflow';
import {Organization, Repository, Resource} from './apiState';

/**
 * All new changes are made by:
 * @Author: s183812
 */

export interface PipelineState {
  pipelines: PipelineData[]
  activePipelineId: string
}

export interface HistoryData {
  past: HistoryItem[];
  future: HistoryItem[];
}

export interface HistoryItem {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
}

export interface PipelineData {
    id: string;
    name: string;
    pipeline: NodeState;
    imgData: string;
    history: HistoryData;
    isFolder: boolean;
    folderID: string;
}

export interface NodeState {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  state: number;
  timestamp?: number;
}

export interface EdgeData {
  filename?: string;
}

export interface NodeData {
  label: string;  
  width: number;
  height: number;
  templateData: BaseTemplateData;
  instantiationData: BaseInstantiationData;
  errorMsg: string;
}
export interface DataSourceNodeData extends NodeData {
  templateData: DataSourceTemplateData;
  instantiationData: DataSourceInstantiationData;
}

export interface DataSinkNodeData extends NodeData {
  instantiationData: DataSinkInstantiationData;
}

export interface OperatorNodeData extends NodeData {
  templateData: OperatorTemplateData;
  instantiationData: OperatorInstantiationData;
}

export interface OrganizationNodeData extends NodeData {
  templateData: OrganizationTemplateData;
  instantiationData: OrganizationInstantiationData;
}


export interface BaseTemplateData {
  sourceHandles: HandleData[];
  targetHandles: HandleData[];
}

export interface DataSourceTemplateData extends BaseTemplateData {
  resourceType: string;
}

export interface DataSinkTemplateData extends BaseTemplateData {}

export interface OrganizationTemplateData extends BaseTemplateData {}

export interface OperatorTemplateData extends BaseTemplateData {
  hint: string;
  inputResourceType?: string;
  outputResourceType?: string;
}

export interface BaseInstantiationData {}

export interface DataSourceInstantiationData extends BaseInstantiationData {
  resource?: Resource;
}

export interface DataSinkInstantiationData extends BaseInstantiationData {
  repository?: Repository;
  name?: string;
}

export interface OperatorInstantiationData extends BaseInstantiationData {
  algorithm?: Algorithm;
}

export interface OrganizationInstantiationData extends BaseInstantiationData {
  organization?: Organization;
  id?: string;
  name?: string;
  domain?: string;
}

export interface Algorithm {
  organizationId?: string;
  repositoryId?: string;
  id?: string;
  name: string;
}

export interface HandleData {
  type?: string,
  id: string,
}

export interface FlowData {
  nodes: Array<Node<DataSourceNodeData | DataSinkNodeData | OperatorNodeData | OrganizationNodeData>>;
  edges: Array<Edge>;
}
