import React, { useMemo } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  IntakeFormField,
  IntakeFormValues,
  useIntakeForm,
} from '@/src/context/IntakeFormContext';

type FieldConfig = {
  key: IntakeFormField;
  label: string;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
};

const FIELD_CONFIG: FieldConfig[] = [
  {
    key: 'name',
    label: 'Driver name',
    placeholder: 'Alex Driver',
  },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'alex@fleetco.com',
    keyboardType: 'email-address',
  },
  {
    key: 'company',
    label: 'Company / household',
    placeholder: 'Westside Leasing',
  },
  {
    key: 'phone',
    label: 'Phone',
    placeholder: '+1 (310) 555-0198',
    keyboardType: 'phone-pad',
  },
  {
    key: 'service',
    label: 'Vehicle interest',
    placeholder: 'Mid-size SUV, EV sedan…',
  },
  {
    key: 'budget',
    label: 'Target payment',
    placeholder: 'Max $700/mo or 36mo / 12k',
  },
  {
    key: 'notes',
    label: 'Notes',
    placeholder: 'Mileage needs, trade-ins, delivery timing…',
    multiline: true,
  },
];

const formatSummary = (values: IntakeFormValues) =>
  Object.entries(values).filter(([, value]) => value);

export const IntakeForm = () => {
  const {
    values,
    updateField,
    submitForm,
    resetForm,
    lastSubmittedPayload,
    submittedAt,
  } = useIntakeForm();

  const summary = useMemo(
    () =>
      lastSubmittedPayload ? formatSummary(lastSubmittedPayload) : undefined,
    [lastSubmittedPayload],
  );

  const handleSubmit = () => {
    submitForm({ source: 'manual' });
  };

  return (
    <View style={styles.container}>
      {FIELD_CONFIG.map((field) => (
        <View key={field.key} style={styles.fieldGroup}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            value={values[field.key]}
            placeholder={field.placeholder}
            onChangeText={(value) => updateField(field.key, value)}
            style={[
              styles.input,
              field.multiline && styles.multilineInput,
            ]}
            keyboardType={field.keyboardType}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
            autoCapitalize="sentences"
          />
        </View>
      ))}

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit form</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={resetForm}>
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </Pressable>
      </View>

      {submittedAt && (
        <Text style={styles.metaText}>
          Last submitted:{' '}
          {new Date(submittedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </Text>
      )}

      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Latest payload</Text>
          {summary.map(([key, value]) => (
            <View key={key} style={styles.summaryRow}>
              <Text style={styles.summaryKey}>{key}</Text>
              <Text style={styles.summaryValue}>{value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#0f172a',
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    width: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  metaText: {
    fontSize: 13,
    color: '#475569',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    backgroundColor: '#f8fafc',
  },
  summaryHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryKey: {
    fontSize: 12,
    color: '#475569',
    textTransform: 'capitalize',
  },
  summaryValue: {
    fontSize: 12,
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
  },
});

