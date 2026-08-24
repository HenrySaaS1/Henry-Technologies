import healthcareImage from '../assets/uploads/img-6.png'
import pharmaImage from '../assets/uploads/img-8.png'
import medicalDevicesImage from '../assets/uploads/img-10.png'

const caseStudies = [
  {
    title: 'Medical Equipment & Devices',
    text: 'Enhancing precision manufacturing, quality control, and traceability in high-stakes production environments.',
    image: medicalDevicesImage,
    details: {
      heading: 'Medical Equipment & Devices',
      intro:
        'Precision, compliance, and zero-defect manufacturing are critical in medical device production. A leading manufacturer partnered with HENRY to gain on-demand visibility across assembly lines and ensure consistent product quality.',
      body:
        'With HENRY Core and Factory Analytics, they monitored every stage of production, detected defects instantly, and maintained strict regulatory standards without slowing down operations.',
      highlights: [
        '25% faster inspection cycles',
        '32% reduction in production defects',
        'Full compliance with ISO standards',
      ],
    },
  },
  {
    title: 'Healthcare',
    text: 'Improving patient care and operational efficiency through data-driven monitoring and automation.',
    image: healthcareImage,
    details: {
      heading: 'Healthcare',
      intro:
        'A fast-growing healthcare provider faced challenges in managing patient flow, optimizing equipment usage, and maintaining operational efficiency across multiple locations.',
      body:
        'By implementing HENRY intelligent analytics and automation tools, they gained on-demand insights into hospital operations, streamlined workflows, and improved decision-making across departments.',
      highlights: [
        '40% increase in operational efficiency',
        '30% reduction in patient wait times',
        'Centralized monitoring across all facilities',
      ],
    },
  },
  {
    title: 'Pharmaceuticals',
    text: 'Ensuring compliance, batch traceability, and contamination-free production with continuous monitoring.',
    image: pharmaImage,
    details: {
      heading: 'Pharmaceuticals',
      intro:
        'Maintaining compliance, ensuring batch traceability, and preventing contamination are top priorities in pharmaceutical manufacturing. One company leveraged HENRY to digitize their monitoring systems and automate compliance reporting.',
      body:
        'With continuous tracking and intelligent alerts, they improved production safety while significantly reducing manual workload.',
      highlights: [
        '50% faster compliance reporting',
        'Zero contamination incidents',
        'Improved batch traceability and audit readiness',
      ],
    },
  },
]

export default caseStudies