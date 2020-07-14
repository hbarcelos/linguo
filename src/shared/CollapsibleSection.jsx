import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import clsx from 'clsx';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

export default function CollapsibleSection({ title, titleLevel, children, tabIndex }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleToggleOpen = React.useCallback(() => {
    setIsOpen(open => !open);
  }, []);

  const icon = isOpen ? <MinusOutlined /> : <PlusOutlined />;

  return (
    <StyledDetails>
      <StyledSummary tabIndex={tabIndex} onClick={handleToggleOpen} className={clsx({ open: isOpen, closed: !isOpen })}>
        <Typography.Title level={titleLevel}>{title}</Typography.Title>
        {icon}
      </StyledSummary>
      <StyledCollapsibleContent>{children}</StyledCollapsibleContent>
    </StyledDetails>
  );
}

CollapsibleSection.propTypes = {
  title: t.node.isRequired,
  titleLevel: t.oneOf([1, 2, 3, 4]).isRequired,
  children: t.node,
  tabIndex: t.number,
};

CollapsibleSection.defaultProps = {
  children: null,
  tabIndex: 10,
};

const StyledDetails = styled.details`
  border-radius: 0.1875rem;
`;

const StyledSummary = styled.summary`
  background-color: ${p => p.theme.color.primary.default};
  height: 3rem;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${p => p.theme.color.text.inverted};
  cursor: pointer;

  &.open {
    border-top-left-radius: 0.1875rem;
    border-top-right-radius: 0.1875rem;
  }

  &.closed {
    border-radius: 0.1875rem;
  }

  .ant-typography {
    color: inherit;
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: 500;
    margin: 0;
    padding: 0;
  }

  ::marker {
    content: '';
    display: none;
  }
`;

const StyledCollapsibleContent = styled.section`
  position: relative;
`;