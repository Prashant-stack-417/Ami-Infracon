const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto mt-24 mb-8 px-4">
      <h1 className="type-page-title mb-phi-lg">Contact Us</h1>
      <div className="space-y-6">
        <div>
          <h2 className="type-section-title mb-phi-xs">Get in Touch</h2>
          <p className="type-body text-gray-600">
            Have questions about our products or services? We're here to help
            you with your infrastructure needs.
          </p>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center gap-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <h3 className="type-label" style={{ fontWeight: 700 }}>Email</h3>
                <p className="type-caption text-gray-600">info@amiinfracon.com</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center gap-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <div>
                <h3 className="type-label" style={{ fontWeight: 700 }}>Phone</h3>
                <p className="type-caption text-gray-600">+91 98765 43210</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center gap-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <h3 className="type-label" style={{ fontWeight: 700 }}>Address</h3>
                <p className="type-caption text-gray-600">
                  Ahmedabad, Gujarat
                  <br />
                  India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
