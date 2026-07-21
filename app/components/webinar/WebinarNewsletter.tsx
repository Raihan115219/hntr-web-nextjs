import { WEBINAR_ARTICLES } from "../../../lib/webinar-data";

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 1.5h5l3 3V14a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 14V2a.5.5 0 0 1 .5-.5z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M9 1.5V4.5h3M6 8.5h4M6 11h4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReadArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h9M8.5 4.5L12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WebinarNewsletter() {
  return (
    <>
      <div className="web-up-hdr">
        <div className="web-up-title">HNTR NEWSLETTER</div>
        <a className="web-up-link">View All Articles</a>
      </div>
      <div className="web-up-grid">
        {WEBINAR_ARTICLES.map((article) => (
          <div key={article.issue} className="web-card">
            <div className="web-card-top">
              <span className="web-card-date">{article.issue}</span>
              <span className="web-card-cal">
                <CalendarIcon />
              </span>
            </div>
            <div className="web-card-ttl">{article.title}</div>
            <div className="web-card-sub">{article.subtitle}</div>
            <div className="web-card-add">
              <ReadArrowIcon />
              Read Article
            </div>
          </div>
        ))}
      </div>
      <div className="web-foot">
        <span>© 2024 HNTR Institutional. System Status: Operational</span>
        <div className="web-foot-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Docs</span>
        </div>
      </div>
    </>
  );
}
