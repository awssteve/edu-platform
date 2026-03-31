import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Learning Progress Page
export function LearningProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/learning/progress/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProgress(data || []);
    } catch (error) {
      message.error('获取学习进度失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
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
          学习进度
        </h1>

        {progress.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无学习进度</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {progress.map((item) => (
              <ProgressCard key={item.id} progress={item} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressCard({ progress, navigate }) {
  const progressPercent = progress.progress || 0;

  return (
    <div
      onClick={() => navigate(`/courses/${progress.course_id}`)}
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '22px', color: '#333', fontWeight: '600', margin: 0 }}>
          {progress.course_title || '未知课程'}
        </h3>
        <div style={{ color: '#667eea', fontSize: '32px', fontWeight: '700' }}>
          {progressPercent}%
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{
          width: '100%',
          height: '12px',
          background: '#f0f0f0',
          borderRadius: '6px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: progressPercent >= 80 ? '#52c41a' : progressPercent >= 50 ? '#faad14' : '#ff4d4f',
            borderRadius: '6px',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
        <div>
          <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>已完成课时</div>
          <div style={{ color: '#333', fontSize: '20px', fontWeight: '600' }}>
            {progress.completed_lessons || 0}
          </div>
        </div>
        <div>
          <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>总课时</div>
          <div style={{ color: '#333', fontSize: '20px', fontWeight: '600' }}>
            {progress.total_lessons || 0}
          </div>
        </div>
        <div>
          <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>最后学习</div>
          <div style={{ color: '#666', fontSize: '16px' }}>
            {progress.last_studied_at ? new Date(progress.last_studied_at).toLocaleDateString('zh-CN') : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Learning Records Page
export function LearningRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/learning/records/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setRecords(data || []);
    } catch (error) {
      message.error('获取学习记录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
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
          学习记录
        </h1>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📖</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无学习记录</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {records.map((record) => (
              <div key={record.id} style={{
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', margin: 0 }}>
                    {record.course_title || '未知课程'}
                  </h3>
                  <div style={{ color: '#999', fontSize: '14px' }}>
                    {record.created_at ? new Date(record.created_at).toLocaleString('zh-CN') : '-'}
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
                  {record.activity || '学习活动'}
                </p>
                {record.duration && (
                  <div style={{ color: '#999', fontSize: '14px' }}>
                    学习时长: {record.duration} 分钟
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Learning Timeline Page
export function LearningTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/learning/timeline/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTimeline(data || []);
    } catch (error) {
      message.error('获取学习时间线失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
          学习时间线
        </h1>

        {timeline.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📅</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无学习时间线</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {timeline.map((item, index) => (
              <div key={item.id} style={{
                position: 'relative',
                paddingLeft: '40px',
                paddingBottom: index < timeline.length - 1 ? '40px' : 0,
                marginBottom: index < timeline.length - 1 ? '0' : '20px',
              }}>
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  width: '12px',
                  height: '12px',
                  background: '#667eea',
                  borderRadius: '50%',
                }} />
                <div style={{
                  position: 'absolute',
                  left: '5px',
                  top: '12px',
                  width: '2px',
                  height: 'calc(100% - 12px)',
                  background: '#e1e1e1',
                }} />
                <div style={{
                  padding: '20px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                  <div style={{ color: '#999', fontSize: '14px', marginBottom: '10px' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleString('zh-CN') : '-'}
                  </div>
                  <h3 style={{ fontSize: '18px', color: '#333', fontWeight: '600', marginBottom: '10px', margin: 0 }}>
                    {item.course_title || '未知课程'}
                  </h3>
                  <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    {item.activity || '学习活动'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
