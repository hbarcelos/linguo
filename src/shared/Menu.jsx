import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import * as r from '~/app/routes';

export function DrawerMenu() {
  const siderRef = React.useRef(null);

  const closeOnClickOutsideMenu = React.useCallback(evt => {
    const sider = siderRef.current;
    const trigger = sider?.querySelector('.ant-layout-sider-zero-width-trigger');

    if (!sider || !trigger) {
      return;
    }

    const isCollapsed = [...sider.classList].includes('ant-layout-sider-collapsed');
    const hasClickedTrigger = evt.target.contains(trigger);

    if (trigger && !isCollapsed && !hasClickedTrigger) {
      trigger.click();
    }
  }, []);

  useOnClickOutside(siderRef, closeOnClickOutsideMenu);

  return (
    <StyledLayoutSider breakpoint="md" collapsedWidth={0} ref={siderRef}>
      <StyledDrawerMenu>{menuItems}</StyledDrawerMenu>
    </StyledLayoutSider>
  );
}

export function MainMenu() {
  return <StyledMainMenu mode="horizontal">{menuItems}</StyledMainMenu>;
}

const menuItems = [
  <Menu.Item key="request-translation">
    <NavLink to={r.REQUESTER_DASHBOARD}>Request Translations</NavLink>
  </Menu.Item>,
  <Menu.Item key="work-as-translator">
    <NavLink
      to={{
        pathname: r.TRANSLATOR_DASHBOARD,
        search: 'status=open',
      }}
    >
      Work as a Translator
    </NavLink>
  </Menu.Item>,
];

const StyledLayoutSider = styled(Layout.Sider)`
  height: 100%;
  position: fixed;
  z-index: 500;

  @media (min-width: 768px) {
    display: none;
  }

  &.ant-layout-sider {
    background-color: ${p => p.theme.hexToRgba(p.theme.color.primary.default, 0.85)};
    box-shadow: 2px 0 2px 2px ${p => p.theme.color.shadow.ui}, 6px 0 6px ${p => p.theme.color.shadow.ui};
    backdrop-filter: blur(3px);

    .ant-menu {
      background-color: transparent;
      border-right: none;
    }

    .ant-menu-item {
      background: transparent;
    }

    .ant-menu-item-selected {
      background: ${p => p.theme.color.primary.default};
    }

    .ant-layout-sider-zero-width-trigger {
      top: 12px;
      right: -36px;
      background-color: ${p => p.theme.color.primary.default};
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      box-shadow: 2px 0 2px 2px ${p => p.theme.color.shadow.ui}, 6px 0 6px ${p => p.theme.color.shadow.ui};

      :hover {
        svg {
          filter: drop-shadow(0 0 2px ${p => p.theme.color.glow.default});
        }
      }
    }

    &.ant-layout-sider-collapsed {
      position: absolute;

      .ant-layout-sider-zero-width-trigger {
        border-radius: 2px;
        right: -50px;
        background-color: ${p => p.theme.color.primary.default};
        box-shadow: none;
      }
    }
  }
`;

const menuAnchorMixin = css`
  && {
    a {
      font-size: 1rem;
      color: ${p => p.theme.color.text.inverted};
      position: relative;
      display: inline-block;

      ::after {
        content: '';
        position: absolute;
        left: 16.67%;
        right: 16.67%;
        bottom: 50%;
        height: 1px;
        opacity: 0.75;
        background-image: linear-gradient(
          90deg,
          rgba(251, 251, 251, 0) 0%,
          currentColor 33.33%,
          currentColor 66.67%,
          rgba(251, 251, 251, 0) 100%
        );
        transform: scaleX(0) translateY(1rem);
        transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
      }

      :hover {
        color: ${p => p.theme.color.text.inverted};
        text-shadow: 0 0 5px ${p => p.theme.hexToRgba(p.theme.color.text.inverted, 0.5)};
      }

      &.active {
        font-weight: ${p => p.theme.fontWeight.semibold};
        text-shadow: 2px 0 1px ${p => p.theme.color.shadow.ui};

        ::after {
          transform: scaleX(1) translateY(1rem);
        }

        @media (min-width: 768px) {
          transform: scale(1.125);
        }
      }
    }
  }
`;

const StyledDrawerMenu = styled(Menu)`
  ${menuAnchorMixin}
`;

function useOnClickOutside(ref, handler) {
  React.useEffect(
    () => {
      const listener = event => {
        // Do nothing if clicking ref's element or descendent elements

        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };

      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },

    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}

const StyledMainMenu = styled(Menu)`
  line-height: 4rem;
  text-align: center;

  ${menuAnchorMixin}

  && {
    justify-content: center;

    &.ant-menu {
      background: transparent;
      color: ${p => p.theme.color.text.inverted};
    }

    &.ant-menu-horizontal {
      border-bottom: none;
    }

    .ant-menu-item-selected {
      background-color: transparent;
    }

    .ant-menu-submenu-title {
      color: ${p => p.theme.color.text.inverted};

      :hover {
        color: ${p => p.theme.color.text.inverted};
        text-shadow: 0 0 5px ${p => p.theme.hexToRgba(p.theme.color.text.inverted, 0.25)};
      }
    }

    &.ant-menu-horizontal > .ant-menu-item {
      margin-top: 1px;
      top: 0;
      border: none;
    }
  }
`;
