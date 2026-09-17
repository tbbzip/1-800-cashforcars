"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronRight, CircleDollarSign, ClipboardCheck, FileCheck2, Gauge, LockKeyhole, MapPin, MessageSquareText, Phone, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, Truck, Wrench } from "lucide-react";
import { isValidPhone } from "../../offer-validation";
import { DEMO_SCENARIOS, DEMO_VIN, DEMO_YEARS, INITIAL_DEMO_INPUT, getDemoEstimate, getMakesForYear, getModelsForYearMake, lookupDemoVin, validateDemoInput, type DemoInput } from "./demo-data";
import styles from "./estimate-prototype.module.css";

type Step = 0 | 1 | 2 | 3 | 4;
type Errors = Partial<Record<keyof DemoInput | "vin" | "fullName" | "phone" | "street" | "city", string>>;
type Contact = { fullName: string; phone: string; street: string; city: string; timing: string; notes: string };
type DemoResult = ReturnType<typeof getDemoEstimate>;
type DemoLead = { vehicle: DemoInput; contact: Contact; result: DemoResult };
const EMPTY_CONTACT: Contact = { fullName: "", phone: "", street: "", city: "", timing: "Flexible", notes: "" };
const MONEY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const STEP_LABELS = ["Your vehicle", "Its condition", "Your estimate"];
const runningOptions = [{ value: "runs", label: "Yes, it runs", detail: "Starts and drives" }, { value: "does_not_run", label: "It doesn’t run", detail: "Needs a tow" }, { value: "not_sure", label: "Not sure", detail: "Let’s review it" }] as const;
const mileageOptions = [{ value: "under100k", label: "Under 100k" }, { value: "100to150k", label: "100k–150k" }, { value: "over150k", label: "Over 150k" }] as const;
const conditionOptions = [{ value: "good", label: "Good overall", detail: "Normal wear" }, { value: "minor_damage", label: "Some damage", detail: "Dents or scratches" }, { value: "major_damage", label: "Major damage", detail: "Collision or repairs" }] as const;
const ownershipOptions = [{ value: "owner_with_title", label: "I own it and have the title" }, { value: "owner_without_title", label: "I own it, but the title is missing" }, { value: "authorized_seller", label: "I’m authorized by the owner" }, { value: "not_sure", label: "I’m not sure / another situation" }] as const;

function ChoiceGroup<T extends string>({ name, label, options, value, onChange, error }: { name: string; label: string; options: readonly { value: T; label: string; detail?: string }[]; value: T | ""; onChange: (value: T) => void; error?: string }) {
  return <fieldset className={styles.choices} aria-describedby={error ? `${name}-error` : undefined}>
    <legend>{label}</legend>
    <div className={styles.choiceGrid}>{options.map(option => <label key={option.value} className={`${styles.choice} ${value === option.value ? styles.choiceSelected : ""}`}>
      <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} data-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined} required />
      <span className={styles.radioMark} aria-hidden="true">{value === option.value ? <Check size={11} /> : null}</span>
      <span><strong>{option.label}</strong>{option.detail ? <small>{option.detail}</small> : null}</span>
    </label>)}</div>
    {error ? <span id={`${name}-error`} className={styles.fieldError} role="alert">{error}</span> : null}
  </fieldset>;
}

function Field({ label, name, children, error }: { label: string; name: string; children: ReactNode; error?: string }) {
  return <div className={styles.field}><label htmlFor={`demo-${name}`}>{label}</label>{children}{error ? <span id={`demo-${name}-error`} className={styles.fieldError}>{error}</span> : null}</div>;
}

export default function EstimatePrototype() {
  const [step, setStep] = useState<Step>(0);
  const [view, setView] = useState<"seller" | "owner">("seller");
  const [input, setInput] = useState<DemoInput>({ ...INITIAL_DEMO_INPUT });
  const [mode, setMode] = useState<"manual" | "vin">("manual");
  const [vin, setVin] = useState("");
  const [vinConfirmed, setVinConfirmed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [contact, setContact] = useState<Contact>({ ...EMPTY_CONTACT });
  const [lead, setLead] = useState<DemoLead | null>(null);
  const [leadStatus, setLeadStatus] = useState("New request");
  const heading = useRef<HTMLHeadingElement>(null);
  const formArea = useRef<HTMLDivElement>(null);
  const result = getDemoEstimate(input);
  const vehicle = [input.year, input.make, input.model].filter(Boolean).join(" ");
  const makes = getMakesForYear(input.year);
  const models = getModelsForYearMake(input.year, input.make);
  const activeStep = Math.min(step, 2);

  useEffect(() => {
    const element = heading.current;
    element?.focus({ preventScroll: true });
    if (element && (step > 0 || view === "owner")) {
      const { top, bottom } = element.getBoundingClientRect();
      if (top < 0 || bottom > window.innerHeight) element.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [step, view]);

  function change<K extends keyof DemoInput>(key: K, value: DemoInput[K]) {
    if (key === "year" || key === "make" || key === "model") setVinConfirmed(false);
    setInput(current => ({ ...current, [key]: value, ...(key === "year" ? { make: "", model: "" } : {}), ...(key === "make" ? { model: "" } : {}) }));
    setErrors(current => ({ ...current, [key]: undefined }));
  }

  function showErrors(next: Errors) {
    setErrors(next);
    requestAnimationFrame(() => formArea.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus());
  }

  function restart() {
    setInput({ ...INITIAL_DEMO_INPUT }); setContact({ ...EMPTY_CONTACT }); setMode("manual"); setVin(""); setVinConfirmed(false); setErrors({}); setStep(0); setLead(null); setLeadStatus("New request"); setView("seller");
  }

  function loadScenario(index: number) {
    setInput({ ...DEMO_SCENARIOS[index].input }); setContact({ ...EMPTY_CONTACT }); setMode("manual"); setVin(""); setVinConfirmed(false); setErrors({}); setStep(0); setLead(null); setLeadStatus("New request"); setView("seller");
  }

  function decodeVin() {
    const match = lookupDemoVin(vin);
    if (!match) { showErrors({ vin: "This prototype uses sample vehicles. Use the sample VIN below, or choose year, make and model." }); return; }
    setInput(current => ({ ...current, ...match })); setVinConfirmed(true); setErrors({});
  }

  function next(event: FormEvent) {
    event.preventDefault();
    const invalid = validateDemoInput(input);
    if (step === 0) {
      const vehicleErrors: Errors = {};
      for (const field of ["year", "make", "model", "zip"] as const) if (invalid[field]) vehicleErrors[field] = invalid[field];
      if (mode === "vin" && !vinConfirmed) vehicleErrors.vin = "Load the sample vehicle to continue.";
      if (Object.keys(vehicleErrors).length) { showErrors(vehicleErrors); return; }
      setErrors({}); setStep(1); return;
    }
    if (step === 1) {
      if (Object.keys(invalid).length) { showErrors(invalid); return; }
      setErrors({}); setStep(2); return;
    }
    if (step === 3) {
      const contactErrors: Errors = {};
      if (!contact.fullName.trim()) contactErrors.fullName = "Add a name for the sample request.";
      if (!isValidPhone(contact.phone) || !/^[+\d\s().-]+$/.test(contact.phone)) contactErrors.phone = "Use a 10-digit US phone number.";
      if (!contact.street.trim()) contactErrors.street = "Add a pickup street address.";
      if (!contact.city.trim()) contactErrors.city = "Add a pickup city.";
      if (Object.keys(contactErrors).length) { showErrors(contactErrors); return; }
      if (result.status !== "range" && result.status !== "manual-review") { setStep(2); return; }
      // Presentation-only state. No API, email, analytics event or browser storage.
      setLead({ vehicle: { ...input }, contact: { ...contact }, result }); setLeadStatus("New request"); setErrors({}); setStep(4);
    }
  }

  function fieldAttrs(name: keyof Errors) { return { id: `demo-${name}`, "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? `demo-${name}-error` : undefined }; }
  function updateContact(key: keyof Contact, value: string) { setContact(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); }
  function previous(target: Step) { setErrors({}); setStep(target); }

  return <div className={styles.app}>
    <div className={styles.demoBar}><span><LockKeyhole size={13} /><strong>PRIVATE PROTOTYPE</strong><span className={styles.demoBarDescription}>Fictional estimates. No real offers or submissions.</span></span><span className={styles.demoVersion}>CONCEPT 01</span></div>
    <header className={styles.header}>
      <Image src="/logo.svg" alt="1-800 Cash For Cars" width={160} height={62} priority />
      <div className={styles.headerActions}><div className={styles.viewSwitch} aria-label="Prototype view"><button type="button" onClick={() => setView("seller")} aria-pressed={view === "seller"}>Seller experience</button><button type="button" onClick={() => setView("owner")} aria-pressed={view === "owner"}><SlidersHorizontal size={14} />Owner view{lead ? <span className={styles.notificationDot} /> : null}</button></div><button type="button" className={styles.restart} onClick={restart} aria-label="Restart demo"><RotateCcw size={17} /><span>Restart</span></button></div>
    </header>

    {view === "seller" ? <main className={styles.main}>
      <aside className={styles.story}>
        <span className={styles.eyebrow}><span /> A LOCAL OFFER. A SIMPLE NEXT STEP.</span>
        <h1>Your car.<br />A fresh <em>start.</em></h1>
        <p className={styles.storyIntro}>See what your vehicle could be worth.<br />A few details, a clear estimate, and a local team to take it from there.</p>
        <div className={styles.storyPoints}><span><ClipboardCheck size={18} />Tell us about your car</span><span><CircleDollarSign size={18} />Explore your estimate</span><span><Truck size={18} />Plan your next step</span></div>
        <div className={styles.illustration}><span className={styles.orbit} /><Image src="/mascot/raccoon-mascot-clipboard-yellow-classic-car.webp" alt="Cash For Cars mascot checking a yellow car" width={600} height={404} priority /><div className={styles.localStamp}><MapPin size={16} /><span>SAN DIEGO COUNTY<strong>Your neighborhood car buyer.</strong></span></div></div>
        <div className={styles.samples}><p><Sparkles size={14} />PRESENTATION SHORTCUTS</p><div>{DEMO_SCENARIOS.map((scenario, index) => <button type="button" key={scenario.id} onClick={() => loadScenario(index)} title={scenario.description}>{index === 0 ? <Gauge size={15} /> : index === 1 ? <Wrench size={15} /> : <FileCheck2 size={15} />}{index === 0 ? "Running car" : index === 1 ? "Non-running car" : "Needs review"}<ChevronRight size={13} /></button>)}</div><small>Load fictional answers, then walk through the experience.</small></div>
      </aside>

      <div className={styles.experience} ref={formArea}>
        <nav className={styles.progress} aria-label="Estimate progress">{STEP_LABELS.map((label, index) => <div key={label} className={`${styles.progressStep} ${activeStep === index ? styles.progressActive : ""} ${activeStep > index ? styles.progressDone : ""}`} aria-current={activeStep === index ? "step" : undefined}><span>{activeStep > index ? <Check size={13} /> : `0${index + 1}`}</span>{label}</div>)}</nav>
        <div className={styles.card}>
          <form onSubmit={next} noValidate>
            {step === 0 ? <div className={styles.enter} key="vehicle">
              <div className={styles.cardEyebrow}>LET’S START WITH YOUR CAR</div><h2 tabIndex={-1} ref={heading}>What are you selling?</h2><p className={styles.cardIntro}>Start with the basics. No commitment needed.</p>
              <div className={styles.modeSwitch} role="group" aria-label="Vehicle entry method"><button type="button" aria-pressed={mode === "manual"} onClick={() => { setMode("manual"); setErrors({}); }}>Year, make & model</button><button type="button" aria-pressed={mode === "vin"} onClick={() => { setMode("vin"); setErrors({}); }}>Use a VIN</button></div>
              {mode === "manual" ? <div className={styles.vehicleFields}>
                <Field label="Year" name="year" error={errors.year}><select {...fieldAttrs("year")} value={input.year} onChange={e => change("year", e.target.value)}><option value="">Select year</option>{DEMO_YEARS.map(year => <option key={year}>{year}</option>)}</select></Field>
                <Field label="Make" name="make" error={errors.make}><select {...fieldAttrs("make")} value={input.make} disabled={!input.year} onChange={e => change("make", e.target.value)}><option value="">{input.year ? "Select make" : "Choose year first"}</option>{makes.map(make => <option key={make}>{make}</option>)}</select></Field>
                <Field label="Model" name="model" error={errors.model}><select {...fieldAttrs("model")} value={input.model} disabled={!input.make} onChange={e => change("model", e.target.value)}><option value="">{input.make ? "Select model" : "Choose make first"}</option>{models.map(model => <option key={model}>{model}</option>)}</select></Field>
              </div> : <div className={styles.vinArea}>
                <Field label="Sample VIN" name="vin" error={errors.vin}><div className={styles.vinInput}><input {...fieldAttrs("vin")} value={vin} autoComplete="off" maxLength={17} placeholder="Enter the sample VIN" onChange={e => { setVin(e.target.value.toUpperCase()); setVinConfirmed(false); setInput(current => ({ ...current, year: "", make: "", model: "" })); setErrors({}); }} /><button type="button" onClick={decodeVin}>Find car <ArrowRight size={16} /></button></div></Field>
                <button className={styles.textButton} type="button" onClick={() => { const match = lookupDemoVin(DEMO_VIN); setVin(DEMO_VIN); if (match) setInput(current => ({ ...current, ...match })); setVinConfirmed(!!match); setErrors({}); }}>Use sample VIN <span>{DEMO_VIN}</span></button>
                {vinConfirmed ? <div className={styles.decoded}><BadgeCheck size={18} /><span><strong>{vehicle}</strong>Sample vehicle details filled in</span></div> : <p className={styles.helper}>VIN lookup is simulated in this preview.</p>}
              </div>}
              <Field label="Where is the vehicle?" name="zip" error={errors.zip}><div className={styles.iconInput}><MapPin size={18} /><input {...fieldAttrs("zip")} value={input.zip} inputMode="numeric" maxLength={5} placeholder="Pickup ZIP code" autoComplete="off" onChange={e => change("zip", e.target.value.replace(/\D/g, "").slice(0, 5))} /></div></Field>
              <p className={styles.helper}>This preview includes a small sample vehicle catalog.</p>
              <button className={styles.primary} type="submit">Continue <ArrowRight size={18} /></button>
              <div className={styles.reassurance}><ShieldCheck size={15} /> No contact details needed to see an estimate.</div>
            </div> : null}

            {step === 1 ? <div className={styles.enter} key="condition">
              <button type="button" className={styles.back} onClick={() => previous(0)}><ArrowLeft size={15} />Vehicle details</button>
              <div className={styles.cardEyebrow}>{vehicle}</div><h2 tabIndex={-1} ref={heading}>A little about its condition.</h2><p className={styles.cardIntro}>Every car has a story. Tell us yours.</p>
              <ChoiceGroup name="running" label="Does it start and run?" options={runningOptions} value={input.running} onChange={v => change("running", v)} error={errors.running} />
              <ChoiceGroup name="mileage" label="About how many miles?" options={mileageOptions} value={input.mileage} onChange={v => change("mileage", v)} error={errors.mileage} />
              <ChoiceGroup name="condition" label="How does the body look?" options={conditionOptions} value={input.condition} onChange={v => change("condition", v)} error={errors.condition} />
              <Field label="What’s your ownership / title situation?" name="ownership" error={errors.ownership}><select {...fieldAttrs("ownership")} value={input.ownership} onChange={e => change("ownership", e.target.value as DemoInput["ownership"])}><option value="">Select an answer</option>{ownershipOptions.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></Field>
              <button className={styles.primary} type="submit">See my sample estimate <ArrowRight size={18} /></button><p className={styles.underButton}>Illustrative pricing for this private presentation.</p>
            </div> : null}

            {step === 2 ? <div className={styles.enter} key="estimate">
              <button type="button" className={styles.back} onClick={() => previous(1)}><ArrowLeft size={15} />Edit my answers</button>
              {result.status === "range" ? <>
                <div className={styles.resultBadge}><Check size={14} /> YOUR SAMPLE ESTIMATE IS READY</div><h2 tabIndex={-1} ref={heading}>Here’s your starting point.</h2><p className={styles.cardIntro}>{vehicle} <span>·</span> ZIP {input.zip}</p>
                <div className={styles.estimateBox}><p>ILLUSTRATIVE PURCHASE RANGE</p><div className={styles.price}>{MONEY.format(result.lower)}<span>–</span>{MONEY.format(result.upper)}</div><div className={styles.estimateFoot}><span><Truck size={16} />Pickup included in this scenario</span><strong>DEMO ONLY</strong></div></div>
                <p className={styles.estimateDisclaimer}>Fictional amounts for demonstration, not a real quote or purchase commitment.</p>
                <h3 className={styles.smallTitle}>Based on what you shared</h3><ul className={styles.factors}>{[`${mileageOptions.find(option => option.value === input.mileage)?.label} miles`, runningOptions.find(option => option.value === input.running)?.detail, conditionOptions.find(option => option.value === input.condition)?.label, input.ownership === "owner_without_title" ? "Missing title — paperwork follow-up needed" : input.ownership === "authorized_seller" ? "Permission from the owner to sell" : "Owner with title available"].map(factor => <li key={factor}><Check size={15} />{factor}</li>)}</ul>
                <button type="button" className={styles.primary} onClick={() => previous(3)}>Continue with this estimate <ArrowRight size={18} /></button><p className={styles.underButton}>Next: contact details and pickup preferences.</p>
              </> : result.status === "manual-review" ? <>
                <div className={styles.reviewIcon}><MessageSquareText size={27} /></div><div className={styles.cardEyebrow}>A LITTLE LOCAL HELP</div><h2 tabIndex={-1} ref={heading}>Let’s take a closer look.</h2><p className={styles.cardIntro}>A few details need a person’s attention before an estimate makes sense.</p><ul className={styles.factors}>{result.reasons.map(reason => <li key={reason}><FileCheck2 size={17} />{reason}</li>)}</ul><div className={styles.softNote}>Your {vehicle} can still move to a review. You don’t need to guess an answer.</div><button type="button" className={styles.primary} onClick={() => previous(3)}>Request a sample review <ArrowRight size={18} /></button><p className={styles.underButton}>Demonstration only. No request will be sent.</p>
              </> : result.status === "out-of-area" ? <>
                <div className={styles.reviewIcon}><MapPin size={27} /></div><h2 tabIndex={-1} ref={heading}>Let’s check that location.</h2><p className={styles.cardIntro}>ZIP {input.zip} is outside the current San Diego County pickup area.</p><div className={styles.softNote}>This example routes the seller to a location review instead of showing a price that can’t be fulfilled.</div><button type="button" className={styles.primary} onClick={() => previous(0)}>Change pickup ZIP <ArrowLeft size={18} /></button>
              </> : <><h2 tabIndex={-1} ref={heading}>A few details are missing.</h2><p className={styles.cardIntro}>Complete your vehicle details to see the next step.</p><button type="button" className={styles.primary} onClick={() => previous(0)}>Review vehicle <ArrowLeft size={18} /></button></>}
            </div> : null}

            {step === 3 ? <div className={styles.enter} key="contact">
              <button type="button" className={styles.back} onClick={() => previous(2)}><ArrowLeft size={15} />Back to {result.status === "range" ? "estimate" : "review"}</button><div className={styles.cardEyebrow}>THE NEXT STEP IS YOURS</div><h2 tabIndex={-1} ref={heading}>Let’s make it easy.</h2><p className={styles.cardIntro}>Choose how the team can reach you and where your vehicle is located.</p>
              <div className={styles.sampleFill}><span><LockKeyhole size={14} />Nothing is sent or saved.</span><button type="button" onClick={() => { setContact({ fullName: "Alex Rivera", phone: "619-555-0142", street: "123 Example Street", city: "San Diego", timing: "Afternoon", notes: "Please call before arriving. The car is in the driveway." }); setErrors({}); }}>Use sample details</button></div>
              <div className={styles.contactGrid}>
                <Field label="Full name" name="fullName" error={errors.fullName}><input {...fieldAttrs("fullName")} value={contact.fullName} maxLength={200} autoComplete="off" onChange={e => updateContact("fullName", e.target.value)} /></Field>
                <Field label="Phone number" name="phone" error={errors.phone}><input {...fieldAttrs("phone")} type="tel" value={contact.phone} maxLength={30} autoComplete="off" onChange={e => updateContact("phone", e.target.value)} /></Field>
              </div>
              <Field label="Pickup street address" name="street" error={errors.street}><input {...fieldAttrs("street")} value={contact.street} maxLength={240} autoComplete="off" placeholder="Street address, apartment or unit" onChange={e => updateContact("street", e.target.value)} /></Field>
              <div className={styles.contactGrid}><Field label="City" name="city" error={errors.city}><input {...fieldAttrs("city")} value={contact.city} maxLength={100} autoComplete="off" onChange={e => updateContact("city", e.target.value)} /></Field><Field label="State / ZIP" name="location"><input id="demo-location" value={`CA ${input.zip}`} readOnly /></Field></div>
              <Field label="Preferred pickup time" name="timing"><select id="demo-timing" value={contact.timing} onChange={e => updateContact("timing", e.target.value)}><option>Flexible</option><option>Morning</option><option>Afternoon</option></select></Field>
              <Field label="Anything else? (optional)" name="notes"><textarea id="demo-notes" value={contact.notes} maxLength={2000} rows={3} placeholder="Access details, questions, or anything we should know." onChange={e => updateContact("notes", e.target.value)} /></Field>
              <button className={styles.primary} type="submit">Send demo request <ArrowRight size={18} /></button><p className={styles.underButton}>Simulated submission. No emails, calls or pickup bookings.</p>
            </div> : null}

            {step === 4 ? <div className={`${styles.enter} ${styles.success}`} key="success"><div className={styles.successIcon}><Check size={30} /></div><div className={styles.cardEyebrow}>DEMO REQUEST COMPLETE</div><h2 tabIndex={-1} ref={heading}>Your next chapter starts here.</h2><p className={styles.cardIntro}>Thanks, {contact.fullName.trim().split(/\s+/)[0]}. Here’s what your request would look like.</p><div className={styles.receipt}><div><small>VEHICLE</small><strong>{vehicle}</strong></div>{result.status === "range" ? <div><small>SAMPLE ESTIMATE</small><strong>{MONEY.format(result.lower)} – {MONEY.format(result.upper)}</strong></div> : <div><small>NEXT STEP</small><strong>Team review</strong></div>}<div><small>PICKUP PREFERENCE</small><strong>{contact.timing} · {contact.city}</strong></div><div><small>DEMO REFERENCE</small><strong>CFC-DEMO-001</strong></div></div><div className={styles.nextSteps}><span><Phone size={18} /><span><strong>A quick conversation</strong>Confirm the vehicle and your questions.</span></span><span><Truck size={18} /><span><strong>Arrange the pickup</strong>Choose a time once the offer is confirmed.</span></span></div><div className={styles.softNote}>This was a demo. Nothing was sent and no pickup is booked.</div><button type="button" className={styles.primary} onClick={() => setView("owner")}>See what the owner receives <ArrowRight size={18} /></button></div> : null}
          </form>
        </div>
        <div className={styles.belowCard}><ShieldCheck size={15} />Fictional pricing. Real possibilities.<span>1-800 CASH FOR CARS</span></div>
      </div>
    </main> : <main className={styles.ownerMain}>
      <div className={styles.ownerHeading}><div><span className={styles.eyebrow}>BEHIND THE CUSTOMER EXPERIENCE</span><h1 ref={heading} tabIndex={-1}>A better starting point<br />for your next <em>conversation.</em></h1><p>The seller gets clarity. Your team gets the details to act.</p></div><button type="button" className={styles.secondary} onClick={() => setView("seller")}>Back to seller experience <ArrowRight size={16} /></button></div>
      <div className={styles.ownerGrid}><section className={styles.leadCard}><div className={styles.sectionHeader}><h2>What your team receives</h2><span className={styles.demoPill}>DEMO LEAD</span></div>
        {lead ? <><div className={styles.leadTop}><span className={styles.avatar}>{lead.contact.fullName.trim().slice(0,1).toUpperCase()}</span><div><h3>{lead.contact.fullName}</h3><p>{lead.contact.phone}</p></div><span className={styles.statusBadge}>{leadStatus}</span></div><dl className={styles.leadDetails}><div><dt>Vehicle</dt><dd>{lead.vehicle.year} {lead.vehicle.make} {lead.vehicle.model}</dd></div><div><dt>Estimate shown</dt><dd>{lead.result.status === "range" ? `${MONEY.format(lead.result.lower)} – ${MONEY.format(lead.result.upper)} (fictional)` : "Manual review requested"}</dd></div><div><dt>Running condition</dt><dd>{runningOptions.find(o => o.value === lead.vehicle.running)?.label}</dd></div><div><dt>Body / mileage</dt><dd>{conditionOptions.find(o => o.value === lead.vehicle.condition)?.label} · {mileageOptions.find(o => o.value === lead.vehicle.mileage)?.label} miles</dd></div><div><dt>Ownership</dt><dd>{ownershipOptions.find(o => o.value === lead.vehicle.ownership)?.label}</dd></div><div><dt>Pickup</dt><dd>{lead.contact.street}<br />{lead.contact.city}, CA {lead.vehicle.zip}</dd></div><div><dt>Preferred time</dt><dd>{lead.contact.timing}</dd></div>{lead.contact.notes ? <div><dt>Seller notes</dt><dd className={styles.preserveLines}>{lead.contact.notes}</dd></div> : null}</dl><div className={styles.ownerActions}>{["New request", "Contacted", "Pickup discussed"].map(status => <button type="button" key={status} aria-pressed={leadStatus === status} onClick={() => setLeadStatus(status)}>{leadStatus === status ? <Check size={13} /> : null}{status}</button>)}</div><p className={styles.helper}>Status changes stay in this presentation. No customer is contacted.</p></> : <div className={styles.emptyLead}><ClipboardCheck size={38} /><h3>Try a seller journey first.</h3><p>Complete a sample request to see its vehicle details, estimate, contact information and notes here.</p><button type="button" className={styles.primary} onClick={() => { loadScenario(0); }}>Start a sample journey <ArrowRight size={16} /></button></div>}
      </section><div className={styles.ownerAside}><section className={styles.controlCard}><span className={styles.eyebrow}>YOUR BUSINESS. YOUR RULES.</span><h2>You stay in control<br />of the final offer.</h2><ul><li><CircleDollarSign size={20} /><span><strong>Set buying rules</strong>Use your actual purchase history, resale options and target margins.</span></li><li><Truck size={20} /><span><strong>Account for pickup</strong>Include distance, towing and vehicle access in the decision.</span></li><li><MessageSquareText size={20} /><span><strong>Keep a human in the loop</strong>Route uncertain condition or paperwork to your team.</span></li></ul><p>These are the proposed production controls. This prototype uses fictional rules.</p></section><section className={styles.pilotCard}><h3>What we’d measure in a pilot</h3><div><span>Estimate completion</span><ArrowRight size={13} /><span>Qualified requests</span><ArrowRight size={13} /><span>Vehicles purchased</span></div><p>Connect outcomes to ad spend, then improve based on profitable purchases.</p></section></div></div>
    </main>}
    <footer className={styles.footer}><span>1-800 CASH FOR CARS <span> / </span> ESTIMATE EXPERIENCE</span><span>Private concept · Sample data only</span></footer>
  </div>;
}
