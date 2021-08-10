import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Slider, InputNumber, Row, Col, Switch } from 'antd';
import { faBinoculars } from '@fortawesome/free-solid-svg-icons';
import {
  updateFOV,
  updateFPS,
  updateRenderDistance,
  updateVSync
} from '../../../reducers/settings/actions';

const VideoSettings = styled.div`
  width: 100%;
  height: 100%;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  width: 210px;
  margin: 30px 40px 10px 0;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
  z-index: 1;
  text-align: left;
`;

const SilderText = styled.div`
  width: 100%;
  height: 100px;
`;

const Paragraph = styled.p`
  max-width: 510px;
  color: ${props => props.theme.palette.text.third};
`;

const Hr = styled.div`
  height: 35px;
`;

const VSyncSelection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
  }
`;

function getMarksFOV() {
  const totalMarks = {};
  totalMarks[30] = 'Minimum';
  totalMarks[70] = 'Default';
  totalMarks[110] = 'Quake Pro';

  return totalMarks;
}

function getMarksFPS() {
  const totalMarks = {};
  totalMarks[30] = 'Minimum';
  totalMarks[90] = 'Default';
  totalMarks[260] = 'Unlimited';

  return totalMarks;
}

function getMarksRenderDistance() {
  const totalMarks = {};
  totalMarks[2] = 'Minimum';
  totalMarks[8] = 'Default';
  totalMarks[32] = 'Maximum';

  return totalMarks;
}

const VideoSetting = () => {
  const dispatch = useDispatch();

  const fov = useSelector(state => state.settings.fov);
  const fps = useSelector(state => state.settings.fps);
  const vsync = useSelector(state => state.settings.vsync);
  const renderDistance = useSelector(state => state.settings.renderDistance);

  return (
    <VideoSettings>
      <MainTitle>Video Settings</MainTitle>

      <Hr />

      <Title
        css={`
          margin-top: 0px;
        `}
      >
        V-Sync &nbsp;
      </Title>
      <VSyncSelection>
        <p
          css={`
                  width: 350px;y
                  `}
        >
          Whether v-sync (vertical synchronization) is enabled
        </p>
        <Switch
          onChange={e => {
            dispatch(updateVSync(e));
          }}
          checked={vsync}
        />
      </VSyncSelection>

      <SilderText>
        <Title
          css={`
            width: 100%;
            margin-top: 0px;
            height: 8px;
            text-align: left;
            margin-bottom: 20px;
          `}
        >
          FOV &nbsp; <FontAwesomeIcon icon={faBinoculars} />
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          Select your favorite ingame FOV
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateFOV((e - 70) / 40));
              }}
              defaultValue={70}
              min={30}
              max={110}
              step={1}
              marks={getMarksFOV()}
              value={40 * fov + 70}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={30}
              max={110}
              style={{ margin: '0 16px', width: '60px' }}
              value={40 * fov + 70}
              disabled={false}
              onChange={e => {
                dispatch(updateFOV((e - 70) / 40));
              }}
            />
          </Col>
        </Row>
      </SilderText>

      <Hr />

      <SilderText>
        <Title
          css={`
            width: 100%;
            margin-top: 0px;
            height: 8px;
            text-align: left;
            margin-bottom: 20px;
          `}
        >
          FPS &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          Select your favorite ingame FPS
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateFPS(e));
              }}
              defaultValue={90}
              min={30}
              max={260}
              step={1}
              marks={getMarksFPS()}
              value={fps}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={30}
              max={260}
              style={{ margin: '0 16px', width: '60px' }}
              value={fps}
              disabled={false}
              onChange={e => {
                dispatch(updateFPS(e));
              }}
            />
          </Col>
        </Row>
      </SilderText>

      <Hr />

      <SilderText>
        <Title
          css={`
            width: 100%;
            margin-top: 0px;
            height: 8px;
            text-align: left;
            margin-bottom: 20px;
          `}
        >
          Render distance &nbsp; <FontAwesomeIcon icon={faBinoculars} />
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          Select your favorite ingame render distance
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateRenderDistance(e));
              }}
              defaultValue={8}
              min={2}
              max={32}
              step={1}
              marks={getMarksRenderDistance()}
              value={renderDistance}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={2}
              max={32}
              style={{ margin: '0 16px', width: '60px' }}
              value={renderDistance}
              disabled={false}
              onChange={e => {
                dispatch(updateRenderDistance(e));
              }}
            />
          </Col>
        </Row>
      </SilderText>

      <Hr />
    </VideoSettings>
  );
};

export default VideoSetting;
