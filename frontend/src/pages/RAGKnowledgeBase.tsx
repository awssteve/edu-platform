/**
 * RAG增强检索知识库系统
 * 基于向量搜索的智能文档检索系统
 */

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Input, Button, List, Tag, Space, Divider, Upload, Modal,
  Progress, Rate, Tooltip, Badge, Empty, Spin, Alert, Tabs, Select, message
} from 'antd';
import {
  SearchOutlined, FileTextOutlined, UploadOutlined, DownloadOutlined,
  StarOutlined, EyeOutlined, ThunderboltOutlined, BookOutlined,
  HighlightOutlined, TagOutlined, FilterOutlined, RobotOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Search } = Input;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  relevance: number;
  highlights: string[];
  tags: string[];
  category: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'processed' | 'processing' | 'pending';
  chunks: number;
}

export function RAGKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<SearchResult | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    // 模拟文档列表
    setDocuments([
      {
        id: '1',
        name: 'Python编程基础.pdf',
        type: 'PDF',
        size: '2.5MB',
        uploadDate: '2026-04-01',
        status: 'processed',
        chunks: 156
      },
      {
        id: '2',
        name: '数据结构与算法.docx',
        type: 'Word',
        size: '1.2MB',
        uploadDate: '2026-04-02',
        status: 'processed',
        chunks: 98
      },
      {
        id: '3',
        name: '机器学习导论.pptx',
        type: 'PPT',
        size: '5.8MB',
        uploadDate: '2026-04-02',
        status: 'processing',
        chunks: 0
      }
    ]);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearching(true);
    setSearchQuery(query);

    // 模拟RAG搜索
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Python函数定义与调用',
          content: '在Python中，函数使用def关键字定义。函数可以接受参数并返回值。例如：def my_function(param): return param * 2...',
          source: 'Python编程基础.pdf - 第3章',
          relevance: 0.95,
          highlights: ['def关键字定义函数', '函数参数和返回值', 'Python函数语法'],
          tags: ['Python', '函数', '基础语法'],
          category: '教程'
        },
        {
          id: '2',
          title: '数据结构-树的基本概念',
          content: '树是一种非线性数据结构，由节点和边组成。每个节点有零个或多个子节点...',
          source: '数据结构与算法.docx - 第5章',
          relevance: 0.88,
          highlights: ['树的结构', '节点和边', '层次关系'],
          tags: ['数据结构', '树', '算法'],
          category: '概念'
        },
        {
          id: '3',
          title: '机器学习中的梯度下降',
          content: '梯度下降是一种优化算法，用于最小化损失函数。通过迭代更新参数来找到最优解...',
          source: '机器学习导论.pptx - 第12页',
          relevance: 0.82,
          highlights: ['梯度下降算法', '损失函数优化', '迭代更新'],
          tags: ['机器学习', '优化算法', '梯度'],
          category: '算法'
        }
      ];

      setSearchResults(mockResults);
      setSearching(false);
    }, 1000);
  };

  const handleUpload = () => {
    setUploadModalVisible(true);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/v1/upload',
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        message.error('只能上传PDF文件');
      }
      return isPDF || Upload.LIST_IGNORE;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const showDetail = (result: SearchResult) => {
    setSelectedDoc(result);
    setDetailModalVisible(true);
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: '#333' }}>
          🔍 RAG智能检索知识库
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          基于向量相似度的智能文档检索系统
        </p>
      </div>

      {/* RAG技术说明 */}
      <Alert
        message="🤖 RAG增强检索技术"
        description="使用向量嵌入和语义搜索技术，实现精准的知识检索。系统会将文档转换为向量表示，并根据语义相似度返回最相关的内容。"
        type="info"
        showIcon
        style={{ marginBottom: 24, borderRadius: 12 }}
      />

      {/* 搜索区域 */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: '24px' }}>
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Search
            placeholder="搜索知识库... (例如: Python函数、数据结构、机器学习)"
            size="large"
            enterButton={<Button type="primary" icon={<SearchOutlined />} size="large">搜索</Button>}
            onSearch={handleSearch}
            loading={searching}
          />
        </Space.Compact>

        <Space wrap>
          <span>快速搜索:</span>
          <Button size="small" onClick={() => handleSearch('Python函数')}>
            Python函数
          </Button>
          <Button size="small" onClick={() => handleSearch('数据结构')}>
            数据结构
          </Button>
          <Button size="small" onClick={() => handleSearch('机器学习算法')}>
            机器学习
          </Button>
        </Space>
      </Card>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <Card
          title={
            <Space>
              <SearchOutlined />
              <span>搜索结果</span>
              <Badge count={searchResults.length} showZero />
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <List
            dataSource={searchResults}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  padding: '20px',
                  background: 'white',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  border: '1px solid #f0f0f0',
                  cursor: 'pointer'
                }}
                onClick={() => showDetail(item)}
              >
                <Row gutter={16} style={{ width: '100%' }}>
                  <Col span={16}>
                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{ margin: 0, marginBottom: 8, color: '#333' }}>
                        {item.title}
                      </h3>
                      <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
                        📄 {item.source}
                      </div>
                      <div style={{ fontSize: 14, color: '#666', lineHeight: '1.6' }}>
                        {item.content.substring(0, 150)}...
                      </div>
                    </div>
                    <Space wrap>
                      {item.tags.map(tag => (
                        <Tag key={tag} color="blue" icon={<TagOutlined />}>
                          {tag}
                        </Tag>
                      ))}
                      <Tag icon={<HighlightOutlined />}>{item.category}</Tag>
                    </Space>
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>相关度</div>
                      <Progress
                        type="circle"
                        percent={item.relevance * 100}
                        width={60}
                        strokeColor={item.relevance > 0.9 ? '#52c41a' : '#1890ff'}
                      />
                    </div>
                    <Button type="primary" icon={<EyeOutlined />}>
                      查看详情
                    </Button>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 文档管理 */}
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>知识库文档</span>
            <Badge count={documents.length} showZero />
          </Space>
        }
        extra={
          <Button type="primary" icon={<UploadOutlined />} onClick={handleUpload}>
            上传文档
          </Button>
        }
        style={{ borderRadius: 12 }}
      >
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4 }}
          dataSource={documents}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                style={{ borderRadius: 8 }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>
                  📄
                </div>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                  {item.type} · {item.size}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Tag color={item.status === 'processed' ? 'success' : 'processing'}>
                    {item.status === 'processed' ? '已处理' : '处理中'}
                  </Tag>
                  <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                    {item.chunks} 个片段
                  </span>
                </div>
                <Button size="small" block icon={<SearchOutlined />}>
                  搜索
                </Button>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>{selectedDoc?.title}</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="export" icon={<DownloadOutlined />}>
            导出
          </Button>
        ]}
        width={800}
      >
        {selectedDoc && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="blue">来源: {selectedDoc.source}</Tag>
                <Tag color="green">相关度: {(selectedDoc.relevance * 100).toFixed(0)}%</Tag>
                <Tag>{selectedDoc.category}</Tag>
              </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>内容摘要</h4>
              <p style={{ lineHeight: '1.8', color: '#333' }}>
                {selectedDoc.content}
              </p>
            </div>

            <div>
              <h4 style={{ marginBottom: 8 }}>关键词高亮</h4>
              <Space wrap>
                {selectedDoc.highlights.map((highlight, index) => (
                  <Tag key={index} color="orange" icon={<HighlightOutlined />}>
                    {highlight}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* 上传模态框 */}
      <Modal
        title="上传文档到知识库"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setUploadModalVisible(false)}>
            取消
          </Button>,
          <Button key="upload" type="primary">
            开始上传
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持PDF、Word、PPT等格式的文档
            </p>
          </Upload.Dragger>

          <Alert
            message="文档处理说明"
            description="上传的文档将被自动分块、提取文本内容、生成向量嵌入，并存储到向量数据库中。"
            type="info"
            showIcon
          />
        </Space>
      </Modal>
    </div>
  );
}

export default RAGKnowledgeBase;