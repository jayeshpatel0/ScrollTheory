
import { useState } from "react";
import "./Contact.css";

function Contact() {
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setStatus(
      "This is a demo form. Message sending is not connected yet."
    );
  };

  return (
    <main className="contact-page">
      <section className="contact-page-hero">
        <span className="contact-eyebrow">
          SCROLLTHEORY / GET IN TOUCH
        </span>

        <h1>
          Every good story
          <br />
          starts with a <em>conversation.</em>
        </h1>

        <p>
          Have a question, a story idea, or a collaboration
          in mind? We would love to hear from you.
        </p>
      </section>

      <section className="contact-page-content">
        <div className="contact-page-info">
          <span className="contact-eyebrow">
            SAY HELLO
          </span>

          <h2>Let's talk.</h2>

          <p>
            Whether you want to pitch a story, share feedback,
            or work with ScrollTheory, this is the place.
          </p>

          <div className="contact-info-item">
            <span>01</span>
            <div>
              <h3>Story pitches</h3>
              <p>
                Have an idea worth exploring? Tell us about it.
              </p>
            </div>
          </div>

          <div className="contact-info-item">
            <span>02</span>
            <div>
              <h3>Collaborations</h3>
              <p>
                Let's create something meaningful together.
              </p>
            </div>
          </div>

          <div className="contact-info-item">
            <span>03</span>
            <div>
              <h3>Feedback</h3>
              <p>
                Your thoughts help us make ScrollTheory better.
              </p>
            </div>
          </div>
        </div>

        <form
          className="contact-page-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
          />

          <label htmlFor="contact-email">Email address</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="contact-subject">What is this about?</label>
          <select
            id="contact-subject"
            name="subject"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Choose a topic
            </option>
            <option value="Story pitch">Story pitch</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Feedback">Feedback</option>
            <option value="Other">Something else</option>
          </select>

          <label htmlFor="contact-message">Your message</label>
          <textarea
            id="contact-message"
            name="message"
            rows="6"
            placeholder="Tell us what's on your mind..."
            required
          />

          <button type="submit">
            Send your message <span>↗</span>
          </button>

          {status && (
            <p className="contact-form-status" role="status">
              {status}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default Contact;
