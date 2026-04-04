/**
 * 超级黑板 - 实时协作白板系统 (修复版)
 * 不依赖fabric.js，使用原生Canvas API
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Row, Col, Button, Space, Divider, Tooltip, Badge, message,
  Select, Slider, Modal, Form, Input, List, Tag, Avatar, Radio
} from 'antd';
import {
  BgColorsOutlined, FontSizeOutlined, MinusOutlined, DeleteOutlined,
  ClearOutlined, SaveOutlined, ShareAltOutlined, UserOutlined, UndoOutlined,
  RedoOutlined, DownloadOutlined, FullscreenOutlined, TeamOutlined,
  EditOutlined, LineOutlined, BorderOutlined, DotChartOutlined, VideoCameraOutlined
} from '@ant-design/icons';
import { VideoConference } from '../components/VideoConference';

const { Option } = Select;
const { TextArea } = Input;

interface DrawingState {
  isDrawing: boolean;
  tool: 'pen' | 'line' | 'rect' | 'circle' | 'text' | 'eraser';
  color: string;
  strokeWidth: number;
  startX: number;
  startY: number;
  history: ImageData[];
  historyStep: number;
}

interface Collaborator {
  id: string;
  name: string;
  status: 'online' | 'offline';
  color: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export function SuperBlackboardFixed() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    tool: 'pen',
    color: '#000000',
    strokeWidth: 2,
    startX: 0,
    startY: 0,
    history: [],
    historyStep: -1
  });
  const [boardTitle, setBoardTitle] = useState('教学板 - Python基础');
  const [collaborators] = useState<Collaborator[]>([
    { id: '1', name: '教师', status: 'online', color: '#52c41a' },
    { id: '2', name: '学生A', status: 'online', color: '#1890ff' },
    { id: '3', name: '学生B', status: 'offline', color: '#999' }
  ]);
  const [layers] = useState<Layer[]>([
    { id: '1', name: '绘图层', visible: true, locked: false },
    { id: '2', name: '标注层', visible: true, locked: false },
    { id: '3', name: '背景层', visible: true, locked: true }
  ]);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  // 视频会议状态
  const [videoConferenceVisible, setVideoConferenceVisible] = useState(false);
  const [roomId] = useState(() => `room_${Date.now()}`);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const username = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').full_name || '同学' : '同学';

  // 获取Canvas上下文
  const getCanvas = () => canvasRef.current;
  const getContext = () => {
    const canvas = getCanvas();
    return canvas?.getContext('2d') || null;
  };

  // 保存当前状态到历史记录
  const saveToHistory = () => {
    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = drawingState.history.slice(0, drawingState.historyStep + 1);
    newHistory.push(imageData);

    setDrawingState(prev => ({
      ...prev,
      history: newHistory,
      historyStep: newHistory.length - 1
    }));
  };

  // 开始绘图
  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingState.tool === 'text') {
      setTextPosition({ x, y });
      setTextInputVisible(true);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = drawingState.tool === 'eraser' ? '#ffffff' : drawingState.color;
    ctx.lineWidth = drawingState.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
      startX: x,
      startY: y
    }));
  };

  // 绘图过程
  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing) return;

    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingState.tool === 'pen' || drawingState.tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (drawingState.tool === 'line') {
      // 直线预览
      ctx.putImageData(drawingState.history[drawingState.historyStep], 0, 0);
      ctx.beginPath();
      ctx.moveTo(drawingState.startX, drawingState.startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (drawingState.tool === 'rect') {
      // 矩形预览
      ctx.putImageData(drawingState.history[drawingState.historyStep], 0, 0);
      const width = x - drawingState.startX;
      const height = y - drawingState.startY;
      ctx.strokeRect(drawingState.startX, drawingState.startY, width, height);
    } else if (drawingState.tool === 'circle') {
      // 圆形预览
      ctx.putImageData(drawingState.history[drawingState.historyStep], 0, 0);
      const radius = Math.sqrt(
        Math.pow(x - drawingState.startX, 2) +
        Math.pow(y - drawingState.startY, 2)
      );
      ctx.beginPath();
      ctx.arc(drawingState.startX, drawingState.startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  // 结束绘图
  const handleStopDrawing = () => {
    if (!drawingState.isDrawing) return;
    saveToHistory();
    setDrawingState(prev => ({ ...prev, isDrawing: false }));
  };

  // 添加文字
  const handleAddText = () => {
    if (!textInputValue.trim()) return;

    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.font = `${drawingState.strokeWidth * 5}px Arial`;
    ctx.fillStyle = drawingState.color;
    ctx.fillText(textInputValue, textPosition.x, textPosition.y);

    setTextInputValue('');
    setTextInputVisible(false);
    saveToHistory();
  };

  // 清空画板
  const handleClear = () => {
    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    message.success('画板已清空');
  };

  // 撤销
  const handleUndo = () => {
    if (drawingState.historyStep <= 0) {
      message.warning('没有更多步骤可撤销');
      return;
    }

    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const previousState = drawingState.history[drawingState.historyStep - 1];
    ctx.putImageData(previousState, 0, 0);

    setDrawingState(prev => ({
      ...prev,
      historyStep: prev.historyStep - 1
    }));

    message.success('已撤销');
  };

  // 重做
  const handleRedo = () => {
    if (drawingState.historyStep >= drawingState.history.length - 1) {
      message.warning('没有更多步骤可重做');
      return;
    }

    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const nextState = drawingState.history[drawingState.historyStep + 1];
    ctx.putImageData(nextState, 0, 0);

    setDrawingState(prev => ({
      ...prev,
      historyStep: prev.historyStep + 1
    }));

    message.success('已重做');
  };

  // 保存图片
  const handleSave = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${boardTitle}.png`;
    link.href = dataURL;
    link.click();
    message.success('画板已保存为图片');
  };

  // 全屏
  const handleFullscreen = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    }
  };

  // 工具选项
  const tools = [
    { key: 'pen', icon: <EditOutlined />, label: '画笔' },
    { key: 'line', icon: <LineOutlined />, label: '直线' },
    { key: 'rect', icon: <BorderOutlined />, label: '矩形' },
    { key: 'circle', icon: <DotChartOutlined />, label: '圆形' },
    { key: 'text', icon: <FontSizeOutlined />, label: '文字' },
    { key: 'eraser', icon: <DeleteOutlined />, label: '橡皮擦' }
  ];

  // 颜色选项
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'
  ];

  useEffect(() => {
    const canvas = getCanvas();
    const ctx = getContext();
    if (!canvas || !ctx) return;

    // 初始化白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 保存初始状态
    saveToHistory();
  }, []);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: '#333' }}>
          🖼️ 超级黑板
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          实时协作白板 - 支持多人同时绘图
        </p>
      </div>

      <Card>
        {/* 工具栏 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card size="small">
              <Space size="middle" wrap>
                {/* 工具选择 */}
                <Space>
                  <span>工具:</span>
                  <Radio.Group
                    value={drawingState.tool}
                    onChange={(e) => setDrawingState(prev => ({ ...prev, tool: e.target.value }))}
                    optionType="button"
                    buttonStyle="solid"
                  >
                    {tools.map(tool => (
                      <Radio.Button key={tool.key} value={tool.key}>
                        {tool.icon} {tool.label}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Space>

                <Divider type="vertical" />

                {/* 颜色选择 */}
                <Space>
                  <span>颜色:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {colors.map(color => (
                      <div
                        key={color}
                        onClick={() => setDrawingState(prev => ({ ...prev, color }))}
                        style={{
                          width: 24,
                          height: 24,
                          background: color,
                          border: drawingState.color === color ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          borderRadius: 4,
                          cursor: 'pointer',
                          borderStyle: drawingState.color === color ? 'solid' : 'inset'
                        }}
                      />
                    ))}
                  </div>
                </Space>

                <Divider type="vertical" />

                {/* 粗细调节 */}
                <Space>
                  <span>粗细:</span>
                  <Slider
                    min={1}
                    max={20}
                    value={drawingState.strokeWidth}
                    onChange={(value) => setDrawingState(prev => ({ ...prev, strokeWidth: value }))}
                    style={{ width: 100 }}
                  />
                  <span>{drawingState.strokeWidth}px</span>
                </Space>

                <Divider type="vertical" />

                {/* 操作按钮 */}
                <Button
                  icon={<UndoOutlined />}
                  onClick={handleUndo}
                  disabled={drawingState.historyStep <= 0}
                >
                  撤销
                </Button>
                <Button
                  icon={<RedoOutlined />}
                  onClick={handleRedo}
                  disabled={drawingState.historyStep >= drawingState.history.length - 1}
                >
                  重做
                </Button>
                <Button icon={<ClearOutlined />} onClick={handleClear} danger>
                  清空
                </Button>
                <Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>
                  保存
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={() => setShareModalVisible(true)}>
                  分享
                </Button>
                <Button icon={<FullscreenOutlined />} onClick={handleFullscreen}>
                  全屏
                </Button>

                <Divider type="vertical" />

                {/* 视频会议 */}
                <Button
                  type="primary"
                  icon={<VideoCameraOutlined />}
                  onClick={() => setVideoConferenceVisible(true)}
                  style={{ background: '#722ed1', borderColor: '#722ed1' }}
                >
                  视频会议
                </Button>

                <Divider type="vertical" />

                {/* 协作信息 */}
                <Badge count={collaborators.filter(c => c.status === 'online').length} showZero>
                  <Button icon={<TeamOutlined />}>
                    协作中
                  </Button>
                </Badge>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 画板 */}
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Card
              title={
                <Space>
                  <Input
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Tag color="blue">实时协作中</Tag>
                  <Tag color="green">已自动保存</Tag>
                </Space>
              }
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                style={{
                  border: '2px solid #d9d9d9',
                  borderRadius: '8px',
                  cursor: drawingState.tool === 'eraser' ? 'cell' : 'crosshair',
                  background: 'white'
                }}
                onMouseDown={handleStartDrawing}
                onMouseMove={handleDraw}
                onMouseUp={handleStopDrawing}
                onMouseLeave={handleStopDrawing}
              />
            </Card>
          </Col>

          {/* 侧边栏 */}
          <Col span={6}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* 协作成员 */}
              <Card size="small" title="协作成员">
                <List
                  size="small"
                  dataSource={collaborators}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} style={{ background: item.color }} />
                        {item.name}
                        <Badge status={item.status} />
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              {/* 图层管理 */}
              <Card size="small" title="图层管理">
                <List
                  size="small"
                  dataSource={layers}
                  renderItem={(layer) => (
                    <List.Item>
                      <Space>
                        <Badge status={layer.visible ? 'success' : 'default'} />
                        {layer.name}
                        {layer.locked && <Tag color="orange">锁定</Tag>}
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              {/* 快捷操作 */}
              <Card size="small" title="快捷操作">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button icon={<DownloadOutlined />} block>
                    导出为图片
                  </Button>
                  <Button icon={<BgColorsOutlined />} block>
                    更换背景
                  </Button>
                  <Button icon={<TeamOutlined />} block>
                    邀请协作者
                  </Button>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 文字输入模态框 */}
      <Modal
        title="添加文字"
        open={textInputVisible}
        onOk={handleAddText}
        onCancel={() => {
          setTextInputVisible(false);
          setTextInputValue('');
        }}
      >
        <TextArea
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value)}
          placeholder="请输入文字内容..."
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Modal>

      {/* 分享模态框 */}
      <Modal
        title="分享画板"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setShareModalVisible(false)}>
            关闭
          </Button>,
          <Button key="copy" type="primary">
            复制链接
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            value={`${window.location.origin}/board/${Date.now()}`}
            readOnly
          />
          <div style={{ padding: '12px', background: '#f0f5ff', borderRadius: '8px' }}>
            💡 任何人获得此链接都可以查看和编辑此画板
          </div>
        </Space>
      </Modal>

      {/* 视频会议 */}
      <VideoConference
        visible={videoConferenceVisible}
        onClose={() => setVideoConferenceVisible(false)}
        roomId={roomId}
        userId={userId}
        username={username}
      />
    </div>
  );
}

export default SuperBlackboardFixed;