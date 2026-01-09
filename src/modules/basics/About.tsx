import { Card } from "primereact/card";
import { PageContainer } from "./PageContainer";
import csharpImg from "../../asset/img/tech/csharp.png";
import dotnetImg from "../../asset/img/tech/dotnet.png";
import reactImg from "../../asset/img/tech/react.png";
import angularImg from "../../asset/img/tech/angular.png";
import dockerImg from "../../asset/img/tech/docker.png";
import kubernetesImg from "../../asset/img/tech/kubernetes.png";
import grafanaImg from "../../asset/img/tech/grafana.png";
import prometheusImg from "../../asset/img/tech/prometheus.png";
import azureImg from "../../asset/img/tech/azure.png";
import awsImg from "../../asset/img/tech/aws.png";

const technologies = [
  { name: "C#", img: csharpImg },
  { name: ".NET Core API", img: dotnetImg },
  { name: "React + TypeScript", img: reactImg },
  { name: "Angular", img: angularImg },
  { name: "Docker", img: dockerImg },
  { name: "Kubernetes", img: kubernetesImg },
  { name: "Grafana", img: grafanaImg },
  { name: "Prometheus", img: prometheusImg },
  { name: "Azure", img: azureImg },
  { name: "AWS", img: awsImg },
];

const About = () => {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <div
        className="about-hero flex align-items-center justify-content-center"
        style={{
          backgroundImage:
            "url('https://primefaces.org/cdn/primereact/images/carousel/erp2.jpg')",
        }}
      >
        <div className="hero-overlay text-center">
          <h1>About Us</h1>
          <p>Enterprise Software • Cloud • ERP Solutions</p>
        </div>
      </div>

      {/* ===== CONTENT ===== */}

      <div className="text-center line-height-3">

        <p className="mb-3">
          We are a <strong>software development company</strong> with over{" "}
          <strong>2 years of experience</strong> delivering scalable, secure,
          and high-performance solutions for businesses.
        </p>

        <p className="mb-4">
          Our expertise spans ERP systems, enterprise web applications,
          microservices architectures, and cloud-native platforms built
          with modern technologies.
        </p>

        <h2 className="mb-3">Our Technology Stack</h2>

        <div className="grid">
          {technologies.map((tech, index) => (
            <div key={index} className="col-6 md:col-3">
              <Card className="tech-card text-center">
                <img
                  src={tech.img}
                  alt={tech.name}
                  className="tech-icon"
                />
                <h6 className="mt-2">{tech.name}</h6>
              </Card>
            </div>
          ))}
        </div>

        {/* ===== APPROACH ===== */}
        <h2 className="mt-5 mb-3 text-center">How We Work</h2>

        <p className="text-center">
          We follow <strong>clean architecture</strong>,{" "}
          <strong>microservices-based design</strong>, and{" "}
          <strong>DevOps best practices</strong> using Docker, Kubernetes,
          Prometheus, and Grafana to ensure observability, scalability,
          and long-term success.
        </p>

      </div>

    </>
  );
};

export default About;
