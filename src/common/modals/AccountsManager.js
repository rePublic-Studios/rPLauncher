import React from 'react';
import styled from 'styled-components';
import { Spin, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import { _getAccounts, _getCurrentAccount } from '../utils/selectors';
import { openModal, closeModal } from '../reducers/modals/actions';
import {
  updateCurrentAccountId,
  loginWithAccessToken,
  updateAccount,
  removeAccount,
  loginWithOAuthAccessToken,
  loginLocalWithoutAccessToken
} from '../reducers/actions';
import { load } from '../reducers/loading/actions';
import features from '../reducers/loading/features';
import { ACCOUNT_LOCAL, ACCOUNT_MICROSOFT } from '../utils/constants';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const accounts = useSelector(_getAccounts);
  const currentAccount = useSelector(_getCurrentAccount);
  const isLoading = useSelector(state => state.loading.accountAuthentication);

  const firstLetterCaps = name => {
    const firstLetter = name.substring(0, 1).toUpperCase();
    const restLetters = name.substring(1).toLowerCase();
    return firstLetter + restLetters;
  };

  return (
    <Modal
      css={`
        height: 70%;
        width: 400px;
        max-height: 700px;

        backdrop-filter: blur(16px) saturate(180%);
        background-color: rgba(17, 25, 40, 0.55);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.125);
        margin: 5px;
      `}
      title="Account Manager"
    >
      <Container>
        <AccountsContainer>
          {accounts.map(account => {
            if (!account || !currentAccount) return;
            const isCurrentAccount =
              account.selectedProfile.id === currentAccount.selectedProfile.id;
            return (
              <AccountContainer key={account.selectedProfile.id}>
                <AccountItem
                  active={isCurrentAccount}
                  onClick={() => {
                    if (
                      isLoading.isRequesting ||
                      isCurrentAccount ||
                      (!account.accessToken &&
                        account.accountType !== ACCOUNT_LOCAL)
                    ) {
                      return;
                    }
                    const currentId = currentAccount.selectedProfile.id;
                    dispatch(
                      updateCurrentAccountId(account.selectedProfile.id)
                    );
                    dispatch(
                      load(
                        features.mcAuthentication,
                        dispatch(() => {
                          switch (account.accountType) {
                            case ACCOUNT_MICROSOFT:
                              dispatch(loginWithOAuthAccessToken(false));
                              break;
                            case ACCOUNT_LOCAL:
                              dispatch(loginLocalWithoutAccessToken(false));
                              break;
                            default:
                              dispatch(loginWithAccessToken(false));
                              break;
                          }
                        })
                      )
                    ).catch(() => {
                      dispatch(updateCurrentAccountId(currentId));
                      dispatch(
                        updateAccount(account.selectedProfile.id, {
                          ...account,
                          accessToken: null
                        })
                      );
                      message.error('Account not valid');
                    });
                    dispatch(closeModal());
                  }}
                >
                  <div>
                    {account.selectedProfile.name}
                    {account.accountType
                      ? ` (${firstLetterCaps(
                          account.accountType.replace('ACCOUNT_', '')
                        )})`
                      : ``}
                    <span
                      css={`
                        color: ${props => props.theme.palette.error.main};
                      `}
                    >
                    {!account.accessToken &&
                      account.accountType !== ACCOUNT_LOCAL &&
                      ' (EXPIRED)'}
                    </span>
                  </div>
                  {!account.accessToken &&
                    account.accountType !== ACCOUNT_LOCAL && (
                      <HoverContainer
                        onClick={() => {
                          dispatch(
                            openModal('AddAccount', {
                              username: account.user.username,
                              _accountType: account.accountType,
                              loginmessage:
                                'Your account is invalid, login again'
                            })
                          );
                        }}
                    >
                      Login again
                    </HoverContainer>
                  )}
                  {isCurrentAccount && (
                    <Spin spinning={isLoading.isRequesting} />
                  )}

                  <div
                    css={`
                      display: flex;
                      margin-right: 0;
                      margin-left: auto;
                    `}
                  >
                    {account.accessToken &&
                      isCurrentAccount &&
                      account.accountType !== ACCOUNT_LOCAL && (
                        <div
                          css={`
                            margin-left: 10px;
                            font-size: 16px;
                            cursor: pointer;
                            transition: color 0.1s ease-in-out;
                            &:hover {
                              color: #ffa726;
                            }
                          `}
                        >
                          <FontAwesomeIcon
                            onClick={async () => {
                              dispatch(
                                load(
                                  features.mcAuthentication,
                                  dispatch(() => {
                                    switch (account.accountType) {
                                      case ACCOUNT_MICROSOFT:
                                        dispatch(
                                          loginWithOAuthAccessToken(false)
                                        );
                                        break;
                                      case ACCOUNT_LOCAL:
                                        dispatch(
                                          loginLocalWithoutAccessToken(false)
                                        );
                                        break;
                                      default:
                                        dispatch(loginWithAccessToken(false));
                                        break;
                                    }
                                  })
                                )
                              ).catch(() => {
                                dispatch(
                                  updateAccount(account.selectedProfile.id, {
                                    ...account,
                                    accessToken: null
                                  })
                                );
                                message.error('Account not valid');
                              });
                            }}
                            icon={faRedo}
                          />
                        </div>
                      )}
                  </div>
                </AccountItem>
                <div
                  css={`
                    margin-left: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: color 0.1s ease-in-out;
                    &:hover {
                      color: ${props => props.theme.palette.error.main};
                    }
                  `}
                >
                  <FontAwesomeIcon
                    onClick={async () => {
                      const result = await dispatch(
                        removeAccount(account.selectedProfile.id)
                      );
                      if (!result) {
                        dispatch(closeModal());
                      }
                    }}
                    icon={faTrash}
                  />
                </div>
              </AccountContainer>
            );
          })}
        </AccountsContainer>
        <AccountContainer>
          <AccountItem
            onClick={() => dispatch(openModal('AddAccount'))}
            css={`
              background-color: #2ea44f;
              &:hover {
                background-color: #207337;
              }
            `}
          >
            Add Account
          </AccountItem>
        </AccountContainer>
      </Container>
    </Modal>
  );
};

export default ProfileSettings;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: space-between;
`;

const AccountItem = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  justify-content: space-between;
  height: 40px;
  padding: 0 10px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  ${props =>
    props.active ? `background: ${props.theme.palette.primary.main};` : ''}
  transition: background 0.1s ease-in-out;
  &:hover {
    ${props =>
      props.active ? '' : `background: ${props.theme.palette.grey[600]};`}
  }
`;

const HoverContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: 800;
  border-radius: 4px;
  transition: opacity 150ms ease-in-out;
  width: 100%;
  height: 100%;
  opacity: 0;
  backdrop-filter: blur(4px);
  will-change: opacity;
  &:hover {
    opacity: 1;
  }
`;

const AccountsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  padding-right: 2px;
`;

const AccountContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;
