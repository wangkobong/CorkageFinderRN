import { Text } from 'react-native';

export const TitleText = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text style={{ fontSize: 30, fontWeight: 'bold' }}>{children}</Text>
  );
};

export default TitleText; 