import { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Space, Empty, Modal, message } from 'antd';
import {
  CertificateOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BookOutlined,
} from '@ant-design/icons';
import axios from 'axios';

interface Certificate {
  id: string;
  certificate_number: string;
  issue_date: string;
  certificate_url: string;
  course: {
    title: string;
  };
}

const MyCertificates = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockCertificates: Certificate[] = [
        {
          id: '1',
          certificate_number: 'EDU-17728456789-ABC123',
          issue_date: '2026-03-15',
          certificate_url: '/certificates/EDU-17728456789-ABC123.pdf',
          course: {
            title: '软件工程',
          },
        },
        {
          id: '2',
          certificate_number: 'EDU-17728456790-DEF456',
          issue_date: '2026-02-20',
          certificate_url: '/certificates/EDU-17728456790-DEF456.pdf',
          course: {
            title: 'Python 程序设计',
          },
        },
      ];
      setCertificates(mockCertificates);
    } catch (error: any) {
      message.error('获取证书列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      message.success('证书下载中...');
      // In production, trigger download
      // window.open(certificate.certificate_url, '_blank');
    } catch (error: any) {
      message.error('下载失败');
    }
  };

  const handlePreview = (certificate: Certificate) => {
    setPreviewCert(certificate);
    setPreviewVisible(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        加载中...
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          我的证书
        </h1>
        <p style={{ color: '#8c8c8c', fontSize: 16 }}>
          查看并下载所有获得的学习证书
        </p>
      </div>

      {certificates.length === 0 ? (
        <Empty
          description="暂无证书，完成课程后可获得证书"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 60 }}
        />
      ) : (
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          dataSource={certificates}
          renderItem={(certificate) => (
            <List.Item>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: 24 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                {/* Certificate Icon */}
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: 24,
                  }}
                >
                  <CertificateOutlined
                    style={{
                      fontSize: 80,
                      color: '#667eea',
                    }}
                  />
                </div>

                {/* Certificate Info */}
                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      marginBottom: 12,
                      color: '#262626',
                    }}
                  >
                    {certificate.course.title}
                  </h3>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space size="middle">
                      <CertificateOutlined />
                      <span style={{ color: '#8c8c8c' }}>
                        {certificate.certificate_number}
                      </span>
                    </Space>
                    <Space size="middle">
                      <CalendarOutlined />
                      <span style={{ color: '#8c8c8c' }}>
                        颁发日期：{certificate.issue_date}
                      </span>
                    </Space>
                  </Space>
                </div>

                {/* Status */}
                <div style={{ marginBottom: 24 }}>
                  <Tag
                    color="success"
                    icon={<CheckCircleOutlined />}
                    style={{ fontSize: 14, padding: '6px 16px', borderRadius: 6 }}
                  >
                    证书有效
                  </Tag>
                </div>

                {/* Actions */}
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    size="large"
                    block
                    onClick={() => handleDownload(certificate)}
                    style={{
                      height: 44,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                    }}
                  >
                    下载证书
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    size="large"
                    block
                    onClick={() => handlePreview(certificate)}
                    style={{
                      height: 40,
                      borderRadius: 8,
                    }}
                  >
                    预览证书
                  </Button>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* Preview Modal */}
      <Modal
        title="证书预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewCert && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CertificateOutlined
              style={{
                fontSize: 120,
                color: '#667eea',
                marginBottom: 24,
              }}
            />
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
              学习完成证书
            </h2>
            <div
              style={{
                background: '#f5f5f5',
                padding: 24,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {previewCert.course.title}
              </p>
              <Space direction="vertical" size="small">
                <p style={{ color: '#8c8c8c', margin: 0 }}>
                  证书编号：{previewCert.certificate_number}
                </p>
                <p style={{ color: '#8c8c8c', margin: 0 }}>
                  颁发日期：{previewCert.issue_date}
                </p>
              </Space>
            </div>
            <Tag
              color="success"
              icon={<CheckCircleOutlined />}
              style={{ fontSize: 16, padding: '8px 20px', borderRadius: 8 }}
            >
              证书有效
            </Tag>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyCertificates;
