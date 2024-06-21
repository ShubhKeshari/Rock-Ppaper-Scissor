import React from 'react';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';

const Leaderboard = ({ players }) => {
  return (
    <Box mt={4} bg="white" p={6} borderRadius="md" boxShadow="md">
      <Heading fontSize="2xl">Leaderboard</Heading>
      <VStack spacing={2} mt={4}>
        {players.sort((a, b) => b.score - a.score).map((player, index) => (
          <Box key={player.id} p={2} bg="gray.50" borderRadius="md" w="100%">
            <Text>{index + 1}. {player.username}: {player.score}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Leaderboard;
