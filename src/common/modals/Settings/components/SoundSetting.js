import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Slider, InputNumber, Row, Col, Switch } from 'antd';
import styled from 'styled-components';
import {
  updateSoundCategoryMaster,
  updateSoundCategoryMusik,
  updateSoundCategoryJukebox,
  updateSoundCategoryWeather,
  updateSoundCategoryBlocks,
  updateSoundCategoryHostile,
  updateSoundCategoryNeutral,
  updateSoundCategoryPlayer,
  updateSoundCategoryAmbient,
  updateSoundCategoryVoice,
  updateMuteAllSounds
} from '../../../reducers/settings/actions';

const SoundSettings = styled.div`
  width: 100%;
  height: 100%;
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

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  width: 210px;
  margin: 30px 40px 10px 0;
`;

const Hr = styled.div`
  height: 35px;
`;

const MuteAllSelection = styled.div`
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

const SoundSetting = () => {
  const dispatch = useDispatch();

  const soundCategoryMaster = useSelector(
    state => state.settings.soundCategoryMaster
  );
  const soundCategoryMusik = useSelector(
    state => state.settings.soundCategoryMusik
  );
  const soundCategoryJukebox = useSelector(
    state => state.settings.soundCategoryJukebox
  );
  const soundCategoryWeather = useSelector(
    state => state.settings.soundCategoryWeather
  );
  const soundCategoryBlocks = useSelector(
    state => state.settings.soundCategoryBlocks
  );
  const soundCategoryHostile = useSelector(
    state => state.settings.soundCategoryHostile
  );
  const soundCategoryNeutral = useSelector(
    state => state.settings.soundCategoryNeutral
  );
  const soundCategoryPlayer = useSelector(
    state => state.settings.soundCategoryPlayer
  );
  const soundCategoryAmbient = useSelector(
    state => state.settings.soundCategoryAmbient
  );
  const soundCategoryVoice = useSelector(
    state => state.settings.soundCategoryVoice
  );
  const muteAllSounds = useSelector(state => state.settings.muteAllSounds);

  return (
    <SoundSettings>
      <MainTitle>Sound Settings</MainTitle>

      <Hr />

      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Mute all sounds &nbsp;
      </Title>
      <MuteAllSelection>
        <p
          css={`
                  width: 350px;y
                  `}
        >
          Mute/Unmute all sounds
        </p>
        <Switch
          onChange={e => {
            dispatch(updateMuteAllSounds(e));
          }}
          checked={muteAllSounds}
        />
      </MuteAllSelection>

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
          Master &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of all sounds
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryMaster(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryMaster * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryMaster * 100}
              onChange={e => {
                dispatch(updateSoundCategoryMaster(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Music &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of gameplay music
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryMusik(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryMusik * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryMusik * 100}
              onChange={e => {
                dispatch(updateSoundCategoryMusik(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Jukeboxes/Note Blocks &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of music/sounds from Jukeboxes and Note Blocks
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryJukebox(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryJukebox * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryJukebox * 100}
              onChange={e => {
                dispatch(updateSoundCategoryJukebox(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Weather &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of rain and thunder
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryWeather(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryWeather * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryWeather * 100}
              onChange={e => {
                dispatch(updateSoundCategoryWeather(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Blocks &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of blocks
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryBlocks(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryBlocks * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryBlocks * 100}
              onChange={e => {
                dispatch(updateSoundCategoryBlocks(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Hostile &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of hostile and neutral mobs
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryHostile(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryHostile * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryHostile * 100}
              onChange={e => {
                dispatch(updateSoundCategoryHostile(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Neutral &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of passive mobs
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryNeutral(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryNeutral * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryNeutral * 100}
              onChange={e => {
                dispatch(updateSoundCategoryNeutral(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Player &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of players
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryPlayer(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryPlayer * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryPlayer * 100}
              onChange={e => {
                dispatch(updateSoundCategoryPlayer(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Ambient &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of cave sounds and fireworks
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryAmbient(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryAmbient * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryAmbient * 100}
              onChange={e => {
                dispatch(updateSoundCategoryAmbient(e / 100.0));
              }}
              disabled={muteAllSounds}
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
          Voice &nbsp;
        </Title>
        <Paragraph
          css={`
            width: 100%;
            text-align: left;
            margin: 0;
          `}
        >
          The volume of voices
        </Paragraph>
        <Row>
          <Col span={21}>
            <Slider
              css={`
                margin: 20px 20px 20px 30px;
              `}
              onChange={e => {
                dispatch(updateSoundCategoryVoice(e / 100));
              }}
              defaultValue={100}
              min={0}
              max={100}
              step={1}
              value={soundCategoryVoice * 100}
              disabled={muteAllSounds}
            />
          </Col>
          <Col span={1}>
            <InputNumber
              min={0}
              max={100}
              style={{ margin: '0 16px', width: '60px' }}
              value={soundCategoryVoice * 100}
              onChange={e => {
                dispatch(updateSoundCategoryVoice(e / 100.0));
              }}
              disabled={muteAllSounds}
            />
          </Col>
        </Row>
      </SilderText>
    </SoundSettings>
  );
};

export default SoundSetting;
