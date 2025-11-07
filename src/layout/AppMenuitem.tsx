import { Link, useLocation } from 'react-router-dom';
import { Ripple } from 'primereact/ripple';
import { classNames } from 'primereact/utils';
import React, { useEffect, useContext, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { MenuContext } from './context/menucontext';
import { AppMenuItemProps } from './layoutprops';

const AppMenuitem = (props: AppMenuItemProps) => {
    const location = useLocation();
    const pathname = location.pathname;
    const searchParams = location.search;

    const { activeMenu, setActiveMenu } = useContext(MenuContext);
    const item = props.item;
    const key = props.parentKey ? `${props.parentKey}-${props.index}` : String(props.index);
    const isActiveRoute = item?.to && pathname === item.to;
    const active = activeMenu === key || activeMenu.startsWith(`${key}-`);

    const nodeRefValue = useRef<HTMLUListElement>(null);

    const onRouteChange = (url: string) => {
        if (item?.to && item.to === url) {
            setActiveMenu(key);
        }
    };

    useEffect(() => {
        onRouteChange(pathname);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams]);

    const itemClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (item?.disabled) {
            event.preventDefault();
            return;
        }

        if (item?.command) {
            item.command({ originalEvent: event, item });
        }

        if (item?.items) {
            setActiveMenu(active ? (props.parentKey as string) : key);
        } else {
            setActiveMenu(key);
        }
    };

    const subMenu = item?.items && item.visible !== false && (
        <CSSTransition
            timeout={{ enter: 1000, exit: 450 }}
            classNames="layout-submenu"
            in={props.root ? true : active}
            nodeRef={nodeRefValue}
            unmountOnExit
        >
            <ul ref={nodeRefValue}>
                {item.items.map((child, i) => (
                    <AppMenuitem
                        item={child}
                        index={i}
                        className={child.badgeClass}
                        parentKey={key}
                        key={child.label}
                    />
                ))}
            </ul>
        </CSSTransition>
    );

    return (
        <li className={classNames({ 'layout-root-menuitem': props.root, 'active-menuitem': active })}>
            {props.root && item?.visible !== false && (
                <div className="layout-menuitem-root-text">{item.label}</div>
            )}

            {!item?.to || item.items ? (
                <a
                    href={item.url}
                    onClick={(e) => itemClick(e)}
                    className={classNames(item.class, 'p-ripple')}
                    target={item.target}
                    tabIndex={0}
                >
                    <i className={classNames('layout-menuitem-icon', item.icon)}></i>
                    <span className="layout-menuitem-text">{item.label}</span>
                    {item.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
                    <Ripple />
                </a>
            ) : null}

            {item?.to && !item.items ? (
                <Link
                    to={item.to}
                    replace={item.replaceUrl}
                    target={item.target}
                    onClick={(e) => itemClick(e)}
                    className={classNames(item.class, 'p-ripple', { 'active-route': isActiveRoute })}
                    tabIndex={0}
                >
                    <i className={classNames('layout-menuitem-icon', item.icon)}></i>
                    <span className="layout-menuitem-text">{item.label}</span>
                    <Ripple />
                </Link>
            ) : null}

            {subMenu}
        </li>
    );
};

export default AppMenuitem;
