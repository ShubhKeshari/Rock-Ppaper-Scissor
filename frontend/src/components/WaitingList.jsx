import { Box, Text } from '@chakra-ui/react';

const WaitingList = () => {
  return (
    <Box mt={4} bg="white" p={6} borderRadius="md" boxShadow="md">
      <Text fontSize="xl">Waiting for an available opponent...</Text>
    </Box>
  );
};

export default WaitingList;
