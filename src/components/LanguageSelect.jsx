import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Select } from 'antd';
import getLanguageFlag from '~/components/helpers/getLanguageFlag';

const StyledBaseSelect = styled(Select)`
  &&& {
    height: 5.75rem;
    color: ${props => props.theme.text.inverted};

    &.ant-select-single.ant-select-open .ant-select-selection-item {
      opacity: 0.75;
    }

    .ant-select-arrow {
      color: ${props => props.theme.text.inverted};
      right: 2rem;
      margin-top: -0.825rem;
      width: 1.5rem;
      height: 1.5rem;

      .anticon,
      .anticon svg {
        width: 100%;
        height: 100%;
      }
    }

    .ant-select-selector {
      height: 100%;
      padding: 0 2rem;
      border-radius: 0.75rem;
      border-width: 0.3125rem !important;
      border-color: ${props => props.theme.border.default};

      .ant-select-selection-search-input {
        height: 100%;
        padding: 0 1rem 0 1rem;
        font-size: ${props => props.theme.fontSize.xxl};
        font-weight: 400;
      }

      .ant-select-selection-placeholder,
      .ant-select-selection-item {
        display: flex;
        align-items: center;
        font-size: ${props => props.theme.fontSize.xxl};
        font-weight: 400;
        color: ${props => props.theme.text.inverted};
      }

      .ant-select-selection-placeholder {
        opacity: 0.75;
      }
    }
  }
`;

const StyledLanguageSelect = styled(StyledBaseSelect)`
  &&& {
    .ant-select-selector {
      background: linear-gradient(
        118.61deg,
        ${props => props.theme.primary.default} 42.83%,
        ${props => props.theme.primary.dark} 89.23%
      );

      .ant-select-selection-item {
        .flag {
          flex: 1.5rem 0 0;
        }

        .text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .ant-select-item-option-content {
      display: flex;
      align-items: center;
    }
  }
`;

const StyledLevelSelect = styled(StyledBaseSelect)`
  &&& {
    .ant-select-selector {
      background: linear-gradient(
        118.61deg,
        ${props => props.theme.secondary.default} 42.83%,
        ${props => props.theme.secondary.light} 89.23%
      );
    }
  }
`;

const StyledLanguageDropdown = styled.div`
  .ant-select-item-option-content {
    display: flex;
    align-items: center;
  }
`;

const StyledFlagContainer = styled.span`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 1rem;

  svg {
    display: block;
    width: 100%;
  }
`;

const makeDropdownRender = dropdownRender => menu => (
  <StyledLanguageDropdown>{dropdownRender(menu)}</StyledLanguageDropdown>
);

function LanguageSelect({ dropdownRender, options, ...props }) {
  const wrappedDropdownRender = React.useMemo(() => makeDropdownRender(dropdownRender), [dropdownRender]);

  return (
    <StyledLanguageSelect {...props} optionFilterProp="description" dropdownRender={wrappedDropdownRender}>
      {options.map(({ code, name }) => {
        const Flag = getLanguageFlag(code);
        return (
          <Select.Option key={code} value={code} description={name}>
            <StyledFlagContainer className="flag">
              <Flag />
            </StyledFlagContainer>
            <span className="text">{name}</span>
          </Select.Option>
        );
      })}
    </StyledLanguageSelect>
  );
}

LanguageSelect.propTypes = {
  dropdownRender: t.func,
  options: t.arrayOf(
    t.shape({
      code: t.string.isRequired,
      name: t.string.isRequired,
    })
  ),
};

LanguageSelect.defaultProps = {
  dropdownRender: menu => menu,
  options: [],
};

export { LanguageSelect };

function LevelSelect({ options, ...props }) {
  return (
    <StyledLevelSelect {...props}>
      {options.map(({ code, name }) => (
        <Select.Option key={code} value={code} description={name}>
          {name}
        </Select.Option>
      ))}
    </StyledLevelSelect>
  );
}

LevelSelect.propTypes = {
  options: t.arrayOf(
    t.shape({
      code: t.string.isRequired,
      name: t.string.isRequired,
    })
  ),
};

LevelSelect.defaultProps = {
  options: [],
};

export { LevelSelect };
