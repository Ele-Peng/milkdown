import React from 'react';
import { Link } from 'react-router-dom';
import { isDarkModeCtx, scrolledCtx, setDisplaySidebarCtx, setIsDarkModeCtx } from '../Context';
import { useDarkMode } from '../hooks/useDarkMode';
import { useHeaderInfo } from '../hooks/useHeaderInfo';
import { Buttons } from './Buttons';
import className from './style.module.css';

const materialIcon = `${className.icon} material-icons-outlined`;

const LogoLink: React.FC = () => {
    const scrolled = React.useContext(scrolledCtx);
    return (
        <Link to="/" className={className.logo}>
            <img src="/milkdown/milkdown-mini.svg" />
            <span
                style={{
                    opacity: scrolled ? 0 : 1,
                    transition: 'opacity, color, background 0.4s ease-in-out',
                }}
            >
                Milkdown
            </span>
        </Link>
    );
};

export const Header: React.FC = () => {
    const isDarkMode = React.useContext(isDarkModeCtx);
    const setIsDarkMode = React.useContext(setIsDarkModeCtx);
    const setDisplaySidebar = React.useContext(setDisplaySidebarCtx);
    const scrolled = React.useContext(scrolledCtx);

    const onToggle = () => setDisplaySidebar((x) => !x);

    const { showToggle, fold, isHomePage } = useHeaderInfo();

    useDarkMode(isDarkMode, setIsDarkMode);

    const headerClass = [
        className.container,
        isHomePage || !scrolled ? className.homepage : '',
        fold ? className.fold : '',
    ].join(' ');

    return (
        <div id="header" className={headerClass}>
            <header className={className.header}>
                <div className={className.part}>
                    {showToggle && (
                        <span
                            className={materialIcon}
                            onClick={(e) => {
                                onToggle();
                                e.stopPropagation();
                            }}
                        >
                            menu
                        </span>
                    )}
                    <LogoLink />
                </div>
                <Buttons />
            </header>
        </div>
    );
};
