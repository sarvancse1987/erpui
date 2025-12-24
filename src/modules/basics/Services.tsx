import React from "react";
import { useNavigate } from "react-router-dom";

const Services: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* DIGITAL AREA */}
      <section className="digital-area pt-120 pb-120">
        <div className="container">
          <div className="row">

            <div className="col-xl-3 col-lg-4 col-sm-6">
              <div className="why-choose__item">
                <div className="icon color-primary">
                  <i className="icon-consultant"></i>
                </div>

                <h5 className="title">Digital Consulting</h5>
                <p>
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur.
                </p>

                <a onClick={() => navigate("/service-details")}>
                  Read More <i className="far fa-chevron-double-right"></i>
                </a>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 col-sm-6">
              <div className="why-choose__item">
                <div className="icon color-primary">
                  <i className="icon-analysis"></i>
                </div>

                <h5 className="title">Strategy & Research</h5>
                <p>
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur.
                </p>

                <a onClick={() => navigate("/service-details")}>
                  Read More <i className="far fa-chevron-double-right"></i>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-banner__content d-flex justify-content-between">
            <h3 className="color-white">
              Small Business Grow Fast With Our Consulting Services
            </h3>

            <a
              onClick={() => navigate("/contact")}
              className="theme-btn btn-white"
            >
              Let’s Work Together{" "}
              <i className="far fa-chevron-double-right"></i>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
