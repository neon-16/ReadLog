import { Eye, EyeOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  passwordToggle?: boolean;
}

export default function Input({ label, error, passwordToggle = false, ...props }: InputProps) {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(Boolean(props.secureTextEntry));

  useEffect(() => {
    setIsSecureTextEntry(Boolean(props.secureTextEntry));
  }, [props.secureTextEntry]);

  const secureTextEntry = passwordToggle ? isSecureTextEntry : props.secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, passwordToggle && styles.inputWithToggle, error && styles.inputError]}
          placeholderTextColor="#9CA3AF"
          {...props}
          secureTextEntry={secureTextEntry}
        />
        {passwordToggle && (
          <Pressable
            style={styles.toggleButton}
            onPress={() => setIsSecureTextEntry((current) => !current)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isSecureTextEntry ? 'Show password' : 'Hide password'}
          >
            {isSecureTextEntry ? <Eye size={18} color="#6B7280" /> : <EyeOff size={18} color="#6B7280" />}
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});
