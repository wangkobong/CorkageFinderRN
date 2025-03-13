import React from 'react';
import { Text, View, StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native';

interface SectionHeaderProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ children, style, containerStyle }) => {
  return (
    <Text style={[styles.header, style]}>{children}</Text>

  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: 600,
  },
});

export default SectionHeader; 