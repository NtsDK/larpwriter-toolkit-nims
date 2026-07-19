import {
  Stack, TextInput, Select, MultiSelect, Checkbox, NumberInput, Text,
} from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';

export interface ProfileFieldDef {
  name: string;
  type: string;
  value?: unknown;
  playerAccess?: string;
}

interface ProfileFieldsFormProps {
  structure: ProfileFieldDef[];
  profile: Record<string, unknown>;
  entityKey: string;
  /** When set, only fields with playerAccess === 'write' are editable. */
  respectPlayerAccess?: boolean;
  /** Organizer edit lock — when false, all fields read-only. */
  canEdit?: boolean;
  emptyText?: string;
  onChange: (fieldName: string, itemType: string, value: unknown) => void | Promise<void>;
}

export function ProfileFieldsForm({
  structure,
  profile,
  entityKey,
  respectPlayerAccess = false,
  canEdit = true,
  emptyText = 'Нет полей.',
  onChange,
}: ProfileFieldsFormProps) {
  if (!structure.length) {
    return <Text c="dimmed" size="sm">{emptyText}</Text>;
  }

  return (
    <Stack gap="md">
      {structure.map((field) => {
        const value = profile[field.name];
        const writable = canEdit && (!respectPlayerAccess || field.playerAccess === 'write');
        const fieldKey = `${entityKey}-${field.name}`;
        const readHint = respectPlayerAccess && !writable ? 'Только чтение' : undefined;

        if (field.type === 'text') {
          return (
            <Textarea
              key={fieldKey}
              label={field.name}
              defaultValue={String(value ?? '')}
              rows={4}
              readOnly={!writable}
              description={readHint}
              onBlur={(e) => {
                if (writable && e.currentTarget.value !== String(value ?? '')) {
                  void onChange(field.name, field.type, e.currentTarget.value);
                }
              }}
            />
          );
        }
        if (field.type === 'string') {
          return (
            <TextInput
              key={fieldKey}
              label={field.name}
              defaultValue={String(value ?? '')}
              readOnly={!writable}
              description={readHint}
              onBlur={(e) => {
                if (writable && e.currentTarget.value !== String(value ?? '')) {
                  void onChange(field.name, field.type, e.currentTarget.value);
                }
              }}
            />
          );
        }
        if (field.type === 'checkbox') {
          return (
            <Checkbox
              key={fieldKey}
              label={field.name}
              checked={!!value}
              disabled={!writable}
              onChange={(e) => {
                if (writable) void onChange(field.name, field.type, e.currentTarget.checked);
              }}
            />
          );
        }
        if (field.type === 'number') {
          return (
            <NumberInput
              key={fieldKey}
              label={field.name}
              defaultValue={typeof value === 'number' ? value : Number(value) || 0}
              readOnly={!writable}
              description={readHint}
              onBlur={(e) => {
                if (writable) {
                  void onChange(field.name, field.type, Number(e.currentTarget.value) || 0);
                }
              }}
            />
          );
        }
        if (field.type === 'enum') {
          const options = field.value
            ? String(field.value).split(',').map((v) => v.trim()).filter(Boolean)
            : [];
          return (
            <Select
              key={fieldKey}
              label={field.name}
              data={options}
              value={value != null && value !== '' ? String(value) : null}
              clearable={writable}
              disabled={!writable}
              description={readHint}
              onChange={(v) => {
                if (writable) void onChange(field.name, field.type, v || '');
              }}
            />
          );
        }
        if (field.type === 'multiEnum') {
          const options = field.value
            ? String(field.value).split(',').map((v) => v.trim()).filter(Boolean)
            : [];
          const selected = value
            ? String(value).split(',').map((v) => v.trim()).filter(Boolean)
            : [];
          return (
            <MultiSelect
              key={fieldKey}
              label={field.name}
              data={options}
              value={selected}
              disabled={!writable}
              description={readHint}
              onChange={(vals) => {
                if (writable) void onChange(field.name, field.type, vals.join(','));
              }}
            />
          );
        }
        return (
          <TextInput
            key={fieldKey}
            label={field.name}
            defaultValue={String(value ?? '')}
            readOnly={!writable}
            description={readHint}
            onBlur={(e) => {
              if (writable && e.currentTarget.value !== String(value ?? '')) {
                void onChange(field.name, field.type, e.currentTarget.value);
              }
            }}
          />
        );
      })}
    </Stack>
  );
}
