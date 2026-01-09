import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Carousel } from "primereact/carousel";

const sliderItems = [
    {
        title: "Grow Your Business Digitally",
        subtitle: "Modern ERP & Software Solutions",
        image: "https://primefaces.org/cdn/primereact/images/carousel/erp1.jpg",
        gradient: "gradient-blue",
    },
    {
        title: "Secure & Scalable Systems",
        subtitle: "Built for Enterprise Growth",
        image: "https://primefaces.org/cdn/primereact/images/carousel/erp2.jpg",
        gradient: "gradient-purple",
    },
    {
        title: "AI Powered Solutions",
        subtitle: "Smarter Decisions with Technology",
        image: "https://primefaces.org/cdn/primereact/images/carousel/erp3.jpg",
        gradient: "gradient-green",
    },
];

export const Home = () => {
    const sliderTemplate = (item: any) => {
        return (
            <div
                className="home-slider"
                style={{
                    backgroundImage: `url(${item.image})`,
                }}
            >
                <div className="slider-overlay">
                    <h1>{item.title}</h1>
                    <p>{item.subtitle}</p>
                    <Button label="Get Started" icon="pi pi-arrow-right" />
                </div>
            </div>
        );
    };


    return (
        <>
            {/* ===== Carousel ===== */}
            <Carousel
                value={sliderItems}
                itemTemplate={sliderTemplate}
                numVisible={1}
                numScroll={1}
                circular
                autoplayInterval={4000}
                showIndicators
                showNavigators
            />

            {/* ===== Features ===== */}
            <div className="grid p-5">
                {[
                    { title: "Fast", icon: "pi-bolt" },
                    { title: "Secure", icon: "pi-shield" },
                    { title: "Scalable", icon: "pi-chart-line" },
                ].map((f, i) => (
                    <div key={i} className="col-12 md:col-4">
                        <Card className="text-center">
                            <i className={`pi ${f.icon} text-4xl text-primary mb-3`} />
                            <h3>{f.title}</h3>
                            <p className="text-600">
                                Enterprise-grade solutions built for growth.
                            </p>
                        </Card>
                    </div>
                ))}
            </div>
        </>
    );
};
