import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Select, DatePicker, Button } from 'antd';

const { Option } = Select;

// Search Page
export function SearchPage() {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    query: '',
    category: '',
    difficulty: '',
    priceRange: '',
  });

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchForm.query) params.append('query', searchForm.query);
    if (searchForm.category) params.append('category', searchForm.category);
    if (searchForm.difficulty) params.append('difficulty', searchForm.difficulty);

    navigate(`/courses/search?${params.toString()}`);
  };

  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '50vh' }}>
      <div style={{ maxWidth: '700px', width: '100%', marginTop: '20vh' }}>
        <div style={{ background: 'white', padding: '60px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: '40px', marginBottom: '40px', textAlign: 'center', color: '#333', fontWeight: '800' }}>
            搜索课程
          </h1>

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '12px', color: '#666', fontSize: '16px', fontWeight: '500' }}>
                关键词
              </label>
              <input
                type="text"
                value={searchForm.query}
                onChange={(e) => setSearchForm({ ...searchForm, query: e.target.value })}
                placeholder="请输入课程名称或描述"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e1e1e1',
                  borderRadius: '12px',
                  fontSize: '18px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e1e1e1'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '12px', color: '#666', fontSize: '16px', fontWeight: '500' }}>
                  分类
                </label>
                <select
                  value={searchForm.category}
                  onChange={(e) => setSearchForm({ ...searchForm, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'white',
                    boxSizing: 'border-box',
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

              <div>
                <label style={{ display: 'block', marginBottom: '12px', color: '#666', fontSize: '16px', fontWeight: '500' }}>
                  难度
                </label>
                <select
                  value={searchForm.difficulty}
                  onChange={(e) => setSearchForm({ ...searchForm, difficulty: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e1e1e1',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'white',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">所有难度</option>
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                height: '56px',
                fontSize: '20px',
                fontWeight: '600',
                borderRadius: '12px',
              }}
              block
            >
              开始搜索
            </Button>
          </form>

          <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #f0f0f0' }}>
            <p style={{ color: '#999', fontSize: '16px', textAlign: 'center', marginBottom: '15px' }}>
              热门搜索
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['Python', 'JavaScript', '机器学习', '数据科学', '人工智能'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchForm({ ...searchForm, query: tag })}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    background: 'white',
                    color: '#667eea',
                    border: '1px solid #e1e1e1',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#667eea'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667eea'; }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
