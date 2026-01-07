// src/pages/Contact.tsx
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export const Contact = () => (
  <div className="p-5 max-w-30rem mx-auto">
    <h2>Contact Us</h2>

    <span className="p-float-label mb-3">
      <InputText id="name" className="w-full" />
      <label htmlFor="name">Name</label>
    </span>

    <span className="p-float-label mb-3">
      <InputText id="email" className="w-full" />
      <label htmlFor="email">Email</label>
    </span>

    <Button label="Submit" className="w-full mt-2" />
  </div>
);
