import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  List,
  Input,
  Button,
  Space,
  Tag,
  Avatar,
  message,
  Empty,
  Pagination,
} from 'antd';
import {
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  CommentOutlined,
  SearchOutlined,
  PlusOutlined,
  StarOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import axios from 'axios';

interface Topic {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  reply_count: number;
  view_count: number;
  last_reply_at: string;
  creator: {
    full_name: string;
    avatar_url: string;
  };
}

const Discussion = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchTopics();
  }, [courseId, searchText, filterTag]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockTopics: Topic[] = [
        {
          id: '1',
          title: '第一章课后问题：如何理解新能源汽车的定义？',
          content: '在学习第一章后，我对新能源汽车的定义有些疑问，希望能得到老师的解答...',
          tags: ['答疑'],
          is_pinned: true,
          reply_count: 5,
          view_count: 123,
          last_reply_at: '2026-03-27 15:30',
          creator: {
            full_name: '张同学',
            avatar_url: '',
          },
        },
        {
          id: '2',
          title: '分享：我的学习笔记',
          content: '整理了前三章的重点笔记，希望能帮助到同学们...',
          tags: ['分享'],
          is_pinned: false,
          reply_count: 12,
          view_count: 256,
          last_reply_at: '2026-03-26 18:20',
          creator: {
            full_name: '李同学',
            avatar_url: '',
          },
        },
        {
          id: '3',
          title: '关于实验操作的疑问',
          content: '在第三章的实验中，遇到了一些操作上的问题...',
          tags: ['讨论'],
          is_pinned: false,
          reply_count: 8,
          view_count: 89,
          last_reply_at: '2026-03-26 14:15',
          creator: {
            full_name: '王同学',
            avatar_url: '',
          },
        },
      ];

      setTopics(mockTopics);
    } catch (error: any) {
      message.error('获取讨论列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const filteredTopics = topics.filter((topic) => {
    if (searchText && !topic.title.includes(searchText)) {
      return false;
    }
    if (filterTag && !topic.tags.includes(filterTag)) {
      return false;
    }
    return true;
  });

  const paginatedTopics = filteredTopics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
          课程讨论
        </h1>
        <p style={{ color: '#8c8c8c', fontSize: 16 }}>
          与老师和同学互动交流
        </p>
      </div>

      {/* Search and Filter */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
        }}
      >
        <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="搜索讨论主题..."
            allowClear
            enterButton
            size="large"
            style={{ width: 400 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              size="large"
              style={{
                height: 40,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              发起新讨论
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Topics List */}
      {paginatedTopics.length === 0 ? (
        <Empty
          description="暂无讨论主题"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 60 }}
        />
      ) : (
        <>
          <List
            dataSource={paginatedTopics}
            renderItem={(topic) => (
              <Card
                hoverable
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ marginBottom: 12 }}>
                  <Space size="middle" align="start" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Space size="middle">
                      <Avatar
                        size="large"
                        src={topic.creator.avatar_url}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#667eea' }}
                      />
                      <div>
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {topic.title}
                          {topic.is_pinned && (
                            <PushpinOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                          )}
                        </h3>
                        <p style={{ color: '#8c8c8c', fontSize: 14, margin: '4px 0 0 0' }}>
                          {topic.creator.full_name} · {new Date(topic.last_reply_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </Space>
                  </div>
                </div>

                <p
                  style={{
                    color: '#595959',
                    fontSize: 15,
                    marginBottom: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {topic.content}
                </p>

                <Space size="middle">
                  {topic.tags.map((tag) => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </Space>

                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space size="middle">
                      <Space>
                        <CommentOutlined style={{ color: '#8c8c8c' }} />
                        <span style={{ color: '#8c8c8c' }}>
                          {topic.reply_count} 回复
                        </span>
                      </Space>
                      <Space>
                        <LikeOutlined style={{ color: '#8c8c8c' }} />
                        <span style={{ color: '#8c8c8c' }}>
                          {topic.view_count} 浏览
                        </span>
                      </Space>
                    </Space>
                    <Button type="link" style={{ color: '#667eea', fontWeight: 500 }}>
                      查看详情 <StarOutlined />
                    </Button>
                  </Space>
                </div>
              </Card>
            )}
          />

          {/* Pagination */}
          {filteredTopics.length > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredTopics.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条讨论`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Discussion;
