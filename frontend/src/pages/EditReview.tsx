import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Rate } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Edit Review Page
export function EditReview() {
  const { courseId, reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('token') || '');

  const fetchReview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setReview(data);
      setFormData({
        rating: data.rating || 5,
        content: data.content || '',
      });
    } catch (error) {
      message.error('获取评价详情失败: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('评价更新成功！');
        navigate(`/courses/${courseId}/reviews`);
      } else {
        message.error(data.detail || '更新失败');
      }
    } catch (error) {
      message.error('更新失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reviewId && courseId) fetchReview();
  }, [reviewId, courseId]);

  if (!review && !loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          编辑评价
        </h1>

        {review && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '15px', color: '#333', fontSize: '18px', fontWeight: '600', textAlign: 'center' }}>
                评分 *
              </label>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Rate
                  value={formData.rating}
                  onChange={(value) => setFormData({ ...formData, rating: value })}
                  style={{ fontSize: '32px' }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: '10px', color: '#999', fontSize: '14px' }}>
                请点击星星进行评分
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                评价内容 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入您的评价内容（至少20字）"
                required
                minLength="20"
                rows={8}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  lineHeight: '1.8',
                }}
              />
            </div>

            <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '25px' }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>
                  当前评价
                </div>
                <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', color: '#333', fontWeight: '500', marginBottom: '10px' }}>
                    {review.author_name || '匿名'}
                  </div>
                  <div style={{ fontSize: '16px', color: '#667eea', fontWeight: '600', marginBottom: '5px' }}>
                    {review.rating} 星评价
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                    {review.content || '暂无内容'}
                  </div>
                  <div style={{ color: '#999', fontSize: '14px', marginTop: '10px' }}>
                    创建时间: {review.created_at ? new Date(review.created_at).toLocaleDateString('zh-CN') : '-'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', borderTop: '2px solid #f0f0f0', paddingTop: '25px' }}>
              <button
                type="button"
                onClick={() => navigate(`/courses/${courseId}/reviews`)}
                style={{
                  flex: 1,
                  padding: '18px',
                  fontSize: '18px',
                  background: 'white',
                  color: '#666',
                  border: '2px solid #e1e1e1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
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
                {loading ? '更新中...' : '更新评价'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
