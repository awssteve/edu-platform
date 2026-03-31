import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Card, Statistic, Row, Col, Progress } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Learning Summary Page
export function LearningSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/learning/summary/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      message.error('获取学习摘要失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        暂无学习摘要
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
          学习摘要
        </h1>

        <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
          <Col span={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="总学习时长" value={summary.total_study_hours || 0} suffix=" 小时" />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="已完成课程" value={summary.completed_courses || 0} suffix=" 门" />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="获得证书" value={summary.certificates || 0} suffix=" 个" />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic title="总积分" value={summary.total_points || 0} suffix=" 分" />
            </Card>
          </Col>
        </Row>

        <Card title="课程进度" style={{ marginBottom: '30px' }}>
          {summary.course_progress && summary.course_progress.length > 0 ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {summary.course_progress.map((course, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
                      {course.title || `课程 ${idx + 1}`}
                    </span>
                    <span style={{ fontSize: '14px', color: '#667eea', fontWeight: '600' }}>
                      {course.progress || 0}%
                    </span>
                  </div>
                  <Progress
                    percent={course.progress || 0}
                    status={course.progress >= 80 ? 'success' : course.progress >= 50 ? 'normal' : 'exception'}
                    strokeColor={course.progress >= 80 ? '#52c41a' : course.progress >= 50 ? '#faad14' : '#ff4d4f'}
                    strokeWidth={8}
                  />
                  <div style={{ marginTop: '10px', color: '#999', fontSize: '14px' }}>
                    已完成 {course.completed_lessons || 0} / {course.total_lessons || 0} 课时
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
              暂无课程进度
            </div>
          )}
        </Card>

        <Card title="知识点掌握" style={{ marginBottom: '30px' }}>
          {summary.knowledge_mastery && summary.knowledge_mastery.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {summary.knowledge_mastery.slice(0, 6).map((knowledge, idx) => (
                <div key={idx} style={{ padding: '20px', background: '#f9f9f9', borderRadius: '12px' }}>
                  <div style={{ fontSize: '18px', color: '#333', fontWeight: '600', marginBottom: '10px' }}>
                    {knowledge.name || `知识点 ${idx + 1}`}
                  </div>
                  <Progress
                    percent={knowledge.mastery || 0}
                    strokeColor={knowledge.mastery >= 80 ? '#52c41a' : knowledge.mastery >= 50 ? '#faad14' : '#ff4d4f'}
                    strokeWidth={8}
                  />
                  <div style={{ marginTop: '10px', color: '#999', fontSize: '14px' }}>
                    掌握度: {knowledge.mastery || 0}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
              暂无知识点数据
            </div>
          )}
        </Card>

        <Card title="学习成就" style={{ marginBottom: '30px' }}>
          {summary.achievements && summary.achievements.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              {summary.achievements.slice(0, 8).map((achievement, idx) => (
                <div key={idx} style={{ padding: '20px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    {achievement.icon || '🏆'}
                  </div>
                  <div style={{ fontSize: '16px', color: '#52c41a', fontWeight: '600' }}>
                    {achievement.name || `成就 ${idx + 1}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
              暂无学习成就
            </div>
          )}
        </Card>

        <Card title="最近活动" style={{ marginBottom: '30px' }}>
          {summary.recent_activities && summary.recent_activities.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {summary.recent_activities.slice(0, 5).map((activity, idx) => (
                <div key={idx} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                  <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    {activity.date || '-'}
                  </div>
                  <div style={{ fontSize: '16px', color: '#333', fontWeight: '500' }}>
                    {activity.description || `活动 ${idx + 1}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
              暂无最近活动
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
