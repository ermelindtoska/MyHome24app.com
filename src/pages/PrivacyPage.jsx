import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaFilePdf, FaExternalLinkAlt, FaBuilding } from 'react-icons/fa';

const Datenschutz = () => {
  const { t } = useTranslation('privacy');

  const dataTypes = [
    t('dataType1'),
    t('dataType2'),
    t('dataType3'),
    t('dataType4'),
    t('dataType5'),
  ];

  const rights = [
    t('rightAccess'),
    t('rightCorrection'),
    t('rightDeletion'),
    t('rightRestriction'),
    t('rightObjection'),
    t('rightPortability'),
  ];

  const thirdParties = [
    t('thirdParty1'),
    t('thirdParty2'),
    t('thirdParty3'),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <section className="mb-10 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-500/10 p-6 md:p-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
                <FaShieldAlt className="mr-2 text-[10px]" />
                {t('title')}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                {t('title')}
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                {t('description')}
              </p>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {t('details')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <LegalCard title={t('introTitle', { defaultValue: t('title') })}>
            <p>{t('intro')}</p>
          </LegalCard>

          <LegalCard
            title={t('responsibleTitle')}
            icon={<FaBuilding className="text-blue-600 dark:text-blue-300" />}
          >
            <p>{t('responsibleText')}</p>
          </LegalCard>

          <LegalCard title={t('dataTypesTitle')}>
            <ul className="space-y-2">
              {dataTypes.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </LegalCard>

          <LegalCard title={t('usePurposeTitle')}>
            <p>{t('usePurposeText')}</p>
          </LegalCard>

          <LegalCard title={t('legalBasisTitle')}>
            <p>{t('legalBasisText')}</p>
          </LegalCard>

          <LegalCard title={t('dataSharingTitle')}>
            <p>{t('dataSharingText')}</p>
          </LegalCard>

          <LegalCard title={t('thirdPartyTitle')}>
            <p className="mb-4">{t('thirdPartyText')}</p>
            <ul className="space-y-2">
              {thirdParties.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </LegalCard>

          <LegalCard title={t('cookiesTitle')}>
            <p>{t('cookiesText')}</p>
          </LegalCard>

          <LegalCard title={t('rightsTitle')}>
            <ul className="space-y-2">
              {rights.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </LegalCard>

          <LegalCard title={t('contactTitle')}>
            <p>{t('contactText')}</p>
          </LegalCard>
        </section>

        <section className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {t('downloadsTitle')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t('downloadsText')}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <a
              href="/impressum"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t('toImpressum')}
            </a>

            <a
              href="/files/MyHome24App_Datenschutzerklaerung.pdf"
              download
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <FaFilePdf className="mr-2" />
              {t('downloadPdfDe')}
            </a>

            <a
              href="/files/MyHome24App_PrivacyPolicy_EN.pdf"
              download
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <FaFilePdf className="mr-2" />
              {t('downloadPdfEn')}
            </a>

            <a
              href="https://www.bfdi.bund.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <FaExternalLinkAlt className="mr-2" />
              {t('externalAuthority')}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

function LegalCard({ title, children, icon = null }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-6">
      <div className="mb-4 flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/70">
            {icon}
          </div>
        )}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h2>
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 md:text-base">
        {children}
      </div>
    </section>
  );
}

export default Datenschutz;