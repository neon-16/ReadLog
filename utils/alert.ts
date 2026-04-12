import { Alert } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

// Check if running in browser
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export function showAlert(
  title: string,
  message: string,
  buttons: AlertButton[] = [{ text: 'OK' }]
) {
  // Use direct browser detection instead of Platform.OS
  if (isWeb) {
    // Web-compatible implementation
    const buttonTexts = buttons.map(b => b.text).join(' / ');
    const userChoice = window.confirm(`${title}\n\n${message}\n\n[${buttonTexts}]`);
    
    if (userChoice) {
      // Find first non-cancel button and execute
      const actionButton = buttons.find(b => b.style !== 'cancel');
      if (actionButton?.onPress) {
        actionButton.onPress();
      }
    } else {
      // Find cancel button
      const cancelButton = buttons.find(b => b.style === 'cancel');
      if (cancelButton?.onPress) {
        cancelButton.onPress();
      }
    }
  } else {
    // Native implementation
    Alert.alert(title, message, buttons);
  }
}

export function showActionSheet(
  title: string,
  message: string,
  options: AlertButton[]
) {
  // Use direct browser detection instead of Platform.OS
  if (isWeb) {
    // Create text representation of all options
    const actionOptions = options.filter(opt => opt.style !== 'cancel');
    const optionsList = actionOptions
      .map((opt, idx) => `${idx + 1}. ${opt.text}`)
      .join('\n');
    
    const prompt = `${title}\n\n${message}\n\n${optionsList}\n\nEnter number (1-${actionOptions.length}) or cancel:`;
    const userInput = window.prompt(prompt);
    
    if (userInput && userInput.trim()) {
      const choiceIndex = parseInt(userInput, 10) - 1;
      const selectedOption = actionOptions[choiceIndex];
      
      if (selectedOption?.onPress) {
        selectedOption.onPress();
      } else {
        // Invalid choice - show message
        window.alert(`Invalid choice. Please enter a number between 1 and ${actionOptions.length}`);
      }
    }
  } else {
    // Native implementation
    Alert.alert(title, message, options);
  }
}
