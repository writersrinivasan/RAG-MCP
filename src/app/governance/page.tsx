import { ModuleHeader, TrackTabs, Callout, Step } from "@/components/ui";
import { GuardrailDemo } from "@/components/governance/GuardrailDemo";
import { AuditTrail } from "@/components/governance/AuditTrail";

export default function GovernancePage() {
  return (
    <div>
      <ModuleHeader eyebrow="Step 4 · Trust, safety & compliance" title="Governance" minutes={15}>
        A helpful agent that leaks a customer&apos;s SSN or invents a policy term
        is a liability, not an asset. Governance is the layer that keeps the
        agent inside the lines — <b>before</b>, <b>during</b>, and <b>after</b>{" "}
        every response.
      </ModuleHeader>

      <TrackTabs
        handsOn={
          <div className="space-y-8">
            <Callout tone="danger" title="Break it on purpose">
              Try Example 1 (leaks PII) and Example 2 (a prompt-injection
              attack). Watch the guardrails catch and neutralize both before the
              customer ever sees the output.
            </Callout>

            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                🧪 Output guardrails
              </h2>
              <GuardrailDemo />
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-white">
                📜 The audit trail
              </h2>
              <AuditTrail />
            </section>
          </div>
        }
        theory={
          <div className="space-y-6">
            <div className="card">
              <div className="section-title">Governance wraps the whole loop</div>
              <div className="mt-4">
                <Step n={1} title="Input guardrails (before)">
                  Detect prompt injection, off-topic or abusive requests, and
                  strip PII from what enters the model.
                </Step>
                <Step n={2} title="Access control (during)">
                  The agent acts with a scoped identity. It can read this
                  customer&apos;s account but not others; write actions need
                  elevated permission.
                </Step>
                <Step n={3} title="Human-in-the-loop (during)">
                  Risky or irreversible actions (filing a claim, issuing a
                  refund) pause for human approval via a LangGraph interrupt.
                </Step>
                <Step n={4} title="Output guardrails (after)">
                  Redact PII, verify every claim is cited and grounded, and
                  block toxic or non-compliant text.
                </Step>
                <Step n={5} title="Audit & observability (always)">
                  Log every input, tool call, decision, and output — immutable
                  and exportable for compliance review.
                </Step>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Callout tone="info" title="Responsible-AI dimensions">
                <ul className="ml-4 list-disc space-y-1">
                  <li><b>Safety</b> — no harmful or leaking output.</li>
                  <li><b>Privacy</b> — PII minimized and protected.</li>
                  <li><b>Fairness</b> — consistent treatment across customers.</li>
                  <li><b>Transparency</b> — citations + explainable decisions.</li>
                  <li><b>Accountability</b> — a human owns the outcome.</li>
                </ul>
              </Callout>
              <Callout tone="warn" title="Regulatory backdrop">
                Frameworks like the EU AI Act, NIST AI RMF and ISO/IEC 42001
                push the same core ideas: risk assessment, human oversight,
                logging, and documentation. Build these in from day one — they
                are far harder to retrofit.
              </Callout>
            </div>

            <Callout tone="success" title="Golden rule">
              If you can&apos;t explain <i>why</i> the agent said something and{" "}
              <i>prove</i> it didn&apos;t leak data, it isn&apos;t ready for
              production — no matter how good the answers look.
            </Callout>
          </div>
        }
      />
    </div>
  );
}
