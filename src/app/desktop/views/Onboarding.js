import React, { useRef, useState, memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLongArrowAltRight,
  faLongArrowAltUp,
  faLongArrowAltDown
} from '@fortawesome/free-solid-svg-icons';
import { _getCurrentAccount } from '../../../common/utils/selectors';

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.palette.colors.darkBlue};
  overflow: hidden;
`;

const scrollToRef = ref =>
  ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

const Home = () => {
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [initScrolled, setInitScrolled] = useState(false);
  const account = useSelector(_getCurrentAccount);

  const firstSlideRef = useRef(null);
  const secondSlideRef = useRef(null);
  const thirdSlideRef = useRef(null);
  const executeScroll = type => {
    if (currentSlide + type < 0 || currentSlide + type > 3) return;
    setCurrentSlide(currentSlide + type);
    switch (currentSlide + type) {
      case 0:
        scrollToRef(firstSlideRef);
        break;
      case 1:
        scrollToRef(secondSlideRef);
        break;
      case 2:
        scrollToRef(thirdSlideRef);
        break;
      default:
        scrollToRef(firstSlideRef);
        break;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setInitScrolled(true);
      executeScroll(1);
    }, 4800);
  }, []);

  return (
    <Background>
      <div
        ref={firstSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[800]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(17, 25, 40, 0.15);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.125);
          margin: 5px;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 700;
            text-align: center;
            padding: 0 120px;
          `}
        >
          {account.selectedProfile.name}, welcome to rPLauncher!
        </div>
      </div>
      <div
        ref={secondSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[700]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(17, 25, 40, 0.15);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.125);
          margin: 5px;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 600;
            text-align: center;
            margin: 20% 10%;
          `}
        >
          rPLauncher is completely free and open source.
        </div>
      </div>
      <div
        ref={thirdSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[700]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(16px) saturate(180%);
          background-color: rgba(17, 25, 40, 0.15);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.125);
          margin: 5px;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 600;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            margin: 20%;
          `}
        >
          Also, don&apos;t forget to join us on Discord! This is where our
          community is!
          <iframe
            css={`
              margin-top: 40px;
            `}
            src="https://discordapp.com/widget?id=864825977488801792&theme=dark"
            width="350"
            height="410"
            allowTransparency="true"
            frameBorder="0"
            title="discordFrame"
          />
        </div>
      </div>
      {currentSlide !== 0 && currentSlide !== 1 && initScrolled && (
        <div
          css={`
            position: fixed;
            right: 20px;
            top: 40px;
            transition: 0.1s ease-in-out;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            font-size: 40px;
            cursor: pointer;
            width: 70px;
            height: 40px;
            color: ${props => props.theme.palette.text.icon};
            &:hover {
              background: ${props => props.theme.action.hover};
            }
          `}
          onClick={() => executeScroll(-1)}
        >
          <FontAwesomeIcon icon={faLongArrowAltUp} />
        </div>
      )}
      {currentSlide !== 0 && initScrolled && (
        <div
          css={`
            position: fixed;
            right: 20px;
            bottom: 20px;
            transition: 0.1s ease-in-out;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            font-size: 40px;
            cursor: pointer;
            width: 70px;
            height: 40px;
            color: ${props => props.theme.palette.text.icon};
            &:hover {
              background: ${props => props.theme.action.hover};
            }
          `}
          onClick={() => {
            if (currentSlide === 2) {
              dispatch(push('/home'));
            } else {
              executeScroll(1);
            }
          }}
        >
          <FontAwesomeIcon
            icon={currentSlide === 2 ? faLongArrowAltRight : faLongArrowAltDown}
          />
        </div>
      )}
    </Background>
  );
};

export default memo(Home);
