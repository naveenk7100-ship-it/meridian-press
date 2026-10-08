"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2, Send, Feather, Globe } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General Reader Inquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [responseMsg, setResponseMsg] = useState("");
  const [refId, setRefId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus("loading");
    setResponseMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, subject, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setResponseMsg(data.message || "Your inquiry has been received by the editorial board.");
        setRefId(data.referenceId || "");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
        setResponseMsg(data.error || "Failed to submit inquiry. Please try again.");
      }
    } catch {
      setStatus("error");
      setResponseMsg("A network error occurred. Please try again.");
    }
  };

  return (
    <div className="py-12 sm:py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-[#E7E2D8] pb-8 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B85D19]">
            <Mail className="h-4 w-4" />
            <span>Editorial Correspondence</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#14161A] tracking-tight">
            Contact the Editorial Desk
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#5C5F68] max-w-2xl font-light">
            Have a question about our publications, rights inquiries, or wish to submit a monograph proposal? Send us a direct message below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Contact Form */}
          <div className="md:col-span-8">
            <div className="p-6 sm:p-8 rounded-sm bg-white border border-[#E7E2D8] shadow-xs">
              {status === "success" ? (
                <div className="py-10 text-center space-y-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF7EE] text-[#1E7E34] mx-auto border border-[#C3E6CB]">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <span className="font-mono text-xs text-[#B85D19] font-medium">
                      Reference: {refId}
                    </span>
                    <h3 className="font-serif text-2xl font-medium text-[#14161A]">
                      Message Received
                    </h3>
                    <p className="font-sans text-sm text-[#5C5F68] max-w-md mx-auto">
                      {responseMsg}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-4 px-6 py-2.5 text-xs font-mono rounded-sm border border-[#DDD6C9] hover:bg-[#FAF8F5] text-[#14161A]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {status === "error" && (
                    <div className="p-3 text-xs rounded-sm bg-red-50 border border-red-200 text-red-700">
                      {responseMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="sender-name"
                        className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1"
                      >
                        Your Full Name <span className="text-[#B85D19]">*</span>
                      </label>
                      <input
                        id="sender-name"
                        type="text"
                        required
                        placeholder="Elena Rostova"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="sender-email"
                        className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1"
                      >
                        Email Address <span className="text-[#B85D19]">*</span>
                      </label>
                      <input
                        id="sender-email"
                        type="email"
                        required
                        placeholder="elena@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="inquiry-topic"
                        className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1"
                      >
                        Topic of Inquiry
                      </label>
                      <select
                        id="inquiry-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                      >
                        <option value="General Reader Inquiry">General Reader Inquiry</option>
                        <option value="Author Manuscript Proposal">Author Monograph Proposal</option>
                        <option value="Press & Academic Review Copies">Press & Review Copies</option>
                        <option value="Foreign Rights & Translations">Foreign Rights & Translations</option>
                        <option value="Bulk / Institutional License">Institutional & Studio License</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="inquiry-subject"
                        className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1"
                      >
                        Subject
                      </label>
                      <input
                        id="inquiry-subject"
                        type="text"
                        placeholder="Monograph query..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-message"
                      className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1"
                    >
                      Message / Proposal Summary <span className="text-[#B85D19]">*</span>
                    </label>
                    <textarea
                      id="inquiry-message"
                      rows={5}
                      required
                      placeholder="Please provide context on your inquiry or manuscript synopsis..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19] font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 text-sm font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-colors disabled:opacity-50 active:scale-[0.99]"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Transmitting Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Editorial Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="p-6 rounded-sm border border-[#E7E2D8] bg-[#F4EFE6] space-y-4">
              <div className="flex items-center gap-2">
                <Feather className="h-4 w-4 text-[#B85D19]" />
                <h3 className="font-serif text-lg font-medium text-[#14161A]">
                  Manuscript Submissions
                </h3>
              </div>
              <p className="text-xs text-[#5C5F68] leading-relaxed">
                We welcome unsolicited monograph proposals in software architecture, design philosophy, typography, and computing epistemology.
              </p>
              <div className="text-xs font-mono space-y-2 text-[#383A42] pt-2 border-t border-[#DDD6C9]">
                <div>• Target extent: 150–320 pp</div>
                <div>• Include a 2-page structural outline</div>
                <div>• Attach or link one complete sample chapter</div>
              </div>
            </div>

            <div className="p-6 rounded-sm border border-[#E7E2D8] bg-[#FAF8F5] space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#737680]" />
                <h3 className="font-serif text-base font-medium text-[#14161A]">
                  Direct Inquiries
                </h3>
              </div>
              <p className="text-xs font-mono text-[#737680]">
                Editorial Desk: editorial@meridianpress.pub
              </p>
              <p className="text-xs font-mono text-[#737680]">
                Rights & Licenses: rights@meridianpress.pub
              </p>
              <p className="text-xs text-[#737680] pt-1">
                Typical response window: 48 business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
