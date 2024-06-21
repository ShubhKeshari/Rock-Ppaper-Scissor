
import { Box, Button, Text, VStack, Heading } from '@chakra-ui/react';

const GameLobby = ({ players = [], socket, setWaiting }) => {
  const handleStartGame = (opponentId) => {
    socket.emit('startGame', opponentId);
    setWaiting(true);
  };

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="md">
      <Heading fontSize="2xl" mb={4}>Game Lobby</Heading>
      <VStack spacing={4}>
        {players.map(player => (
          <Box key={player.id} p={4} bg="gray.50" borderRadius="md" w="100%">
            <Text>{player.username}</Text>
            <Button onClick={() => handleStartGame(player.id)} colorScheme="pink" ml={2}>
              Play
            </Button>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default GameLobby;
