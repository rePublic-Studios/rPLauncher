/* eslint-disable react/no-unescaped-entities */
import React, { memo, useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import Modal from '../components/Modal';

const ChangeLogs = () => {
  const [version, setVersion] = useState(null);
  const [news, setNews] = useState(null);

  useEffect(() => {
    ipcRenderer
      .invoke('getAppVersion')
      .then(ver => {
        setVersion(ver);

        (async () => {
          const releaseData = await axios.get(
            `https://api.github.com/repos/rePublic-Studios/rPLauncher/releases/tags/v${ver}`
          );
          if (releaseData?.data)
            setNews(releaseData?.data?.body?.replaceAll('- ', '').split('\n'));
        })();

        return true;
      })
      .catch(console.error);
  }, []);

  return (
    <Modal
      css={`
        height: 500px;
        width: 650px;
        backdrop-filter: blur(16px) saturate(180%);
        background-color: rgba(17, 25, 40, 0.55);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.125);
        margin: 5px;
      `}
      title={`What's new in ${version}`}
    >
      <Container>
        <Section>
          <SectionTitle
            css={`
              color: ${props => props.theme.palette.colors.green};
            `}
          >
            <span>New Features / Fixxes</span>
          </SectionTitle>
          <div>
            <ul>
              {news?.map(text => (
                <li>{text}</li>
              ))}
            </ul>
          </div>
        </Section>
      </Container>
    </Modal>
  );
};

export default memo(ChangeLogs);

const Container = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  overflow-y: auto;
  color: ${props => props.theme.palette.text.primary};
`;

const SectionTitle = styled.h2`
  width: 100%;
  text-align: center;
  border-bottom: 1px solid;
  margin: 0px 0 20px;

`;

const Section = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    margin: 40px 0;
    border-radius: 5px;

    p {
      margin: 20px 0;
    }

    li {
      text-align: start;
    }
  }
`;
