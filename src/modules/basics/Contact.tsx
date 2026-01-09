import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";
import "../../asset/basiclayout/Product.css";

export const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const onChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = () => {
    console.log("Contact form submitted", form);
    alert("Message sent successfully!");
    setForm({ name: "", email: "", message: "" });
  };

  const offices = [
    {
      name: "Head Office",
      address: "123 Main Street, City, Country",
      phone: "+91 12345 67890",
      email: "headoffice@example.com",
      mapSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019835...etc", // Replace with your Google Maps embed link
    },
    {
      name: "Branch Office",
      address: "456 Side Street, Another City, Country",
      phone: "+91 98765 43210",
      email: "branch@example.com",
      mapSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019835...etc",
    },
  ];

  return (
    <div className="p-4 grid">
      {/* ====== CONTACT INFO & FORM ====== */}
      <div className="col-12 md:col-6">
        <Card title="Get in Touch">
          <div className="field mb-3">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full"
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full"
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="message">Message</label>
            <InputTextarea
              id="message"
              name="message"
              value={form.message}
              onChange={onChange}
              rows={5}
              className="w-full"
            />
          </div>

          <Button label="Send Message" onClick={onSubmit} icon="pi pi-send" />
        </Card>
      </div>

      {/* ====== OFFICES WITH MAPS ====== */}
      <div className="col-12 md:col-6">
        {offices.map((office, i) => (
          <Card key={i} title={office.name} className="mb-3">
            <p>
              <strong>Address:</strong> {office.address}
            </p>
            <p>
              <strong>Phone:</strong> {office.phone}
            </p>
            <p>
              <strong>Email:</strong> {office.email}
            </p>
            <div className="map-responsive">
              <iframe
                src={office.mapSrc}
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={office.name}
              ></iframe>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
