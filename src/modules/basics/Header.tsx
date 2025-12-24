import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    const redirect = (id: any) => {
        switch (id) {
            case 1:
                navigate("/");
                break;
            case 2:
                navigate("/services");
                break;
            case 3:
                navigate("/about");
                break;
            case 4:
                navigate("/contact");
                break;
            case 5:
                navigate("/team");
                break;
            case 6:
                navigate("/portfolio");
                break;
            case 7:
                navigate("/service-details");
                break;
            case 8:
                navigate("/blog-1");
                break;
            case 9:
                navigate("/blog-2");
                break;
            case 11:
                navigate("/404");
                break;
            default:
                navigate("/");
        }
    };

    return (
        <>
            {/* HEADER */}
            <header className="header header-1 transparent header-2">

                {/* MAIN HEADER */}
                <div className="main-header-wraper">
                    <div className="container">
                        <div className="flex align-items-center justify-content-between border-top-1">
                            {/* LOGO MOBILE */}
                            <div className="header-logo d-xl-none">
                                <a onClick={() => redirect(1)}>
                                    <img src="assets/img/logo/logo-2.png" alt="logo" />
                                </a>
                            </div>

                            {/* MENU */}
                            <div className="header-menu d-none d-xl-block">
                                <ul className="main-menu">
                                    <li><a onClick={() => redirect(1)}>Home</a></li>
                                    <li><a onClick={() => redirect(2)}>Our Services</a></li>

                                    <li>
                                        <a onClick={() => redirect(3)}>
                                            About <i className="fas fa-caret-down"></i>
                                        </a>
                                        <ul>
                                            <li><a onClick={() => redirect(4)}>Contact</a></li>
                                            <li><a onClick={() => redirect(5)}>Team Details</a></li>
                                            <li><a onClick={() => redirect(7)}>Service Details</a></li>
                                            <li><a onClick={() => redirect(11)}>404</a></li>
                                        </ul>
                                    </li>

                                    <li><a onClick={() => redirect(6)}>Portfolio</a></li>
                                </ul>
                            </div>

                            {/* RIGHT */}
                            <div className="header-right d-flex align-items-center">
                                <div className="header-search">
                                    <span className="fas fa-search"></span>
                                </div>

                                <div className="mobile-nav-bar d-xl-none ml-3">
                                    <i className="fal fa-bars"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
