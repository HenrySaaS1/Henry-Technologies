function RequestDemoIntroSection() {
  const scrollToRequestDemo = () => {
    if (typeof window === 'undefined') return

    const el = document.getElementById('request-demo')

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else {
      window.location.assign('/#request-demo')
    }
  }

  return (
    <section className="request-demo-intro-block">
      <h2>
        Request a Demo
      </h2>

      <p>
        See Henry in action. Book a personalized demo to explore how Henry
        can help you monitor operations, improve visibility, and make faster
        decisions across your business.
      </p>

      <button
        type="button"
        className="btn-primary"
        onClick={scrollToRequestDemo}
      >
        Request a demo
      </button>
    </section>
  )
}

export default RequestDemoIntroSection