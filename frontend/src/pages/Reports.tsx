import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Button } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Reports List Page
export function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setReports(data || []);
    } catch (error) {
      message.error('获取报告列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportId, format) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success('报告下载成功！');
      } else {
        const data = await response.json();
        message.error(data.detail || '下载失败');
      }
    } catch (error) {
      message.error('下载失败: ' + error.message);
    }
  };

  useEffect(() => {
    fetchReports();
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
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
          学习报告
        </h1>

        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无报告</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onExport={handleExport} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ report, onExport }) {
  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h3 style={{ fontSize: '22px', color: '#333', fontWeight: '600', marginBottom: '15px', margin: 0 }}>
        {report.title}
      </h3>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px', lineHeight: '1.6' }}>
        {report.description || '暂无描述'}
      </p>
      <div style={{ display: 'flex', gap: '10px', borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
        <Button
          type="primary"
          onClick={() => onExport(report.id, 'pdf')}
          style={{ borderRadius: '8px', fontSize: '16px' }}
        >
          PDF
        </Button>
        <Button
          onClick={() => onExport(report.id, 'csv')}
          style={{ borderRadius: '8px', fontSize: '16px' }}
        >
          CSV
        </Button>
        <Button
          onClick={() => onExport(report.id, 'excel')}
          style={{ borderRadius: '8px', fontSize: '16px' }}
        >
          Excel
        </Button>
        <Button
          onClick={() => onExport(report.id, 'json')}
          style={{ borderRadius: '8px', fontSize: '16px' }}
        >
          JSON
        </Button>
      </div>
    </div>
  );
}
