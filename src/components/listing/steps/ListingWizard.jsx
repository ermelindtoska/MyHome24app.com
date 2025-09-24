// src/components/listing/ListingWizard.jsx
import React, { useState } from "react";
import StepInfo from "./steps/StepInfo";
// import StepLocation, StepPhotos, StepReview ...

export default function ListingWizard() {
  const [data, setData] = useState({});  // të gjitha fushat e listimit
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div>
      {step === 0 && (
        <StepInfo
          initial={data}
          onChange={(d) => setData((s) => ({ ...s, ...d }))}
          onNext={next}
        />
      )}

      {/* step === 1 => <StepLocation initial={data} onChange={...} onNext={next} onBack={back} /> ... */}
    </div>
  );
}
