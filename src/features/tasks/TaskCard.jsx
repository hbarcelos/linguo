import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Badge, Tooltip, Typography } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import * as r from '~/app/routes';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import Card from '~/shared/Card';
import FormattedNumber from '~/shared/FormattedNumber';
import useInterval from '~/shared/useInterval';
import Spacer from '~/shared/Spacer';
import { Task, TaskStatus } from '~/features/tasks';
import EthFiatValue from '~/features/tokens/EthFiatValue';
import KlerosLogoOutlined from '~/assets/images/logo-kleros-outlined.svg';
import TaskCardFooter from './TaskCardFooter';
import TaskInfoGrid from './TaskInfoGrid';
import TaskLanguages from './TaskLanguages';
import TaskPrice from './TaskPrice';
import { selectById } from './tasksSlice';

const getTaskDetailsRoute = r.withParamSubtitution(r.TRANSLATION_TASK_DETAILS);

const _1_MINUTE_MS = 60 * 1000;

export default function TaskCard({ id, footerProps }) {
  const task = useShallowEqualSelector(selectById(id));
  const { status, title, assignedPrice, sourceLanguage, targetLanguage, wordCount, expectedQuality } = task;

  const getCurrentPrice = React.useCallback(() => Task.currentPrice(task), [task]);
  const [currentPrice, setCurrentPrice] = React.useState(getCurrentPrice);

  const updateCurrentPrice = React.useCallback(() => {
    setCurrentPrice(getCurrentPrice());
  }, [getCurrentPrice, setCurrentPrice]);

  const interval = assignedPrice === undefined ? _1_MINUTE_MS : null;
  useInterval(updateCurrentPrice, interval);

  const actualPrice = assignedPrice ?? currentPrice;

  const pricePerWord = Task.currentPricePerWord({
    currentPrice: actualPrice,
    wordCount,
  });

  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};

  const taskInfo = [
    {
      title: 'Price per Word',
      content: <TaskPrice showTooltip value={pricePerWord} />,
      footer: <EthFiatValue amount={pricePerWord} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Word Count',
      content: <FormattedNumber value={wordCount} />,
    },
    {
      title: 'Total Price',
      content: (
        <TaskPrice
          showTooltip
          showFootnoteMark={status === TaskStatus.Created && !Task.isIncomplete(task)}
          value={currentPrice}
        />
      ),
      footer: <EthFiatValue amount={currentPrice} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Quality Tier',
      content: name,
      footer: `(${requiredLevel === 'C2' ? 'C2' : requiredLevel + '+'})`,
    },
  ];

  const cardProps = Task.isIncomplete(task) ? taskStatusToProps.incomplete : taskStatusToProps[status];

  const url = getTaskDetailsRoute({ id });
  return (
    <StyledTaskCard
      $colorKey={cardProps.colorKey}
      title={cardProps.title}
      titleLevel={2}
      footer={<TaskCardFooter id={id} {...footerProps} />}
    >
      <MainLink href={url}>See More</MainLink>
      <TaskLanguages fullWidth source={sourceLanguage} target={targetLanguage} />
      <Spacer />
      <Tooltip title={title} placement="top" mouseEnterDelay={0.5} arrowPointAtCenter>
        {/* The wrapping div fixes an issue with styled compnents not
            properly performing ref forwarding for function components. */}
        <div
          css={`
            cursor: help;
            position: relative;
            z-index: 2;
          `}
        >
          <StyledTaskTitle level={3}>{title}</StyledTaskTitle>
        </div>
      </Tooltip>
      <TaskInfoGrid size="small" data={taskInfo} />
    </StyledTaskCard>
  );
}

TaskCard.propTypes = {
  id: t.string.isRequired,
  footerProps: t.object,
};

TaskCard.defaultProps = {
  footerProps: {},
};

const taskStatusToProps = {
  [TaskStatus.Created]: {
    title: <Badge status="default" text="Open Task" />,
    colorKey: 'open',
  },
  [TaskStatus.Assigned]: {
    title: <Badge status="default" text="In Progress" />,
    colorKey: 'inProgress',
  },
  [TaskStatus.AwaitingReview]: {
    title: <Badge status="default" text="In Review" />,
    colorKey: 'inReview',
  },
  [TaskStatus.DisputeCreated]: {
    title: (
      <>
        <Badge status="default" text="In Dispute" />
        <KlerosLogoOutlined
          css={`
            width: 1.5rem;
          `}
        />
      </>
    ),
    colorKey: 'inDispute',
  },
  [TaskStatus.Resolved]: {
    title: <Badge status="default" text="Finished" />,
    colorKey: 'finished',
  },
  incomplete: {
    title: <Badge status="default" text="Incomplete" />,
    colorKey: 'incomplete',
  },
};

const MainLink = styled.a`
  display: block;
  text-indent: -9999px;
  height: 0;

  ::after {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
`;

const StyledTaskCard = styled(Card)`
  && {
    overflow: hidden;
    position: relative;
    height: 100%;
    border-radius: 3px;
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    z-index: 1;

    @media (hover: hover) and (min-width: 576px) {
      :active,
      :hover {
        transform: scale(1.025);
        z-index: 2;
        box-shadow: 0 4px 6px 2px ${props => props.theme.color.shadow.default};
      }
    }

    @media (hover: none) {
      ::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 10;
        pointer-events: none;
        background: radial-gradient(
            circle,
            ${p => p.theme.hexToRgba(p.theme.color.secondary.default, 0.25)} 1%,
            transparent 1%
          )
          center/25000% no-repeat;
        transform: scale(2, 2);
        opacity: 0;
        transition: all 0.5s;
      }

      :active {
        ::after {
          background-size: 0%;
          transform: scale(0, 0);
          opacity: 1;
          transition: none;
        }
      }
    }

    // Interactive elements
    a:not(${MainLink}),
    details,
    button {
      position: relative;
      z-index: 2;
    }

    .card-header {
      background-color: ${p => p.theme.hexToRgba(p.theme.color.status[p.$colorKey], '0.06')};
      color: ${p => p.theme.color.status[p.$colorKey]};
      border: none;
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
      border-top: 5px solid;
      padding-top: calc(1rem - 2.5px);
    }

    @media (max-width: 575.98px) {
      border-radius: 0;

      .card-header {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
    }

    .ant-badge-status-dot {
      background-color: ${p => p.theme.color.status[p.$colorKey]};
    }

    .ant-badge-status-text,
    .card-header-title {
      font-size: ${p => p.theme.fontSize.md};
      font-weight: ${p => p.theme.fontWeight.regular};
      color: inherit;
      text-align: left;
    }

    .card-header-title {
      display: flex;
      justify-content: space-between;
      align-items: center;

      svg {
        fill: currentColor;
      }
    }
  }
`;

const StyledTaskTitle = styled(Typography.Title)`
  && {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => props.theme.color.text.lighter};
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${p => p.theme.fontWeight.regular};
    margin-bottom: 1rem;
  }
`;
