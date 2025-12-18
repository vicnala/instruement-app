import { useTranslations } from "next-intl";
import Section from "../Section";

export default function ConsentSection({ consent, handleConsentChange }: { consent: { terms: boolean, privacy: boolean }, handleConsentChange: (field: 'terms' | 'privacy') => void }  ): JSX.Element {
    const t = useTranslations('components.ConsentSection');
  
    return (
      <Section>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                name="terms-of-use"
                type="checkbox"
                checked={consent.terms}
                onChange={() => handleConsentChange('terms')}
                className="w-4 h-4 text-it-500 rounded focus:ring-it-500"
                aria-label={t('terms_consent')}
              />
              <span className="text-sm text-scope-700">
                {t('i_accept')} <a href="https://instruement.com/terms-of-use/" className="text-it-500 hover:text-it-700 underline" target="_blank" rel="noopener noreferrer">{t('terms_of_use')}</a>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                name="privacy-policy"
                type="checkbox"
                checked={consent.privacy}
                onChange={() => handleConsentChange('privacy')}
                className="w-4 h-4 text-it-500 rounded focus:ring-it-500"
                aria-label={t('privacy_consent')}
              />
              <span className="text-sm text-scope-700">
                {t('i_accept')} <a href="https://instruement.com/privacy-policy/" className="text-it-500 hover:text-it-700 underline" target="_blank" rel="noopener noreferrer">{t('privacy_policy')}</a>
              </span>
          </label>
      </Section>
    );
  }