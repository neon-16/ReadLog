import { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'cancel';
  icon?: ReactNode;
  children: string;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  onPress,
  variant = 'primary',
  icon,
  children,
  disabled = false,
  testID,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <Pressable 
      style={[
        styles.button, 
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'cancel' && styles.cancel,
        disabled && styles.disabled,
        style,
      ]} 
      onPress={onPress}
      disabled={disabled}
      testID={testID}
    >
      {icon}
      <Text style={[
        styles.text,
        variant === 'primary' && styles.primaryText,
        variant === 'secondary' && styles.secondaryText,
        variant === 'danger' && styles.dangerText,
        variant === 'cancel' && styles.cancelText,
        textStyle,
      ]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: {
    backgroundColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  danger: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  cancel: {
    backgroundColor: '#F3F4F6',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#2563EB',
  },
  dangerText: {
    color: '#DC2626',
  },
  cancelText: {
    color: '#374151',
  },
});
