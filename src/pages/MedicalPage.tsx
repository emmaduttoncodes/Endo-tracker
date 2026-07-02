import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { BloodTestsSection } from './medical/BloodTestsSection';
import { AppointmentsSection } from './medical/AppointmentsSection';
import { MedicationsSection } from './medical/MedicationsSection';

type Section = 'appointments' | 'bloodTests' | 'medications';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'appointments', label: 'Appointments' },
  { id: 'bloodTests', label: 'Blood tests' },
  { id: 'medications', label: 'Medications' },
];

export function MedicalPage() {
  const [section, setSection] = useState<Section>('appointments');

  return (
    <>
      <PageHeader eyebrow="Medical" title="Medical records" />
      <div className="section-nav">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`section-nav__item${section === s.id ? ' active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {section === 'appointments' && <AppointmentsSection />}
      {section === 'bloodTests' && <BloodTestsSection />}
      {section === 'medications' && <MedicationsSection />}
    </>
  );
}
