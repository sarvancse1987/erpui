import React from "react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="footer-1 footer-2 overflow-hidden"
      style={{
        backgroundImage: "url(assets/img/footer/footer-bg-2.png)",
      }}
    >
      {/* CTA */}
      <div className="footer-top__cta mb-80 mb-lg-60 mb-sm-50 mb-xs-40">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="footer-top__cta-content-wrapper pb-45">
                <div className="footer-top__cta-content text-center mx-auto">
                  <h2 className="title color-white mb-20 mb-sm-10 mb-xs-5">
                    Feel Free To Contact Us
                  </h2>

                  <div className="description color-white font-la mb-40 mb-md-30 mb-sm-25 mb-xs-20 fw-500 mx-auto">
                    <p>
                      Contrary to popular belief, Lorem Ipsum is not simply
                      random text. It has roots in a piece of classical Latin
                      literature from 45 BC.
                    </p>
                  </div>

                  <a
                    onClick={() => navigate("/contact")}
                    className="theme-btn btn-sm btn-yellow"
                  >
                    Contact Us <i className="fab fa-telegram-plane"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP */}
      <div className="footer-top mb-xs-25 mb-sm-30 mb-md-35 mb-lg-40 mb-50 overflow-hidden">
        <div className="container">
          <div className="row">
            {/* LOGO */}
            <div className="col-lg-6">
              <div className="single-footer-wid site_info_box">
                <a
                  onClick={() => navigate("/")}
                  className="d-block mb-20"
                >
                  <img
                    src="assets/img/logo/footer-logo-2.png"
                    alt="Footer Logo"
                  />
                </a>

                <div className="description font-la color-white">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore.
                  </p>
                </div>
              </div>
            </div>

            {/* NEWSLETTER */}
            <div className="col-lg-6">
              <div className="single-footer-wid newsletter_widget">
                <h6 className="title d-flex align-items-center color-white mb-30">
                  <img
                    src="assets/img/icon/notification-2.svg"
                    alt=""
                  />
                  keep up to date - get updates with latest topics.
                </h6>

                <div className="newsletter_box">
                  <form>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      required
                    />
                    <button
                      className="theme-btn btn-yellow"
                      type="submit"
                    >
                      Subscribe Now{" "}
                      <i className="fab fa-telegram-plane"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="container">
        <div className="row justify-content-between">
          {/* WORKING TIME */}
          <div className="col-md-6 col-xl-3">
            <div className="single-footer-wid contact_widget">
              <h4 className="wid-title mb-30 color-white">
                Working Time
              </h4>

              <div className="contact-wrapper pt-30 pr-30 pb-30 pl-30">
                <ul>
                  <li>
                    <i className="far fa-clock"></i>
                    <span>Mon - Sat / 08am : 12pm</span>
                  </li>
                  <li>
                    <i className="far fa-clock"></i>
                    <span>Sunday Close</span>
                  </li>
                </ul>

                <div className="social-profile">
                  <ul>
                    <li><a><i className="fab fa-facebook-f"></i></a></li>
                    <li><a><i className="fab fa-twitter"></i></a></li>
                    <li><a><i className="fab fa-instagram"></i></a></li>
                    <li><a><i className="fab fa-linkedin-in"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="col-md-6 col-xl-2">
            <div className="single-footer-wid pl-xl-10 pl-50">
              <h4 className="wid-title mb-30 color-white">
                Quick Link
              </h4>

              <ul>
                <li><a onClick={() => navigate("/about")}>About Company</a></li>
                <li><a onClick={() => navigate("/service")}>Our Services</a></li>
                <li><a onClick={() => navigate("/team-details")}>Meet Our Team</a></li>
                <li><a onClick={() => navigate("/contact")}>Support</a></li>
              </ul>
            </div>
          </div>

          {/* RECENT POSTS */}
          <div className="col-md-6 col-xl-4">
            <div className="single-footer-wid recent_post_widget pl-xl-10 pl-65 pr-50 pr-xl-30">
              <h4 className="wid-title mb-30 color-white">
                Recent Post
              </h4>

              <a
                onClick={() => navigate("/contact")}
                className="single-recent-post d-flex align-items-center mb-20"
              >
                <img
                  src="assets/img/footer/resent-post-1.jpg"
                  alt=""
                />
                <div>
                  <h5>Why Purpose-Driven Employers Succeed</h5>
                  <span>January 11, 2018</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom overflow-hidden">
        <div className="container">
          <div className="footer-bottom-content d-flex justify-content-between align-items-center">
            <div className="coppyright">
              © 2022 <a onClick={() => navigate("/")}>Consulter</a>
            </div>

            <ul className="footer-bottom-list">
              <li><a>Terms & Conditions</a></li>
              <li><a>Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
