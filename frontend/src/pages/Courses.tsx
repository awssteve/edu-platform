import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Course List Page
export function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/v1/courses/`;
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (params.toString()) url += `?${params}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCourses(data || []);
    } catch (error) {
      message.error('获取课程列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, categoryFilter]);

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
          课程列表
        </h1>

        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="搜索课程..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 15px',
                border: '2px solid #e1e1e1',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '12px 15px',
                border: '2px solid #e1e1e1',
                borderRadius: '10px',
                fontSize: '16px',
                background: 'white',
                minWidth: '150px',
              }}
            >
              <option value="">所有分类</option>
              <option value="数学">数学</option>
              <option value="物理">物理</option>
              <option value="化学">化学</option>
              <option value="生物">生物</option>
              <option value="计算机">计算机</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999', fontSize: '18px' }}>
            加载中...
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999', fontSize: '18px' }}>
            暂无课程
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '24px', color: '#333', fontWeight: '600', margin: 0 }}>
          {course.title}
        </h3>
        {course.category && (
          <span style={{
            background: '#667eea',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            {course.category}
          </span>
        )}
      </div>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '15px', lineHeight: '1.6' }}>
        {course.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#999', fontSize: '14px' }}>
        <div>
          {course.enrollment_count !== undefined && `已报名: ${course.enrollment_count} 人`}
        </div>
        <div>
          {course.created_at && new Date(course.created_at).toLocaleDateString('zh-CN')}
        </div>
      </div>
    </div>
  );
}

// Course Detail Page
export function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      message.error('获取课程详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!token) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        message.success('报名成功！');
        fetchCourse();
      } else {
        message.error(data.detail || '报名失败');
      }
    } catch (error) {
      message.error('报名失败: ' + error.message);
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        课程不存在
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/courses')}
          style={{
            padding: '10px 20px',
            background: 'white',
            border: '2px solid #667eea',
            borderRadius: '8px',
            color: '#667eea',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontWeight: '600',
          }}
        >
          ← 返回课程列表
        </button>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {course.category && (
            <span style={{
              background: '#667eea',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
              marginBottom: '20px',
            }}>
              {course.category}
            </span>
          )}

          <h1 style={{ fontSize: '40px', marginBottom: '30px', color: '#333', fontWeight: '700' }}>
            {course.title}
          </h1>

          <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.8', marginBottom: '40px' }}>
            {course.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px', borderTop: '2px solid #f0f0f0', paddingTop: '30px' }}>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>报名人数</div>
              <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
                {course.enrollment_count || 0}
              </div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '14px', marginBottom: '5px' }}>创建时间</div>
              <div style={{ color: '#333', fontSize: '24px', fontWeight: '600' }}>
                {course.created_at ? new Date(course.created_at).toLocaleDateString('zh-CN') : '-'}
              </div>
            </div>
          </div>

          <button
            onClick={handleEnroll}
            disabled={enrolling}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: enrolling ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              opacity: enrolling ? 0.6 : 1,
            }}
          >
            {enrolling ? '报名中...' : '立即报名'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Course Page
export function CreateCourse() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('课程创建成功！');
        navigate(`/courses/${data.id}`);
      } else {
        message.error(data.detail || '创建失败');
      }
    } catch (error) {
      message.error('创建失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          创建课程
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                课程标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入课程标题"
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

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                课程分类 *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  background: 'white',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">请选择分类</option>
                <option value="数学">数学</option>
                <option value="物理">物理</option>
                <option value="化学">化学</option>
                <option value="生物">生物</option>
                <option value="计算机">计算机</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                课程描述 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入课程描述"
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
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
              {loading ? '创建中...' : '创建课程'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
