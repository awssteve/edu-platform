/**
 * 简单视频会议组件 - 使用浏览器原生API
 * 不依赖LiveKit服务器，直接使用getUserMedia
 */

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Space, message, Tooltip } from 'antd';
import {
  VideoCameraOutlined, AudioOutlined, AudioMutedOutlined,
  PhoneOutlined, DesktopOutlined
} from '@ant-design/icons';

interface SimpleVideoConferenceProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  userId: string;
  username: string;
}

export const SimpleVideoConference: React.FC<SimpleVideoConferenceProps> = ({
  visible,
  onClose,
  roomId,
  userId,
  username
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);

  // 获取本地媒体流
  const startLocalStream = async () => {
    try {
      setIsConnecting(true);
      message.loading({ content: '正在获取摄像头和麦克风...', key: 'connecting' });

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        message.error({ content: '您的浏览器不支持媒体设备访问', key: 'connecting' });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      setLocalStream(stream);
      setIsCameraEnabled(true);
      setIsMicrophoneEnabled(true);

      message.success({ content: '摄像头和麦克风已开启', key: 'connecting' });

      // 附加到video元素
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        message.error({ content: '请允许浏览器访问摄像头和麦克风', key: 'connecting' });
      } else if (error.name === 'NotFoundError') {
        message.error({ content: '未检测到摄像头或麦克风设备', key: 'connecting' });
      } else {
        message.error({ content: `无法访问设备: ${error.message}`, key: 'connecting' });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // 停止本地流
  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (screenShareRef.current) {
      const stream = screenShareRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      screenShareRef.current.srcObject = null;
    }
  };

  // 切换麦克风
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicrophoneEnabled(audioTrack.enabled);
        message.success(audioTrack.enabled ? '麦克风已开启' : '麦克风已静音');
      }
    }
  };

  // 切换摄像头
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraEnabled(videoTrack.enabled);
        message.success(videoTrack.enabled ? '摄像头已开启' : '摄像头已关闭');
      }
    }
  };

  // 屏幕共享
  const toggleScreenShare = async () => {
    try {
      if (!isScreenShareEnabled) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
        }

        setIsScreenShareEnabled(true);
        message.success('屏幕共享已开始');

        // 监听停止共享
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (error) {
      message.error('无法启动屏幕共享');
    }
  };

  const stopScreenShare = () => {
    if (screenShareRef.current) {
      const stream = screenShareRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      screenShareRef.current.srcObject = null;
    }
    setIsScreenShareEnabled(false);
    message.success('屏幕共享已结束');
  };

  // 挂断
  const hangup = () => {
    stopLocalStream();
    onClose();
  };

  // 当Modal打开时，自动获取媒体流
  useEffect(() => {
    if (visible && !localStream) {
      startLocalStream();
    }

    return () => {
      stopLocalStream();
    };
  }, [visible]);

  return (
    <Modal
      title={
        <Space>
          <VideoCameraOutlined />
          视频会议
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            房间: {roomId} | 用户: {username}
          </span>
        </Space>
      }
      open={visible}
      onCancel={hangup}
      width={1000}
      footer={null}
      maskClosable={false}
    >
      {/* 屏幕共享 */}
      {isScreenShareEnabled && (
        <div style={{
          position: 'relative',
          background: '#000',
          borderRadius: '8px',
          marginBottom: '16px',
          height: '300px',
          overflow: 'hidden'
        }}>
          <video
            ref={screenShareRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px 12px',
            background: 'rgba(245, 34, 45, 0.9)',
            borderRadius: '4px',
            color: 'white',
            fontSize: '13px'
          }}>
            屏幕共享中
          </div>
        </div>
      )}

      {/* 本地视频 */}
      <div style={{
        position: 'relative',
        background: '#000',
        borderRadius: '8px',
        aspectRatio: 16 / 9,
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          padding: '6px 12px',
          background: 'rgba(24, 144, 255, 0.8)',
          borderRadius: '4px',
          color: 'white',
          fontSize: '13px'
        }}>
          {username} (你)
        </div>

        {/* 未连接提示 */}
        {!localStream && !isConnecting && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
            <div>点击下方按钮开启摄像头</div>
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <div style={{
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <Tooltip title={isMicrophoneEnabled ? '静音' : '取消静音'}>
          <Button
            type={isMicrophoneEnabled ? 'default' : 'primary'}
            danger={!isMicrophoneEnabled}
            icon={isMicrophoneEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
            onClick={toggleMicrophone}
            size="large"
            disabled={!localStream}
          />
        </Tooltip>

        <Tooltip title={isCameraEnabled ? '关闭摄像头' : '开启摄像头'}>
          <Button
            type={isCameraEnabled ? 'default' : 'primary'}
            danger={!isCameraEnabled}
            icon={<VideoCameraOutlined />}
            onClick={toggleCamera}
            size="large"
            disabled={!localStream}
          />
        </Tooltip>

        <Tooltip title={isScreenShareEnabled ? '停止共享' : '屏幕共享'}>
          <Button
            type={isScreenShareEnabled ? 'primary' : 'default'}
            icon={<DesktopOutlined />}
            onClick={toggleScreenShare}
            size="large"
          >
            {isScreenShareEnabled ? '停止共享' : '共享屏幕'}
          </Button>
        </Tooltip>

        <Tooltip title="挂断">
          <Button
            type="primary"
            danger
            icon={<PhoneOutlined />}
            onClick={hangup}
            size="large"
          >
            挂断
          </Button>
        </Tooltip>
      </div>

      {/* 提示信息 */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: '4px',
        fontSize: '13px',
        color: '#0050b3',
        textAlign: 'center'
      }}>
        ✅ 摄像头和麦克风已连接 - 这是本地预览，实际多人视频需要LiveKit服务器
      </div>
    </Modal>
  );
};

export default SimpleVideoConference;
