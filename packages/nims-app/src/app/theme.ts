import { createTheme, type CSSVariablesResolver } from '@mantine/core';

/** Shared stronger border for all editable controls (dark + light). */
const fieldBorder = {
  borderWidth: 1,
  borderColor: 'var(--mantine-color-default-border)',
} as const;

export const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Textarea: {
      defaultProps: {
        size: 'md',
        autosize: false,
        rows: 5,
      },
      styles: {
        input: {
          fontSize: '1rem',
          lineHeight: 1.55,
          minHeight: '7rem',
          ...fieldBorder,
        },
      },
    },
    Input: {
      styles: {
        input: {
          ...fieldBorder,
        },
      },
    },
    TextInput: {
      styles: {
        input: fieldBorder,
      },
    },
    Select: {
      styles: {
        input: fieldBorder,
      },
    },
    MultiSelect: {
      styles: {
        input: fieldBorder,
        pillsList: {
          borderColor: 'var(--mantine-color-default-border)',
        },
      },
    },
    TagsInput: {
      styles: {
        input: fieldBorder,
      },
    },
    NativeSelect: {
      styles: {
        input: fieldBorder,
      },
    },
    NumberInput: {
      styles: {
        input: fieldBorder,
      },
    },
    PasswordInput: {
      styles: {
        input: fieldBorder,
      },
    },
    Checkbox: {
      styles: {
        input: {
          borderWidth: 1.5,
          borderColor: 'var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        },
        label: {
          fontSize: 'var(--mantine-font-size-sm)',
        },
      },
    },
    Radio: {
      styles: {
        radio: {
          borderWidth: 1.5,
          borderColor: 'var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        },
      },
    },
    SegmentedControl: {
      styles: {
        root: {
          border: '1px solid var(--mantine-color-default-border)',
        },
      },
    },
  },
});

/** Dark theme borders are nearly invisible by default — bump contrast a notch. */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-default-border': 'var(--mantine-color-gray-4)',
  },
  dark: {
    // dark-3 was still weak on checkboxes; dark-2 reads clearly against body
    '--mantine-color-default-border': 'var(--mantine-color-dark-2)',
    '--input-bd': 'var(--mantine-color-dark-2)',
    '--checkbox-color': 'var(--mantine-color-dark-2)',
  },
});
