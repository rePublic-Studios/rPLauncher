import React, { useState, lazy } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import AsyncComponent from '../../components/AsyncComponent';
import CloseButton from '../../components/CloseButton';
import SocialButtons from '../../components/SocialButtons';
import { closeModal, openModal } from '../../reducers/modals/actions';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  text-align: center;

  .ant-slider-mark-text,
  .ant-input,
  .ant-select-selection-search-input,
  .ant-btn {
    -webkit-backface-visibility: hidden;
  }
`;
const SideMenu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: ${props => props.theme.palette.grey[800]};
  padding-top: calc(${props => props.theme.sizes.height.systemNavbar} + 5px);

  backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(17, 25, 40, 0.55);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.125);
  margin: 5px;
`;

const SettingsContainer = styled.div`
  flex: 1;
  flex-grow: 3;
`;

const SettingsColumn = styled.div`
  margin-left: 50px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;

// eslint-disable-next-line react/jsx-props-no-spreading
const SettingsButton = styled(({ active, ...props }) => <Button {...props} />)`
  align-items: left;
  justify-content: left;
  text-align: left;
  width: 200px;
  height: 30px;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  white-space: nowrap;
  background: ${props =>
    props.active
      ? props.theme.palette.grey[600]
      : props.theme.palette.grey[800]};
  border: 0px;
  text-align: left;
  animation-duration: 0s;
  color: ${props => props.theme.palette.text.primary};
  &:hover {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[700]};
  }
  &:focus {
    color: ${props => props.theme.palette.text.primary};
    background: ${props => props.theme.palette.grey[600]};
  }

  backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(17, 25, 40, 0.35);
  border-radius: 12px;
  margin: 5px;
`;

const SettingsTitle = styled.div`
  margin-top: 15px;
  align-items: left;
  justify-content: left;
  text-align: left;
  width: 200px;
  height: 30px;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  font-weight: 300;
  white-space: nowrap;
  color: ${props => props.theme.palette.grey[50]};
`;

const pages = {
  General: {
    name: 'General',
    component: AsyncComponent(lazy(() => import('./components/General')))
  },
  Java: {
    name: 'Java',
    component: AsyncComponent(lazy(() => import('./components/Java')))
  },
  GameSetting: {
    name: 'GameSetting',
    component: AsyncComponent(lazy(() => import('./components/GameSetting')))
  },
  VideoSetting: {
    name: 'VideoSetting',
    component: AsyncComponent(lazy(() => import('./components/VideoSetting')))
  },
  SoundSetting: {
    name: 'SoundSetting',
    component: AsyncComponent(lazy(() => import('./components/SoundSetting')))
  }
};

export default function Settings() {
  const [page, setPage] = useState('General');
  const dispatch = useDispatch();
  const ContentComponent = pages[page].component;

  return (
    <Modal
      css={`
        backdrop-filter: blur(16px) saturate(180%);
        height: 100%;
        width: 98%;
        background-color: rgba(0, 0, 0, 0.15);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.125);
      `}
      header="false"
    >
      <Container>
        <CloseButton
          css={`
            position: absolute;
            top: 30px;
            right: 30px;
          `}
          onClick={() => dispatch(closeModal())}
        />
        <SideMenu>
          <SettingsTitle>General</SettingsTitle>
          {Object.values(pages).map(val => (
            <SettingsButton
              key={val.name}
              active={page === val.name}
              onClick={() => setPage(val.name)}
            >
              {val.name}
            </SettingsButton>
          ))}
          {/* <SettingsButton onClick={() => setPage("User Interface")}>
            User Interface
          </SettingsButton>
          <SettingsTitle>Game Settings</SettingsTitle>
          <SettingsButton>Graphic Settings</SettingsButton>
          <SettingsButton>Sound Settings</SettingsButton> */}
          <div
            css={`
              align-items: left;
              justify-content: left;
              text-align: left;
              width: 200px;
              position: absolute;
              bottom: 0;
              margin-bottom: 30px;
            `}
          >
            <span
              css={`
                font-weight: bold;
                font-size: 16px;
              `}
            >
              Support rPLauncher
            </span>
            <div
              css={`
                margin-top: 20px;
              `}
            >
              <SocialButtons />
            </div>
            <div
              css={`
                margin-top: 20px;
                display: flex;
                font-size: 10px;
                flex-direction: column;
                span {
                  text-decoration: underline;
                  cursor: pointer;
                }
              `}
            >
              <span
                onClick={() =>
                  dispatch(openModal('PolicyModal', { policy: 'privacy' }))
                }
              >
                Privacy Policy
              </span>
              <span
                onClick={() =>
                  dispatch(openModal('PolicyModal', { policy: 'tos' }))
                }
              >
                Terms and Conditions
              </span>
              <span
                onClick={() =>
                  dispatch(
                    openModal('PolicyModal', { policy: 'acceptableuse' })
                  )
                }
              >
                Acceptable Use Policy
              </span>
            </div>
          </div>
        </SideMenu>
        <SettingsContainer>
          <SettingsColumn>
            <div
              css={`
                max-width: 88%;
                overflow-y: hidden;
                overflow-x: hidden;
                padding-bottom: 20px;
              `}
            >
              <ContentComponent />
            </div>
          </SettingsColumn>
        </SettingsContainer>
      </Container>
    </Modal>
  );
}
