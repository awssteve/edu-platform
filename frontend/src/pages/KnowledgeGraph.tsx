/**
 * 知识图谱系统
 * PDF核心功能：知识点实体管理、关系抽取、图谱可视化
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Form, Input, Select, Modal, Tag, Space, List, Tooltip,
  Tree, Drawer, Spin, Empty, message, Tabs, Divider, Progress, Alert, Badge
} from 'antd';
import {
  ApartmentOutlined, NodeIndexOutlined, BranchesOutlined, PlusOutlined,
  LinkOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ThunderboltOutlined, HeatMapOutlined, RadarChartOutlined
} from '@ant-design/icons';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ==================== 类型定义 ====================

interface KnowledgeNode {
  id: string;
  title: string;
  type: 'concept' | 'skill' | 'prerequisite' | 'application';
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  course_id?: string;
  children?: KnowledgeNode[];
}

interface KnowledgeRelation {
  id: string;
  source_id: string;
  target_id: string;
  type: 'prerequisite' | 'related' | 'contains' | 'applies';
  weight: number;
}

interface LearningPath {
  id: string;
  name: string;
  nodes: string[];
  progress: number;
  estimated_hours: number;
}

// ==================== 知识图谱主组件 ====================

export function KnowledgeGraphModule() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [relations, setRelations] = useState<KnowledgeRelation[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [nodeDrawerVisible, setNodeDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('graph');

  useEffect(() => {
    fetchKnowledgeGraph();
  }, []);

  const fetchKnowledgeGraph = async () => {
    setLoading(true);
    try {
      // 这里应该从后端API获取，现在用模拟数据
      const mockNodes: KnowledgeNode[] = [
        {
          id: '1',
          title: 'Python基础',
          type: 'concept',
          difficulty: 2,
          description: 'Python编程语言基础概念和语法',
          children: [
            {
              id: '1-1',
              title: '变量与数据类型',
              type: 'skill',
              difficulty: 1,
              description: 'Python中的变量声明和基本数据类型'
            },
            {
              id: '1-2',
              title: '控制流',
              type: 'skill',
              difficulty: 2,
              description: 'if语句、循环等控制结构'
            }
          ]
        },
        {
          id: '2',
          title: '数据结构',
          type: 'concept',
          difficulty: 3,
          description: '常用数据结构的原理和应用',
          children: [
            {
              id: '2-1',
              title: '列表和元组',
              type: 'skill',
              difficulty: 2,
              description: 'Python列表和元组的操作'
            },
            {
              id: '2-2',
              title: '字典和集合',
              type: 'skill',
              difficulty: 3,
              description: '字典和集合的使用场景'
            }
          ]
        },
        {
          id: '3',
          title: '面向对象编程',
          type: 'concept',
          difficulty: 4,
          description: 'OOP的基本概念和Python实现',
          children: [
            {
              id: '3-1',
              title: '类和对象',
              type: 'skill',
              difficulty: 3,
              description: '类的定义和对象创建'
            }
          ]
        }
      ];

      const mockRelations: KnowledgeRelation[] = [
        { id: 'r1', source_id: '1', target_id: '2', type: 'prerequisite', weight: 0.9 },
        { id: 'r2', source_id: '2', target_id: '3', type: 'prerequisite', weight: 0.8 },
        { id: 'r3', source_id: '1-1', target_id: '1-2', type: 'related', weight: 0.7 }
      ];

      const mockPaths: LearningPath[] = [
        {
          id: 'p1',
          name: 'Python入门路径',
          nodes: ['1', '1-1', '1-2'],
          progress: 60,
          estimated_hours: 20
        },
        {
          id: 'p2',
          name: 'Python进阶路径',
          nodes: ['2', '2-1', '2-2', '3'],
          progress: 30,
          estimated_hours: 40
        }
      ];

      setNodes(mockNodes);
      setRelations(mockRelations);
      setLearningPaths(mockPaths);
    } catch (error) {
      message.error('获取知识图谱失败');
    } finally {
      setLoading(false);
    }
  };

  // 构建树形数据
  const buildTreeData = () => {
    return nodes.map(node => ({
      title: (
        <div>
          <Tag color={getTypeColor(node.type)}>{getTypeText(node.type)}</Tag>
          <span style={{ marginLeft: 8 }}>{node.title}</span>
          <Rate disabled value={node.difficulty} style={{ fontSize: 12, marginLeft: 8 }} />
        </div>
      ),
      key: node.id,
      children: node.children?.map(child => ({
        title: (
          <div>
            <Tag color={getTypeColor(child.type)}>{getTypeText(child.type)}</Tag>
            <span style={{ marginLeft: 8 }}>{child.title}</span>
            <Rate disabled value={child.difficulty} style={{ fontSize: 12, marginLeft: 8 }} />
          </div>
        ),
        key: child.id
      }))
    }));
  };

  const getTypeColor = (type: string) => {
    const colors = {
      concept: 'blue',
      skill: 'green',
      prerequisite: 'orange',
      application: 'purple'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getTypeText = (type: string) => {
    const texts = {
      concept: '概念',
      skill: '技能',
      prerequisite: '前置',
      application: '应用'
    };
    return texts[type as keyof typeof texts] || type;
  };

  const handleNodeClick = (nodeId: string) => {
    const findNode = (nodes: KnowledgeNode[], id: string): KnowledgeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(nodes, nodeId);
    if (node) {
      setSelectedNode(node);
      setNodeDrawerVisible(true);
    }
  };

  return (
    <div>
      <Alert
        message="知识图谱系统"
        description="知识点关联、学习路径规划、个性化推荐 - 核心创新功能"
        type="success"
        showIcon
        icon={<ApartmentOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="知识图谱" key="graph">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <NodeIndexOutlined style={{ fontSize: 32, color: '#1890FF' }} />
                      <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                        {nodes.length + nodes.reduce((sum, n) => sum + (n.children?.length || 0), 0)}
                      </div>
                      <div style={{ color: '#8c8c8c' }}>知识节点</div>
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <BranchesOutlined style={{ fontSize: 32, color: '#52C41A' }} />
                      <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                        {relations.length}
                      </div>
                      <div style={{ color: '#8c8c8c' }}>关系连接</div>
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <ThunderboltOutlined style={{ fontSize: 32, color: '#FAAD14' }} />
                      <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                        {learningPaths.length}
                      </div>
                      <div style={{ color: '#8c8c8c' }}>学习路径</div>
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <RadarChartOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                      <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                        {Math.round(learningPaths.reduce((sum, p) => sum + p.progress, 0) / learningPaths.length)}%
                      </div>
                      <div style={{ color: '#8c8c8c' }}>平均进度</div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Card
                title="知识结构树"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                  >
                    添加知识点
                  </Button>
                }
              >
                <Tree
                  treeData={buildTreeData()}
                  showIcon
                  onSelect={(keys) => handleNodeClick(keys[0] as string)}
                  style={{ background: '#fafafa' }}
                />
              </Card>
            </>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="学习路径" key="paths">
          <Row gutter={[16, 16]}>
            {learningPaths.map(path => (
              <Col xs={24} md={12} key={path.id}>
                <Card
                  title={path.name}
                  extra={<Badge count={`${path.progress}%`} />}
                  hoverable
                >
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <span>学习进度</span>
                      <span>{path.progress}%</span>
                    </div>
                    <Progress percent={path.progress} status="active" />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Space size="large">
                      <div>
                        <div style={{ color: '#8c8c8c', fontSize: 12 }}>预计时长</div>
                        <div style={{ fontSize: 16, fontWeight: 'bold' }}>{path.estimated_hours}小时</div>
                      </div>
                      <div>
                        <div style={{ color: '#8c8c8c', fontSize: 12 }}>知识点数</div>
                        <div style={{ fontSize: 16, fontWeight: 'bold' }}>{path.nodes.length}个</div>
                      </div>
                    </Space>
                  </div>

                  <Button type="primary" block>
                    继续学习
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="知识点管理" key="manage">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Input.Search
              placeholder="搜索知识点..."
              style={{ width: 300 }}
              onSearch={(value) => console.log(value)}
            />
            <Button type="primary" icon={<PlusOutlined />}>
              添加知识点
            </Button>
          </div>

          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={nodes}
            renderItem={(node) => (
              <List.Item>
                <Card
                  size="small"
                  title={
                    <Space>
                      <Tag color={getTypeColor(node.type)}>{getTypeText(node.type)}</Tag>
                      {node.title}
                      <Rate disabled value={node.difficulty} style={{ fontSize: 12 }} />
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button type="link" size="small" icon={<EyeOutlined />}>
                        查看
                      </Button>
                      <Button type="link" size="small" icon={<EditOutlined />}>
                        编辑
                      </Button>
                    </Space>
                  }
                >
                  <p style={{ color: '#8c8c8c', fontSize: 12, margin: 0 }}>
                    {node.description}
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">{node.children?.length || 0} 子节点</Tag>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* 知识点详情抽屉 */}
      <Drawer
        title={selectedNode?.title}
        placement="right"
        width={480}
        onClose={() => setNodeDrawerVisible(false)}
        open={nodeDrawerVisible}
      >
        {selectedNode && (
          <div>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="类型">
                <Tag color={getTypeColor(selectedNode.type)}>
                  {getTypeText(selectedNode.type)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Rate disabled value={selectedNode.difficulty} />
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedNode.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h4>相关知识点</h4>
            <List
              size="small"
              dataSource={relations.filter(r => r.source_id === selectedNode.id)}
              renderItem={(rel) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<LinkOutlined />}
                    title={
                      <Tag color={getTypeColor(rel.type as any)}>
                        {getTypeText(rel.type)}
                      </Tag>
                    }
                    description={`关联强度: ${(rel.weight * 100).toFixed(0)}%`}
                  />
                </List.Item>
              )}
            />

            <Divider />

            <Button type="primary" block>
              开始学习这个知识点
            </Button>
          </div>
        )}
      </Drawer>

      {/* 创建知识点模态框 */}
      <Modal
        title="添加知识点"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="知识点标题" name="title" rules={[{ required: true }]}>
            <Input placeholder="例如：Python变量" />
          </Form.Item>
          <Form.Item label="知识点类型" name="type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="concept">概念</Select.Option>
              <Select.Option value="skill">技能</Select.Option>
              <Select.Option value="prerequisite">前置知识</Select.Option>
              <Select.Option value="application">应用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="难度等级" name="difficulty" initialValue={2}>
            <Rate />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="描述这个知识点..." />
          </Form.Item>
          <Form.Item label="父级知识点" name="parent">
            <Select placeholder="选择父级知识点（可选）">
              {nodes.map(node => (
                <Select.Option key={node.id} value={node.id}>
                  {node.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              添加知识点
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// 需要添加Descriptions导入
import { Descriptions, Rate } from 'antd';

export default KnowledgeGraphModule;
