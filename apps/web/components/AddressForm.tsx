"use client";

import { useState, useCallback } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import Link from 'next/link';
import styles from './AddressForm.module.css';

export function AddressForm() {
  const { shippingAddress, setShippingAddress, setStep } = useCheckout();
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof shippingAddress, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof typeof shippingAddress, boolean>>>({});
  const [validFields, setValidFields] = useState<Partial<Record<keyof typeof shippingAddress, boolean>>>({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validators: Partial<Record<keyof typeof shippingAddress, (v: string) => string | null>> = {
    fullName: v => v.trim().length > 1 ? null : 'Full name is required',
    phoneNumber: v => /^\d{10}$/.test(v.replace(/\s/g, '')) ? null : 'Enter a valid 10-digit number',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address',
    addressLine1: v => v.trim().length > 2 ? null : 'Street address is required',
    city: v => v.trim().length > 0 ? null : 'City is required',
    state: v => v.trim().length > 0 ? null : 'State is required',
    pincode: v => /^\d{6}$/.test(v) ? null : 'Enter a valid 6-digit pincode',
    country: v => v.trim().length > 0 ? null : 'Country is required',
  };

  const handleChange = useCallback((field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    const validator = validators[field];
    if (validator) {
      const error = validator(value);
      setFormErrors(prev => {
        const next = { ...prev };
        if (error) next[field] = error; else delete next[field];
        return next;
      });
      setValidFields(prev => ({ ...prev, [field]: !error }));
    }
  }, [setShippingAddress]);

  const handleBlur = useCallback((field: keyof typeof shippingAddress) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const validator = validators[field];
    if (validator) {
      const value = shippingAddress[field] as string;
      const error = validator(value);
      setFormErrors(prev => {
        const next = { ...prev };
        if (error) next[field] = error; else delete next[field];
        return next;
      });
      setValidFields(prev => ({ ...prev, [field]: !error }));
    }
  }, [shippingAddress]);

  const validateAll = useCallback(() => {
    const errors: Partial<Record<keyof typeof shippingAddress, string>> = {};
    const valid: Partial<Record<keyof typeof shippingAddress, boolean>> = {};
    (Object.keys(validators) as Array<keyof typeof shippingAddress>).forEach(field => {
      const validator = validators[field];
      if (validator) {
        const error = validator(shippingAddress[field] as string);
        if (error) errors[field] = error;
        valid[field] = !error;
      }
    });
    setFormErrors(errors);
    setValidFields(valid);
    setTouchedFields(Object.fromEntries(Object.keys(validators).map(k => [k, true])));
    return Object.keys(errors).length === 0;
  }, [shippingAddress]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('payment');
    } catch (error) {
      console.error('Address submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAll, isSubmitting, setStep]);

  const inputClass = (field: keyof typeof shippingAddress) => {
    const base = styles.input;
    if (touchedFields[field] && formErrors[field]) return `${base} ${styles.inputError}`;
    if (validFields[field]) return `${base} ${styles.inputValid}`;
    return base;
  };

  return (
    <div className={styles.page}>
      {/* Progress stepper */}
      <div className={styles.stepper}>
        {['Cart', 'Address', 'Payment', 'Review'].map((label, i) => (
          <div key={label} className={styles.stepGroup}>
            {i > 0 && <div className={styles.stepLine} />}
            <div className={`${styles.step} ${i === 0 ? styles.stepDone : i === 1 ? styles.stepActive : ''}`}>
              <div className={styles.stepNum}>
                {i === 0 ? '✓' : i + 1}
              </div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.card} noValidate>
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>Delivery address</h1>
          <p className={styles.cardSub}>Where should we send your order?</p>
        </div>

        {/* Contact section */}
        <p className={styles.sectionLabel}>Contact</p>

        <div className={styles.field}>
          <label htmlFor="fullName">Full name</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>👤</span>
            <input
              type="text"
              id="fullName"
              className={inputClass('fullName')}
              value={shippingAddress.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="Your full name"
              autoComplete="name"
            />
            {validFields.fullName && <span className={styles.validCheck}>✓</span>}
          </div>
          {touchedFields.fullName && formErrors.fullName && (
            <p className={styles.errorText}>{formErrors.fullName}</p>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="phoneNumber">Phone number</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>📞</span>
              <input
                type="tel"
                id="phoneNumber"
                className={inputClass('phoneNumber')}
                value={shippingAddress.phoneNumber}
                onChange={e => handleChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="10-digit number"
                autoComplete="tel"
              />
              {validFields.phoneNumber && <span className={styles.validCheck}>✓</span>}
            </div>
            {touchedFields.phoneNumber && formErrors.phoneNumber && (
              <p className={styles.errorText}>{formErrors.phoneNumber}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email address</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>✉️</span>
              <input
                type="email"
                id="email"
                className={inputClass('email')}
                value={shippingAddress.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@email.com"
                autoComplete="email"
              />
              {validFields.email && <span className={styles.validCheck}>✓</span>}
            </div>
            {touchedFields.email && formErrors.email && (
              <p className={styles.errorText}>{formErrors.email}</p>
            )}
          </div>
        </div>

        <div className={styles.divider} />

        {/* Address section */}
        <p className={styles.sectionLabel}>Delivery location</p>

        <div className={styles.field}>
          <label htmlFor="addressLine1">Address line 1</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>📍</span>
            <input
              type="text"
              id="addressLine1"
              className={inputClass('addressLine1')}
              value={shippingAddress.addressLine1}
              onChange={e => handleChange('addressLine1', e.target.value)}
              onBlur={() => handleBlur('addressLine1')}
              placeholder="House no., street name"
              autoComplete="address-line1"
            />
            {validFields.addressLine1 && <span className={styles.validCheck}>✓</span>}
          </div>
          {touchedFields.addressLine1 && formErrors.addressLine1 && (
            <p className={styles.errorText}>{formErrors.addressLine1}</p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="addressLine2">
            Address line 2 <span className={styles.optional}>optional</span>
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>🏢</span>
            <input
              type="text"
              id="addressLine2"
              className={styles.input}
              value={shippingAddress.addressLine2}
              onChange={e => handleChange('addressLine2', e.target.value)}
              placeholder="Apartment, floor, suite"
              autoComplete="address-line2"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="landmark">
            Landmark <span className={styles.optional}>optional</span>
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>📌</span>
            <input
              type="text"
              id="landmark"
              className={styles.input}
              value={shippingAddress.landmark}
              onChange={e => handleChange('landmark', e.target.value)}
              placeholder="Nearby landmark"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="city">City</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🏙️</span>
              <input
                type="text"
                id="city"
                className={inputClass('city')}
                value={shippingAddress.city}
                onChange={e => handleChange('city', e.target.value)}
                onBlur={() => handleBlur('city')}
                placeholder="Your city"
                autoComplete="address-level2"
              />
              {validFields.city && <span className={styles.validCheck}>✓</span>}
            </div>
            {touchedFields.city && formErrors.city && (
              <p className={styles.errorText}>{formErrors.city}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="state">State</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🗺️</span>
              <input
                type="text"
                id="state"
                className={inputClass('state')}
                value={shippingAddress.state}
                onChange={e => handleChange('state', e.target.value)}
                onBlur={() => handleBlur('state')}
                placeholder="Your state"
                autoComplete="address-level1"
              />
              {validFields.state && <span className={styles.validCheck}>✓</span>}
            </div>
            {touchedFields.state && formErrors.state && (
              <p className={styles.errorText}>{formErrors.state}</p>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="pincode">Pincode</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>#</span>
              <input
                type="text"
                id="pincode"
                className={inputClass('pincode')}
                value={shippingAddress.pincode}
                onChange={e => handleChange('pincode', e.target.value)}
                onBlur={() => handleBlur('pincode')}
                placeholder="6-digit pincode"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
              />
              {validFields.pincode && <span className={styles.validCheck}>✓</span>}
            </div>
            {touchedFields.pincode && formErrors.pincode && (
              <p className={styles.errorText}>{formErrors.pincode}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="country">Country</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🌐</span>
              <input
                type="text"
                id="country"
                className={inputClass('country')}
                value={shippingAddress.country}
                onChange={e => handleChange('country', e.target.value)}
                onBlur={() => handleBlur('country')}
                placeholder="India"
                autoComplete="country-name"
              />
              {validFields.country && <span className={styles.validCheck}>✓</span>}
            </div>
            {touchedFields.country && formErrors.country && (
              <p className={styles.errorText}>{formErrors.country}</p>
            )}
          </div>
        </div>

        <label className={styles.saveRow} htmlFor="saveAddr">
          <input
            type="checkbox"
            id="saveAddr"
            checked={saveAddress}
            onChange={e => setSaveAddress(e.target.checked)}
          />
          <span><strong>Save address</strong> for future orders</span>
        </label>

        <div className={styles.actions}>
          <Link href="/" className={styles.backBtn}>
            ← Cart
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${styles.continueBtn} ${isSubmitting ? styles.loading : ''}`}
          >
            {isSubmitting ? 'Saving…' : 'Continue to payment →'}
          </button>
        </div>
      </form>
    </div>
  );
}