import React, { useState, lazy } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import path from 'path';
import Modal from '../../components/Modal';
import AsyncComponent from '../../components/AsyncComponent';
import CloseButton from '../../components/CloseButton';
import SocialButtons from '../../components/SocialButtons';
import { closeModal, openModal } from '../../reducers/modals/actions';
import { _getInstances, _getInstancesPath } from '../../utils/selectors';
import { addGlobalSettings } from '../../../app/desktop/utils';

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

// eslint-disable-next-line react/jsx-props-no-spreading
const SaveButton = styled(({ ...props }) => <Button {...props} />)`
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 200px;
  height: 30px;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  white-space: nowrap;
  background: ${props => props.theme.palette.primary.main};
  border: 0px;
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

const pagesGeneral = {
  General: { name: 'General' },
  Java: { name: 'Java' }
};

const pagesInstanceSetting = {
  GameSetting: { name: 'Game Settings' },
  VideoSetting: { name: 'Video Settings' },
  SoundSetting: { name: 'Sound Settings' }
};

const pages = {
  General: {
    component: AsyncComponent(lazy(() => import('./components/General')))
  },
  Java: {
    component: AsyncComponent(lazy(() => import('./components/Java')))
  },
  GameSetting: {
    component: AsyncComponent(lazy(() => import('./components/GameSetting')))
  },
  VideoSetting: {
    component: AsyncComponent(lazy(() => import('./components/VideoSetting')))
  },
  SoundSetting: {
    component: AsyncComponent(lazy(() => import('./components/SoundSetting')))
  }
};

export default function Settings() {
  const [page, setPage] = useState('General');
  const dispatch = useDispatch();
  const ContentComponent = pages[page].component;

  const instances = useSelector(_getInstances);
  const saveAllInstanceOptions = async () => {
    for (const instance of instances) {
      await useSelector(state =>
        addGlobalSettings(
          path.join(_getInstancesPath(state), instance.name),
          state.settings
        )
      );
    }
  };

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
          {Object.entries(pagesGeneral).map(([name, val]) => (
            <SettingsButton
              key={name}
              active={page === name}
              onClick={() => setPage(name)}
            >
              {val.name}
            </SettingsButton>
          ))}
          <SettingsTitle>Instance Settings</SettingsTitle>
          {Object.entries(pagesInstanceSetting).map(([name, val]) => (
            <SettingsButton
              key={name}
              active={page === name}
              onClick={() => setPage(name)}
            >
              {val.name}
            </SettingsButton>
          ))}
          <SaveButton
            key="Save to All"
            onClick={() => saveAllInstanceOptions()}
          >
            Save for all instances
          </SaveButton>
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
