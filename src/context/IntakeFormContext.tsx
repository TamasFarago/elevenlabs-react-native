import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type IntakeFormField =
  | 'name'
  | 'email'
  | 'company'
  | 'phone'
  | 'service'
  | 'budget'
  | 'notes';

export type IntakeFormValues = Record<IntakeFormField, string>;

const defaultValues: IntakeFormValues = {
  name: '',
  email: '',
  company: '',
  phone: '',
  service: '',
  budget: '',
  notes: '',
};

type IntakeFormContextValue = {
  values: IntakeFormValues;
  updateField: (field: IntakeFormField, value: string) => void;
  bulkUpdate: (payload: Partial<IntakeFormValues>) => void;
  resetForm: () => void;
  submitForm: (options?: { source?: string }) => { submittedAt: string };
  lastSubmittedPayload?: IntakeFormValues;
  submittedAt?: string;
};

const IntakeFormContext = createContext<IntakeFormContextValue | null>(null);

const sanitizeValue = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : '';

export const IntakeFormProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [values, setValues] = useState<IntakeFormValues>(defaultValues);
  const [submittedAt, setSubmittedAt] = useState<string | undefined>();
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState<
    IntakeFormValues | undefined
  >(undefined);

  const updateField = useCallback((field: IntakeFormField, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: sanitizeValue(value),
    }));
  }, []);

  const bulkUpdate = useCallback((payload: Partial<IntakeFormValues>) => {
    if (!payload || typeof payload !== 'object') {
      return;
    }

    setValues((prev) => {
      const next: IntakeFormValues = { ...prev };

      Object.entries(payload).forEach(([rawField, rawValue]) => {
        const field = rawField as IntakeFormField;
        if (field in prev && rawValue !== undefined) {
          next[field] = sanitizeValue(rawValue);
        }
      });

      return next;
    });
  }, []);

  const resetForm = useCallback(() => {
    setValues({ ...defaultValues });
    setSubmittedAt(undefined);
  }, []);

  const submitForm = useCallback(
    (options?: { source?: string }) => {
      const snapshot: IntakeFormValues = { ...values };
      setLastSubmittedPayload(snapshot);
      const timestamp = new Date().toISOString();
      setSubmittedAt(timestamp);

      return {
        submittedAt: timestamp,
        source: options?.source ?? 'manual',
      };
    },
    [values],
  );

  const contextValue = useMemo<IntakeFormContextValue>(
    () => ({
      values,
      updateField,
      bulkUpdate,
      resetForm,
      submitForm,
      submittedAt,
      lastSubmittedPayload,
    }),
    [
      values,
      updateField,
      bulkUpdate,
      resetForm,
      submitForm,
      submittedAt,
      lastSubmittedPayload,
    ],
  );

  return (
    <IntakeFormContext.Provider value={contextValue}>
      {children}
    </IntakeFormContext.Provider>
  );
};

export const useIntakeForm = () => {
  const context = useContext(IntakeFormContext);
  if (!context) {
    throw new Error('useIntakeForm must be used within IntakeFormProvider');
  }

  return context;
};

