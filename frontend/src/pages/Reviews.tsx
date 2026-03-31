import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Rate } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

// Course Reviews List Page
export function CourseReviewsList() {
  const { courseId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      message.error('获取评价列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchReviews();
  }, [courseId]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', color: '#333', fontWeight: '700', margin: 0 }}>
            课程评价
          </h1>
          <button
            onClick={() => navigate(`/courses/${courseId}/reviews/create`)}
            style={{
              padding: '12px 25px',
              fontSize: '16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            写评价
          </button>
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⭐</div>
            <p style={{ color: '#999', fontSize: '18px' }}>暂无评价，成为第一个评价的人！</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', color: '#333', fontWeight: '600', margin: 0 }}>
          {review.author_name || '匿名'}
        </h3>
        <Rate disabled defaultValue={review.rating || 0} style={{ fontSize: '16px' }} />
      </div>
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.8', marginBottom: '15px' }}>
        {review.content}
      </p>
      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '15px', color: '#999', fontSize: '14px' }}>
        {review.created_at ? new Date(review.created_at).toLocaleDateString('zh-CN') : '-'}
      </div>
    </div>
  );
}

// Create Review Page
export function CreateReview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
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
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        message.success('评价提交成功！');
        navigate(`/courses/${courseId}/reviews`);
      } else {
        message.error(data.detail || '提交失败');
      }
    } catch (error) {
      message.error('提交失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '700' }}>
          写课程评价
        </h1>

        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '15px', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                评分 *
              </label>
              <Rate
                value={formData.rating}
                onChange={(value) => setFormData({ ...formData, rating: value })}
                style={{ fontSize: '32px' }}
              />
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
                  lineHeight: '1.6',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '20px',
                fontSize: '20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '提交中...' : '提交评价'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
