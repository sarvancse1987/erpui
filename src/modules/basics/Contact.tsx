import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";
import "../../asset/basiclayout/Product.css";

export const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

  const onChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { name: "", email: "", message: "" };

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Email is not valid";
      valid = false;
    }

    if (!form.message.trim()) {
      newErrors.message = "Message is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const onSubmit = () => {
    if (!validateForm()) return;

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
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.5569372297316!2d80.177478!3d13.0647459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526180a6902e8f%3A0x732dd97f55ca1872!2sTetrosoft%20-%20Software%20Design%20%26%20Development!5e0!3m2!1sen!2sin!4v1673358511111!5m2!1sen!2sin",
    },
    {
      name: "Branch Office",
      address: "456 Side Street, Another City, Country",
      phone: "+91 98765 43210",
      email: "branch@example.com",
      mapSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.5569372297316!2d80.177478!3d13.0647459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526180a6902e8f%3A0x732dd97f55ca1872!2sTetrosoft%20-%20Software%20Design%20%26%20Development!5e0!3m2!1sen!2sin!4v1673358511111!5m2!1sen!2sin",
    },
  ];

  return (
    <div className="p-4 grid">
      {/* ====== CONTACT FORM ====== */}
      <div className="col-12 md:col-6 flex justify-content-center">
        <Card title="Get in Touch" className="p-3 card-compact w-full max-w-sm">
          <div className="field mb-2 w-full">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              className={`w-full ${errors.name ? "p-invalid" : ""}`}
              placeholder="Name"
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="field mb-2 w-full">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className={`w-full ${errors.email ? "p-invalid" : ""}`}
              placeholder="Email"
            />
            {errors.email && <small className="p-error">{errors.email}</small>}
          </div>

          <div className="field mb-2 w-full">
            <label htmlFor="message">Message</label>
            <InputTextarea
              id="message"
              name="message"
              value={form.message}
              onChange={onChange}
              rows={4}
              className={`w-full ${errors.message ? "p-invalid" : ""}`}
              placeholder="Message"
            />
            {errors.message && <small className="p-error">{errors.message}</small>}
          </div>

          <div className="flex justify-content-center mt-2">
            <Button label="Send" onClick={onSubmit} icon="pi pi-send" className="p-button-sm" />
          </div>
        </Card>
      </div>

      {/* ====== OFFICES WITH MAPS ====== */}
      <div className="col-12 md:col-6 flex flex-column gap-3 items-center">
        {offices.map((office, i) => (
          <Card key={i} title={office.name} className="p-3 card-compact w-full max-w-sm">
            <p><strong>Address:</strong> {office.address}</p>
            <p><strong>Phone:</strong> {office.phone}</p>
            <p><strong>Email:</strong> {office.email}</p>
            <div className="map-responsive">
              <iframe
                src={office.mapSrc}
                width="100%"
                height="200"
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
