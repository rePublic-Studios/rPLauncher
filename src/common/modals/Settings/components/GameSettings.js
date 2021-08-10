import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Switch, Slider, Row, Col, InputNumber } from 'antd';
import {
  faExpand,
  faAngleUp,
  faDigitalTachograph
} from '@fortawesome/free-solid-svg-icons';
import {
  updateFullscreen,
  updateGUIScale,
  updateAutoJump
} from '../../../reducers/settings/actions';

const GameSettings = styled.div`
  width: 100%;
  height: 100%;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  width: 210px;
  margin: 30px 40px 10px 0;
`;

const SilderText = styled.div`
  width: 100%;
  height: 100px;
`;

const Paragraph = styled.p`
  max-width: 510px;
  color: ${props => props.theme.palette.text.third};
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
  z-index: 1;
  text-align: left;
`;

const FullscreenSelection = styled.div`
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

const Hr = styled.div`
  height: 35px;
`;

function getMarksGUIScale() {
  const totalMarks = {};
  totalMarks[0] = 'Auto';
  totalMarks[4] = 'Maximum';

  return totalMarks;
}

const GameSetting = () => {
  const dispatch = useDispatch();

  const fullScreen = useSelector(state => state.settings.fullscreen);
  const autoJump = useSelector(state => state.settings.autoJump);
  const guiScale = useSelector(state => state.settings.guiScale);

  return (
    <GameSettings>
      <MainTitle>Game Settings</MainTitle>

      <Hr />

      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Fullscreen &nbsp; <FontAwesomeIcon icon={faExpand} />
      </Title>
      <FullscreenSelection>
        <p
          css={`
                  width: 350px;y
                  `}
        >
          Enable / Disable fullscreen ingame
        </p>
        <Switch
          onChange={e => {
            dispatch(updateFullscreen(e));
          }}
          checked={fullScreen}
        />
      </FullscreenSelection>

      <Hr />

      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Auto Jump &nbsp; <FontAwesomeIcon icon={faAngleUp} />
      </Title>
      <FullscreenSelection>
        <p
          css={`
                  width: 350px;y
                  `}
        >
          Enable / Disable auto jump ingame
        </p>
        <Switch
          onChange={e => {
            dispatch(updateAutoJump(e));
          }}
          checked={autoJump}
        />
      </FullscreenSelection>

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
          GUI Scale &nbsp; <FontAwesomeIcon icon={faDigitalTachograph} />
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          Select your favorite ingame GUI Scale
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateGUIScale(e));
              }}
              defaultValue={0}
              min={0}
              max={4}
              step={1}
              marks={getMarksGUIScale()}
              value={guiScale}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={4}
              style={{ margin: '0 16px', width: '60px' }}
              value={guiScale}
              disabled={false}
              onChange={e => {
                dispatch(updateGUIScale(e));
              }}
            />
          </Col>
        </Row>
      </SilderText>
    </GameSettings>
  );
};

export default GameSetting;
