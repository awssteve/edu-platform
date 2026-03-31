import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Certificates List Page
export function CertificatesList() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCertificates(data || []);
    } catch (error) {
      message.error('获取证书列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
          我的证书
        </h1>

        {certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏆</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无证书，完成课程学习后获得证书</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CertificateCard({ certificate, navigate }) {
  return (
    <div
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '22px', color: '#333', fontWeight: '600', marginBottom: '15px', margin: 0 }}>
          {certificate.course_title || '未知课程'}
        </h3>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px', margin: 0 }}>
          证书编号: {certificate.certificate_number || '-'}
        </p>
        <div style={{ color: '#999', fontSize: '14px' }}>
          颁发日期: {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('zh-CN') : '-'}
        </div>
      </div>
      <div style={{ fontSize: '48px' }}>
        🏆
      </div>
    </div>
  );
}

// Certificate Detail Page
export function CertificateDetail() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchCertificate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${certificateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCertificate(data);
    } catch (error) {
      message.error('获取证书详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${certificateId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success('证书下载成功！');
      } else {
        const data = await response.json();
        message.error(data.detail || '下载失败');
      }
    } catch (error) {
      message.error('下载失败: ' + error.message);
    }
  };

  useEffect(() => {
    if (certificateId) fetchCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  if (!certificate) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        证书不存在
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <button
          onClick={() => navigate('/certificates')}
          style={{
            padding: '10px 20px',
            background: 'white',
            border: '2px solid #667eea',
            borderRadius: '8px',
            color: '#667eea',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '30px',
            fontWeight: '600',
          }}
        >
          ← 返回证书列表
        </button>

        <div style={{
          padding: '80px 60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
          color: 'white',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '30px' }}>🏆</div>
          <h1 style={{ fontSize: '40px', marginBottom: '20px', fontWeight: '700', margin: 0 }}>
            课程结业证书
          </h1>
          <p style={{ fontSize: '24px', marginBottom: '40px', margin: 0 }}>
            兹授予
          </p>
          <h2 style={{ fontSize: '36px', marginBottom: '60px', fontWeight: '600', margin: 0 }}>
            {certificate.student_name || '学员'}
          </h2>
          <div style={{ borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '30px', marginBottom: '30px' }}>
            <div style={{ fontSize: '20px', marginBottom: '15px' }}>
              课程: {certificate.course_title || '未知课程'}
            </div>
            <div style={{ fontSize: '20px', marginBottom: '15px' }}>
              完成时间: {certificate.completed_at ? new Date(certificate.completed_at).toLocaleDateString('zh-CN') : '-'}
            </div>
            <div style={{ fontSize: '20px', marginBottom: '15px' }}>
              颁发日期: {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('zh-CN') : '-'}
            </div>
            <div style={{ fontSize: '18px', marginBottom: '15px', opacity: 0.8 }}>
              证书编号: {certificate.certificate_number || '-'}
            </div>
          </div>
          <button
            onClick={handleDownload}
            style={{
              padding: '18px 40px',
              fontSize: '20px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.3s',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            下载证书
          </button>
        </div>
      </div>
    </div>
  );
}

// Verify Certificate Page
export function VerifyCertificate() {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificate_number: certificateNumber }),
      });
      const data = await response.json();

      if (response.ok) {
        setResult(data);
        message.success('证书验证成功！');
      } else {
        setError(data.detail || '验证失败');
      }
    } catch (err) {
      setError('验证失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          验证证书
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                证书编号 *
              </label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="请输入证书编号"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '18px',
                fontSize: '18px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '验证中...' : '验证证书'}
            </button>
          </form>
        </div>

        {error && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '12px',
            color: '#ff4d4f',
            fontSize: '16px',
            textAlign: 'center',
          }}>
            ❌ {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '30px',
            padding: '30px',
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '12px',
            color: '#52c41a',
          }}>
            <div style={{ textAlign: 'center', fontSize: '32px', marginBottom: '20px' }}>✅</div>
            <div style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '600' }}>
              证书验证通过
            </div>
            <div style={{ marginBottom: '10px' }}>
              学员: {result.student_name || '-'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              课程: {result.course_title || '-'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              完成时间: {result.completed_at ? new Date(result.completed_at).toLocaleDateString('zh-CN') : '-'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              颁发日期: {result.issued_at ? new Date(result.issued_at).toLocaleDateString('zh-CN') : '-'}
            </div>
            <div style={{ fontSize: '14px', color: '#666', opacity: 0.8 }}>
              证书编号: {result.certificate_number || '-'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
