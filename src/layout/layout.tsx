/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import {
    useEventListener,
    useUnmountEffect,
} from 'primereact/hooks';
import React, { useContext, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import AppConfig from './AppConfig';
import { LayoutContext } from './context/layoutcontext';
import { PrimeReactContext } from 'primereact/api';
import { useLocation, Outlet } from 'react-router-dom'; 
import { AppTopbarRef } from './layoutprops';


const Layout: React.FC = () => {
    const { layoutConfig, layoutState, setLayoutState } = useContext(LayoutContext);
    const { setRipple } = useContext(PrimeReactContext);

    const topbarRef = useRef<AppTopbarRef>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event: MouseEvent) => {
            const target = event.target as Node;

            const isOutsideClicked = !(
                sidebarRef.current?.isSameNode(target) ||
                sidebarRef.current?.contains(target) ||
                topbarRef.current?.menubutton?.isSameNode(target) ||
                topbarRef.current?.menubutton?.contains(target)
            );

            if (isOutsideClicked) {
                hideMenu();
            }
        }
    });

    const [bindProfileMenuOutsideClickListener, unbindProfileMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event: MouseEvent) => {
            const target = event.target as Node;

            const isOutsideClicked = !(
                topbarRef.current?.topbarmenu?.isSameNode(target) ||
                topbarRef.current?.topbarmenu?.contains(target) ||
                topbarRef.current?.topbarmenubutton?.isSameNode(target) ||
                topbarRef.current?.topbarmenubutton?.contains(target)
            );

            if (isOutsideClicked) {
                hideProfileMenu();
            }
        }
    });

    const location = useLocation();
    const pathname = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    useEffect(() => {
        hideMenu();
        hideProfileMenu();
    }, [pathname, searchParams.toString()]);

    const hideMenu = () => {
        setLayoutState((prev) => ({
            ...prev,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));
        unbindMenuOutsideClickListener();
        unblockBodyScroll();
    };

    const hideProfileMenu = () => {
        setLayoutState((prev) => ({
            ...prev,
            profileSidebarVisible: false
        }));
        unbindProfileMenuOutsideClickListener();
    };

    const blockBodyScroll = (): void => {
        document.body.classList.add('blocked-scroll');
    };

    const unblockBodyScroll = (): void => {
        document.body.classList.remove('blocked-scroll');
    };

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
            bindMenuOutsideClickListener();
        }

        if (layoutState.staticMenuMobileActive) {
            blockBodyScroll();
        }
    }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

    useEffect(() => {
        if (layoutState.profileSidebarVisible) {
            bindProfileMenuOutsideClickListener();
        }
    }, [layoutState.profileSidebarVisible]);

    useUnmountEffect(() => {
        unbindMenuOutsideClickListener();
        unbindProfileMenuOutsideClickListener();
    });

    const containerClass = classNames('layout-wrapper', {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'p-input-filled': layoutConfig.inputStyle === 'filled',
        'p-ripple-disabled': !layoutConfig.ripple
    });
    return (
        <div className={containerClass}>
            <AppTopbar ref={topbarRef} />
            <div ref={sidebarRef} className="layout-sidebar">
                <AppSidebar />
            </div>
            <div className="layout-main-container">
                <div className="layout-main">
                    <Outlet /> 
                </div>
                {/* <AppFooter /> */}
            </div>
            <AppConfig />
            <div className="layout-mask"></div>
        </div>
    );
};

export default Layout;
