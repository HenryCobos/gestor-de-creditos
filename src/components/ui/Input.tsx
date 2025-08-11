import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextInputProps,
  TouchableOpacity,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  required = false,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
  ];

  const textInputStyles = [
    styles.textInput,
    ...(leftIcon ? [styles.textInputWithLeftIcon] : []),
    ...(rightIcon ? [styles.textInputWithRightIcon] : []),
    ...(inputStyle ? [inputStyle] : []),
  ];

  return (
    <View style={containerStyles}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={textInputStyles}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9E9E9E"
          {...textInputProps}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 6,
  },
  
  required: {
    color: '#F44336',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  
  inputContainerFocused: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  
  inputContainerError: {
    borderColor: '#F44336',
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  
  textInputWithLeftIcon: {
    paddingLeft: 4,
  },
  
  textInputWithRightIcon: {
    paddingRight: 4,
  },
  
  leftIconContainer: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  rightIconContainer: {
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 4,
  },
  
  helperText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
});