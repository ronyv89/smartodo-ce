import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import SmarTodoLogo from '@/assets/icons/SmarTodoLogo';

export default function LandingPage() {
  return (
    <Box className="flex-1 bg-background-0 items-center justify-center px-8">
      <Box testID="landing-logo-container" className="items-center gap-3 mb-16">
        <SmarTodoLogo />
        <Text className="text-typography-500 text-base text-center mt-2">
          Smart task management, simplified.
        </Text>
      </Box>

      <Box className="w-full gap-4">
        <Button
          testID="signup-button"
          size="xl"
          className="bg-primary-500 rounded-xl w-full"
        >
          <ButtonText className="text-white font-semibold text-base">Sign Up</ButtonText>
        </Button>

        <Button
          testID="login-button"
          size="xl"
          variant="outline"
          className="rounded-xl w-full border-primary-500"
        >
          <ButtonText className="text-primary-500 font-semibold text-base">Log In</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
