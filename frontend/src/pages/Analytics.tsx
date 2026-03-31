import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Course Analytics Page
export function CourseAnalytics() {
  const { courseId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/analytics/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      message.error('获取课程分析失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchAnalytics();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        暂无分析数据
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#333', fontWeight: '700', margin: 0 }}>
            课程分析
          </h1>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '2px solid #667eea',
              borderRadius: '8px',
              color: '#667eea',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ← 返回课程
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '20px' }}>
              总体概览
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div>
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>学生总数</div>
                <div style={{ color: '#333', fontSize: '28px', fontWeight: '700' }}>
                  {analytics.total_students || 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>活跃学生</div>
                <div style={{ color: '#52c41a', fontSize: '28px', fontWeight: '700' }}>
                  {analytics.active_students || 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>完成率</div>
                <div style={{ color: '#667eea', fontSize: '28px', fontWeight: '700' }}>
                  {analytics.completion_rate || 0}%
                </div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>平均得分</div>
                <div style={{ color: '#faad14', fontSize: '28px', fontWeight: '700' }}>
                  {analytics.average_score || 0}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '20px' }}>
              学习进度分布
            </h3>
            {analytics.progress_distribution ? (
              <div style={{ display: 'flex', gap: '15px', height: '200px', alignItems: 'flex-end' }}>
                {Object.entries(analytics.progress_distribution).map(([range, count], index) => (
                  <div key={range} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%',
                      height: `${(count / Math.max(...Object.values(analytics.progress_distribution))) * 100}%`,
                      background: ['#667eea', '#52c41a', '#faad14', '#ff4d4f'][index],
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.3s',
                    }} />
                    <div style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>{range}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#999', fontSize: '16px', textAlign: 'center', padding: '40px' }}>
                暂无数据
              </div>
            )}
          </div>

          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '20px' }}>
              学生活跃度
            </h3>
            {analytics.student_activity ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {analytics.student_activity.map((student, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    background: '#f9f9f9',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '16px', color: '#333', fontWeight: '600', marginBottom: '5px' }}>
                        {student.name || `学生${index + 1}`}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        活跃 {student.active_days || 0} 天
                      </div>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                      {student.score || 0} 分
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#999', fontSize: '16px', textAlign: 'center', padding: '40px' }}>
                暂无数据
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Analytics Page
export function StudentAnalytics() {
  const { studentId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/analytics/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      message.error('获取学生分析失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchAnalytics();
  }, [studentId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        暂无分析数据
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
          学生学习分析
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>姓名</div>
              <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
                {analytics.name || '未知'}
              </div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>总学习时长</div>
              <div style={{ color: '#667eea', fontSize: '24px', fontWeight: '700' }}>
                {analytics.total_study_time || 0} 小时
              </div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>完成课程</div>
              <div style={{ color: '#52c41a', fontSize: '24px', fontWeight: '700' }}>
                {analytics.completed_courses || 0} 门
              </div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>获得证书</div>
              <div style={{ color: '#faad14', fontSize: '24px', fontWeight: '700' }}>
                {analytics.certificates || 0} 个
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '20px' }}>
              学习趋势
            </h3>
            <div style={{ height: '200px', background: '#f9f9f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: '#999', fontSize: '16px', textAlign: 'center' }}>
                📈 学习趋势图表
              </div>
            </div>
          </div>

          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '20px' }}>
              知识掌握度
            </h3>
            {analytics.knowledge_mastery ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {analytics.knowledge_mastery.slice(0, 5).map((knowledge, index) => (
                  <div key={index} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>{knowledge.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#667eea' }}>{knowledge.mastery || 0}%</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
                      <div style={{ width: `${knowledge.mastery || 0}%`, height: '100%', background: '#667eea', borderRadius: '5px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#999', fontSize: '16px', textAlign: 'center', padding: '40px' }}>
                暂无数据
              </div>
            )}
          </div>

          <div style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '20px' }}>
              课程成绩
            </h3>
            {analytics.course_grades ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {analytics.course_grades.slice(0, 5).map((course, index) => (
                  <div key={index} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#333', fontWeight: '600', marginBottom: '5px' }}>
                        {course.name || `课程${index + 1}`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {course.completed_at || '进行中'}
                      </div>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: course.score >= 80 ? '#52c41a' : course.score >= 60 ? '#faad14' : '#ff4d4f' }}>
                      {course.score || 0} 分
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#999', fontSize: '16px', textAlign: 'center', padding: '40px' }}>
                暂无数据
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Trend Analytics Page
export function TrendAnalytics() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/analytics/trends/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTrends(data || []);
    } catch (error) {
      message.error('获取趋势分析失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
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
          趋势分析
        </h1>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
          {trends.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
              <p style={{ color: '#999', fontSize: '18px' }}>暂无趋势数据</p>
            </div>
          ) : (
            trends.map((trend, index) => (
              <div key={index} style={{ padding: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', marginBottom: '20px' }}>
                  {trend.title || `趋势${index + 1}`}
                </h3>
                <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                  {trend.description || '暂无描述'}
                </div>
                <div style={{ height: '200px', background: '#f9f9f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: '#999', fontSize: '16px', textAlign: 'center' }}>
                    📊 {trend.type || '图表'}
                  </div>
                </div>
                <div style={{ marginTop: '20px', borderTop: '2px solid #f0f0f0', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                      更新时间
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {trend.updated_at ? new Date(trend.updated_at).toLocaleDateString('zh-CN') : '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
