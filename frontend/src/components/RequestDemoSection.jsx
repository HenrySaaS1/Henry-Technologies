function RequestDemoSection({
  form,
  status,
  updateField,
  submitContact,
}) {
  return (
    <section
      id="request-demo"
      className="request-demo"
    >
      <h2>
        Ready to Transform Your Business?
      </h2>

      <p className="request-demo-intro">
        We&apos;d love to hear from you. Fill out the form below and our team
        will get back to you shortly.
      </p>

      <form
        className="contact-form demo-request-form"
        onSubmit={submitContact}
      >
        <input
          name="name"
          value={form.name}
          onChange={updateField}
          placeholder="Name *"
        />

        <input
          name="email"
          value={form.email}
          onChange={updateField}
          placeholder="Email *"
        />

        <input
          name="companyName"
          value={form.companyName}
          onChange={updateField}
          placeholder="Company Name"
        />

        <select
          name="interest"
          value={form.interest}
          onChange={updateField}
        >
          <option>
            Smart Monitoring Setup
          </option>

          <option>
            On-Demand Data &amp; Dashboard
          </option>

          <option>
            System Integration (Machines, Devices, APIs)
          </option>

          <option>
            Data Processing &amp; Cloud Setup
          </option>

          <option>
            Performance Optimization
          </option>

          <option>
            Custom SaaS Development
          </option>

          <option>
            AI &amp; Predictive Insights
          </option>

          <option>
            Consultation &amp; Strategy
          </option>
        </select>

        <textarea
          name="notes"
          rows="4"
          value={form.notes}
          onChange={updateField}
          placeholder="TELL US BRIEFLY ABOUT YOUR REQUIREMENT..."
        />

        <button
          type="submit"
          className="btn-primary"
        >
          Get Free Consultation
        </button>

        {status ? (
          <p className="form-status">
            {status}
          </p>
        ) : null}
      </form>
    </section>
  )
}

export default RequestDemoSection