import { Text } from 'react-native';

export const SectionHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text style={{ fontSize: 18, fontWeight: 600 }}>{children}</Text>
  );
};

export default SectionHeader; 