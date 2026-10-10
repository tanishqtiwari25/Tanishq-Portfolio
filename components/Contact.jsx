"use client";

import { useRef, useState } from "react";
import { validateContact } from "@/lib/contact-validation.mjs";
import {
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    message: "",
  });

  const lock = useRef(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lock.current) return;
    if (!validateContact(formData)) {
      setError(
        "Please enter a name (2–100 characters), valid email, and message (10–5,000 characters).",
      );
      return;
    }
    lock.current = true;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error("send");
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "", website: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      lock.current = false;
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 bg-surface/30 border-t border-surfaceBorder/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accentPrimary">
            05 / The next chapter
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-textMain tracking-tight">
            Let’s build something extraordinary.
          </h2>
          <p className="text-textMuted text-sm sm:text-base">
            Open for Frontend Developer roles, React projects, and freelance
            inquiries.
          </p>
          <div className="w-12 h-1 bg-accentPrimary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Direct Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-2xl bg-surface border border-surfaceBorder space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-textMain">
                Contact Information
              </h3>

              <div className="space-y-4 text-sm">
                <a
                  href="mailto:tanishqtiwari265@gmail.com"
                  className="flex items-center gap-4 text-textMuted hover:text-accentPrimary transition-colors group"
                >
                  <div className="p-3 rounded-xl bg-background border border-surfaceBorder group-hover:border-accentPrimary/40 text-accentPrimary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-textMuted uppercase font-mono">
                      Email
                    </span>
                    <span className="font-medium text-textMain">
                      tanishqtiwari265@gmail.com
                    </span>
                  </div>
                </a>

                <a
                  href="tel:+919305629523"
                  className="flex items-center gap-4 text-textMuted hover:text-accentPrimary transition-colors group"
                >
                  <div className="p-3 rounded-xl bg-background border border-surfaceBorder group-hover:border-accentPrimary/40 text-accentPrimary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-textMuted uppercase font-mono">
                      Phone
                    </span>
                    <span className="font-medium text-textMain">
                      +91 9305629523
                    </span>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/tanishq-tiwari-31138b252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-textMuted hover:text-accentPrimary transition-colors group"
                >
                  <div className="p-3 rounded-xl bg-background border border-surfaceBorder group-hover:border-accentPrimary/40 text-accentPrimary">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-textMuted uppercase font-mono">
                      LinkedIn
                    </span>
                    <span className="font-medium text-textMain">
                      tanishq-tiwari-31138b252
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-4 text-textMuted">
                  <div className="p-3 rounded-xl bg-background border border-surfaceBorder text-accentPrimary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-textMuted uppercase font-mono">
                      Location
                    </span>
                    <span className="font-medium text-textMain">
                      Kanpur, Uttar Pradesh, India
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl bg-surface border border-surfaceBorder shadow-xl">
              {submitted ? (
                <div
                  className="py-12 text-center space-y-4 form-success"
                  role="status"
                >
                  <CheckCircle2 className="w-12 h-12 text-textMuted mx-auto" />
                  <h3 className="text-xl font-bold text-textMain">
                    Message sent successfully.
                  </h3>
                  <p className="text-xs text-textMuted max-w-sm mx-auto">
                    Thank you for reaching out. I will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-background border border-surfaceBorder text-textMain"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  suppressHydrationWarning
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-textMain"
                      >
                        Your Name
                      </label>
                      <input
                        suppressHydrationWarning
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        minLength={2}
                        maxLength={100}
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-surfaceBorder text-textMain text-xs focus:border-accentPrimary focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-textMain"
                      >
                        Your Email
                      </label>
                      <input
                        suppressHydrationWarning
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        maxLength={254}
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@company.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-surfaceBorder text-textMain text-xs focus:border-accentPrimary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="honeypot" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="message"
                      className="block text-xs font-medium text-textMain"
                    >
                      Message
                    </label>
                    <textarea
                      suppressHydrationWarning
                      id="message"
                      name="message"
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Write your message here..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-surfaceBorder text-textMain text-xs focus:border-accentPrimary focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    data-magnetic
                    disabled={sending}
                    aria-busy={sending}
                    className="w-full py-3.5 rounded-xl bg-accentPrimary text-background text-xs font-bold hover:bg-accentSecondary transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accentPrimary/10"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Sending..." : "Send Message"}
                  </button>

                  <p className="text-[10px] text-center text-textMuted pt-1">
                    Your email is used only to reply to your message.
                  </p>

                  <p role="status" aria-live="polite" className="form-status">
                    {error}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
