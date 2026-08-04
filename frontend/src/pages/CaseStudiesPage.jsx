import caseStudies from '../data/caseStudies.js'

function CaseStudiesPage({
    showCaseDemo,
    openCaseDemoModal,
    closeCaseDemoModal,
    form,
    status,
    updateField,
    submitContact,
}) {
    return (
        <>
            <section
                className="case-studies-page-top-strip"
                aria-label="Case Studies page title"
            >
                <h1>CASE STUDIES</h1>
            </section>

            <section
                className="case-studies-detailed-page"
                aria-label="Detailed case studies"
            >
                {caseStudies.map((item, idx) => (
                    <article
                        id={`case-${item.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')}`}
                        key={item.title}
                        className={`case-study-detail-row${idx % 2 === 1 ? ' reverse' : ''
                            }`}
                    >
                        <div className="case-study-detail-media">
                            <img
                                src={item.image}
                                alt={item.title}
                            />

                            <button
                                type="button"
                                className="btn-dark small"
                                onClick={() =>
                                    openCaseDemoModal(item.title)
                                }
                            >
                                Learn More
                            </button>
                        </div>

                        <div className="case-study-detail-content">
                            <h3>{item.details.heading}</h3>

                            <p>{item.details.intro}</p>

                            <p>{item.details.body}</p>

                            <ul>
                                {item.details.highlights.map((line) => (
                                    <li key={line}>
                                        <span aria-hidden="true">
                                            ☑
                                        </span>{' '}
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </article>
                ))}
            </section>

            {showCaseDemo ? (
                <section
                    className="case-demo-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="case-demo-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeCaseDemoModal()
                        }
                    }}
                >
                    <div className="case-demo-modal">
                        <button
                            type="button"
                            className="case-demo-close"
                            aria-label="Close"
                            onClick={closeCaseDemoModal}
                        >
                            ×
                        </button>

                        <h3 id="case-demo-title">
                            Let&apos;s Talk!
                        </h3>

                        <form
                            className="case-demo-form"
                            onSubmit={submitContact}
                        >
                            <label>
                                Name <span aria-hidden="true">*</span>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={updateField}
                                    required
                                />
                            </label>

                            <label>
                                Email <span aria-hidden="true">*</span>

                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={updateField}
                                    required
                                />
                            </label>

                            <label>
                                Company Name

                                <input
                                    name="companyName"
                                    value={form.companyName}
                                    onChange={updateField}
                                />
                            </label>

                            <label>
                                Area of Interest{' '}
                                <span aria-hidden="true">*</span>

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
                            </label>

                            <label className="case-demo-notes">
                                Notes

                                <textarea
                                    name="notes"
                                    rows="4"
                                    value={form.notes}
                                    onChange={updateField}
                                    placeholder="TELL US BRIEFLY ABOUT YOUR REQUIREMENT..."
                                />
                            </label>

                            <button
                                type="submit"
                                className="case-demo-submit"
                            >
                                Get Free Consultation
                            </button>

                            {status ? (
                                <p className="case-demo-status">
                                    {status}
                                </p>
                            ) : null}
                        </form>
                    </div>
                </section>
            ) : null}
        </>
    )
}

export default CaseStudiesPage