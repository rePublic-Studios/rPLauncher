import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Input, Button, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../components/Modal';
import { load } from '../reducers/loading/actions';
import features from '../reducers/loading/features';
import {
  // mojangLogin,
  elyByLogin,
  loginOAuth,
  localLogin
} from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import {
  // ACCOUNT_MOJANG,
  ACCOUNT_ELYBY,
  ACCOUNT_MICROSOFT,
  ACCOUNT_LOCAL
} from '../utils/constants';

const AddAccount = ({ username, _accountType, loginmessage }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(username || '');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState(_accountType || ACCOUNT_ELYBY);
  const [loginFailed, setLoginFailed] = useState(loginmessage || '');

  // const addMojangAccount = () => {
  //   dispatch(
  //     load(
  //       features.mcAuthentication,
  //       dispatch(mojangLogin(email, password, false))
  //     )
  //   )
  //     .then(() => dispatch(closeModal()))
  //     .catch(error => {
  //       console.error(error);
  //       setLoginFailed(error);
  //     });
  // };

  const addElyByAccount = () => {
    dispatch(
      load(
        features.mcAuthentication,
        dispatch(elyByLogin(email, password, false))
      )
    )
      .then(() => dispatch(closeModal()))
      .catch(error => {
        console.error(error);
        setLoginFailed(error);
      });
  };

  const addMicrosoftAccount = () => {
    dispatch(load(features.mcAuthentication, dispatch(loginOAuth(false))))
      .then(() => dispatch(closeModal()))
      .catch(error => {
        console.error(error);
        setLoginFailed(error);
      });
  };

  const addLocalAccount = () => {
    dispatch(
      load(features.mcAuthentication, dispatch(localLogin(email, false)))
    )
      .then(() => dispatch(closeModal()))
      .catch(error => {
        console.error(error);
        setLoginFailed(error);
      });
  };

  // const renderAddMojangAccount = () => (
  //   <Container>
  //     <FormContainer>
  //       <h1>{getSelectedService()}</h1>
  //       {loginFailed && (
  //         <LoginFailMessage>
  //           {loginFailed?.message ? loginFailed.message : loginFailed}
  //         </LoginFailMessage>
  //       )}
  //       <StyledInput
  //         disabled={!!username}
  //         placeholder="Email"
  //         value={email}
  //         onChange={e => setEmail(e.target.value)}
  //       />
  //       <StyledInput
  //         type="password"
  //         placeholder="Password"
  //         value={password}
  //         onChange={e => setPassword(e.target.value)}
  //         onKeyDown={e => e.key === 'Enter' && addMojangAccount()}
  //       />
  //     </FormContainer>
  //     <FormContainer>
  //       <StyledButton onClick={addMojangAccount}>Add Account</StyledButton>
  //     </FormContainer>
  //   </Container>
  // );

  const renderAddElyByAccount = () => (
    <Container>
      <FormContainer>
        <h1>{getSelectedService()}</h1>
        {loginFailed && (
          <LoginFailMessage>
            {loginFailed?.message ? loginFailed.message : loginFailed}
          </LoginFailMessage>
        )}
        <StyledInput
          disabled={!!username}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <StyledInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addElyByAccount()}
        />
      </FormContainer>
      <FormContainer>
        <StyledButton onClick={addElyByAccount}>Add Account</StyledButton>
      </FormContainer>
    </Container>
  );

  const renderAddMicrosoftAccount = () => (
    <Container>
      <FormContainer>
        <h1
          css={`
            height: 80px;
          `}
        >
          {getSelectedService()}
        </h1>
        <FormContainer>
          <h2>External Login</h2>
          {loginFailed ? (
            <>
              <LoginFailMessage>
                {loginFailed?.message ? loginFailed.message : loginFailed}
              </LoginFailMessage>
              <StyledButton
                css={`
                  margin-top: 12px;
                `}
                onClick={addMicrosoftAccount}
              >
                Retry
              </StyledButton>
            </>
          ) : (
            <FontAwesomeIcon spin size="3x" icon={faSpinner} />
          )}
        </FormContainer>
      </FormContainer>
    </Container>
  );

  const renderAddLocalAccount = () => (
    <Container>
      <FormContainer>
        <h1>{getSelectedService()}</h1>
        {loginFailed && (
          <LoginFailMessage>
            {loginFailed?.message ? loginFailed.message : loginFailed}
          </LoginFailMessage>
        )}
        <StyledInput
          disabled={!!username}
          placeholder="Username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addLocalAccount()}
        />
      </FormContainer>
      <FormContainer>
        <StyledButton onClick={addLocalAccount}>Add Account</StyledButton>
      </FormContainer>
    </Container>
  );

  const menu = (
    <Menu
      mode="horizontal"
      selectedKeys={[accountType]}
      overflowedIndicator={null}
    >
      {/* <StyledAccountMenuItem
        key={ACCOUNT_MOJANG}
        onClick={() => {
          setAccountType(ACCOUNT_MOJANG);
          setLoginFailed(null);
        }}
      >
        Mojang Login
      </StyledAccountMenuItem> */}
      <StyledAccountMenuItem
        key={ACCOUNT_ELYBY}
        onClick={() => {
          setAccountType(ACCOUNT_ELYBY);
          setLoginFailed(null);
        }}
      >
        Ely.By Login
      </StyledAccountMenuItem>
      <StyledAccountMenuItem
        key={ACCOUNT_MICROSOFT}
        onClick={() => {
          setAccountType(ACCOUNT_MICROSOFT);
          addMicrosoftAccount();
          setLoginFailed(null);
        }}
      >
        Microsoft Login
      </StyledAccountMenuItem>
      <StyledAccountMenuItem
        key={ACCOUNT_LOCAL}
        onClick={() => {
          setAccountType(ACCOUNT_LOCAL);
          setLoginFailed(null);
        }}
      >
        Offline Login
      </StyledAccountMenuItem>
    </Menu>
  );

  const getSelectedService = () => {
    let service = '';
    switch (accountType) {
      // case ACCOUNT_MOJANG:
      //   service = 'Mojang Login';
      //   break;
      case ACCOUNT_ELYBY:
        service = 'Ely.By Login';
        break;
      case ACCOUNT_MICROSOFT:
        service = 'Microsoft Login';
        break;
      case ACCOUNT_LOCAL:
        service = 'Offline Login';
        break;
      default:
        service = 'Login';
        break;
    }

    return service;
  };
  return (
    <Modal
      css={`
        height: 450px;
        width: 420px;
        backdrop-filter: blur(16px) saturate(180%);
        background-color: rgba(17, 25, 40, 0.55);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.125);
        margin: 5px;
      `}
      title="Add Account"
    >
      <Dropdown
        overlay={menu}
        disabled={!!_accountType}
        css={`
          width: 100%;
          height: 40px;
          background-color: rgba(17, 25, 40, 0.55);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.125);
          margin: 5px;
        `}
        trigger="click"
      >
        <Button>
          {getSelectedService()} <DownOutlined />
        </Button>
      </Dropdown>
      <Container>
        {/* {accountType === ACCOUNT_MOJANG ? renderAddMojangAccount() : null} */}
        {accountType === ACCOUNT_ELYBY ? renderAddElyByAccount() : null}
        {accountType === ACCOUNT_MICROSOFT ? renderAddMicrosoftAccount() : null}
        {accountType === ACCOUNT_LOCAL ? renderAddLocalAccount() : null}
      </Container>
    </Modal>
  );
};

export default AddAccount;

const StyledButton = styled(Button)`
  width: 40%;
`;

const StyledInput = styled(Input)`
  margin-bottom: 20px !important;
  background-color: rgba(17, 25, 40, 0.55);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.125);
  margin: 5px;
`;

const LoginFailMessage = styled.div`
  color: ${props => props.theme.palette.colors.red};
`;

const StyledAccountMenuItem = styled(Menu.Item)`
  width: auto;
  height: auto;
  font-size: 18px;
`;

const FormContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: space-between;
  justify-content: center;
`;
