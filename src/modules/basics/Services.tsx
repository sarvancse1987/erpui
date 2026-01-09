import { Card } from "primereact/card";
import { Button } from "primereact/button";

export const Services = () => {
  const services = [
    {
      title: "ERP Implementation",
      icon: "pi pi-briefcase",
      desc: "End-to-end ERP solutions for finance, HR, inventory and operations.",
    },
    {
      title: "Custom Software Development",
      icon: "pi pi-code",
      desc: "Scalable web and mobile applications tailored to your business needs.",
    },
    {
      title: "CRM Solutions",
      icon: "pi pi-users",
      desc: "Customer relationship management to boost sales and engagement.",
    },
    {
      title: "Cloud Solutions",
      icon: "pi pi-cloud",
      desc: "Cloud migration, hosting and DevOps on AWS & Azure.",
    },
    {
      title: "AI & Automation",
      icon: "pi pi-cog",
      desc: "AI-powered insights, automation and smart dashboards.",
    },
    {
      title: "Support & Maintenance",
      icon: "pi pi-shield",
      desc: "24×7 monitoring, upgrades and security support.",
    },
  ];

  return (
    <>
      {/* ===== HERO ===== */}
      <div className="surface-0 text-center p-6">
        <h1 className="text-4xl font-bold mb-3">Our Services</h1>
        <p className="text-600 text-lg">
          End-to-end digital solutions to power your business growth
        </p>
      </div>

      {/* ===== SERVICES ===== */}
      <div className="grid p-5">
        {services.map((s, i) => (
          <div key={i} className="col-12 md:col-4">
            <Card className="text-center h-full">
              <i
                className={`pi ${s.icon} text-4xl text-primary mb-3`}
              />
              <h3>{s.title}</h3>
              <p className="text-600">{s.desc}</p>
            </Card>
          </div>
        ))}
      </div>

      {/* ===== PROCESS ===== */}
      <div className="surface-100 p-6">
  <h2 className="text-center mb-5">How We Work</h2>

  <div className="grid text-center">
    {[
      { title: "Requirement Analysis", icon: "pi-search" },
      { title: "Design & Planning", icon: "pi-pencil" },
      { title: "Development", icon: "pi-code" },
      { title: "Testing", icon: "pi-check-circle" },
      { title: "Deployment & Support", icon: "pi-cloud-upload" },
    ].map((step, i) => (
      <div key={i} className="col-12 md:col-2">
        <Card className="h-full">
          <i
            className={`pi ${step.icon} text-4xl text-primary mb-3`}
          />
          <h4 className="mt-2">{step.title}</h4>
        </Card>
      </div>
    ))}
  </div>
</div>


      {/* ===== CTA ===== */}
      <div className="text-center p-6">
        <h2 className="mb-3">Ready to Transform Your Business?</h2>
        <Button
          label="Talk to Our Experts"
          icon="pi pi-arrow-right"
          className="p-button-lg"
        />
      </div>
    </>
  );
};
