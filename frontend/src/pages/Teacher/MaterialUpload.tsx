import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Progress,
  List,
  Tag,
  Space,
  Modal,
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  InboxOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Dragger } = Upload;

const MaterialUpload = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);

  const handleUpload = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', form.getFieldValue('title') || file.name);

    setUploading(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/materials/?course_id=${courseId}&title=${form.getFieldValue('title') || file.name}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      message.success('课件上传成功！');
      setUploadedFiles([...uploadedFiles, response.data]);
      setUploadProgress(0);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.detail || '上传失败');
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleDelete = async (materialId: string) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/materials/${materialId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      message.success('课件删除成功！');
      setUploadedFiles(uploadedFiles.filter((f) => f.id !== materialId));
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const handlePreview = (file: any) => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          上传课件
        </h1>
        <p style={{ color: '#8c8c8c' }}>
          支持上传 PDF、PPT、Word、视频等格式的课件文件
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Upload Area */}
        <Col xs={24} lg={14}>
          <Card title="上传新课件" style={{ borderRadius: 12 }}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="title"
                label="课件标题"
                rules={[{ required: true, message: '请输入课件标题' }]}
              >
                <Input
                  placeholder="例如：第一章 新能源汽车概述"
                  size="large"
                />
              </Form.Item>

              <Form.Item label="课件文件">
                <Dragger
                  name="file"
                  multiple={false}
                  beforeUpload={handleUpload}
                  disabled={uploading}
                  style={{
                    padding: '40px 20px',
                    background: '#fafafa',
                    borderRadius: 12,
                    border: '2px dashed #d9d9d9',
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ fontSize: 48, color: '#667eea' }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
                    点击或拖拽文件到此区域上传
                  </p>
                  <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                    支持 PDF、PPT、PPTX、DOC、DOCX、MP4 等格式
                  </p>
                </Dragger>
              </Form.Item>

              {uploading && (
                <div style={{ marginTop: 16 }}>
                  <Progress percent={uploadProgress} status="active" />
                  <p style={{ textAlign: 'center', color: '#8c8c8c', marginTop: 8 }}>
                    上传中... {uploadProgress}%
                  </p>
                </div>
              )}
            </Form>
          </Card>
        </Col>

        {/* Uploaded Files */}
        <Col xs={24} lg={10}>
          <Card title="已上传课件" style={{ borderRadius: 12 }}>
            {uploadedFiles.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: '#8c8c8c',
                }}
              >
                <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>暂无已上传的课件</p>
              </div>
            ) : (
              <List
                dataSource={uploadedFiles}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(item)}
                      >
                        预览
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item.id)}
                      >
                        删除
                      </Button>,
                    ]}
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            background: '#e6f7ff',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            color: '#1890ff',
                          }}
                        >
                          <FileTextOutlined />
                        </div>
                      }
                      title={item.title}
                      description={
                        <Space size="small">
                          <Tag color="blue">{item.file_type}</Tag>
                          <span style={{ color: '#8c8c8c' }}>
                            {(item.file_size / 1024).toFixed(2)} KB
                          </span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        title={previewFile?.title}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <FileTextOutlined style={{ fontSize: 64, color: '#667eea' }} />
          <p style={{ marginTop: 16, fontSize: 16 }}>
            预览功能将在后续版本中实现
          </p>
          <p style={{ color: '#8c8c8c' }}>
            文件类型：{previewFile?.file_type}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default MaterialUpload;
