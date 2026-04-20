import React from 'react';
import Svg, { Rect, Path, Text, TSpan } from 'react-native-svg';

const SmarTodoLogo = () => (
  <Svg width="220" height="60" viewBox="0 0 220 60" fill="none">
    {/* Icon: rounded square with checkmark */}
    <Rect width="56" height="56" x="2" y="2" rx="12" fill="#465fff" />
    <Path
      d="M17 30 L25 38 L39 22"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Wordmark */}
    <Text x="70" y="38" fontFamily="System" fontSize="28" fontWeight="700" fill="#465fff">
      <TSpan>smar</TSpan>
      <TSpan fill="#101828">TODO</TSpan>
    </Text>
  </Svg>
);

export default SmarTodoLogo;
