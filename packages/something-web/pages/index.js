import { Button } from '@aven-cloud/dash';
import { View } from 'react-native';

function Home() {
  return (
    <div>
      <View style={{ flex: 1, backgroundColor: 'blue' }}>
        <Button />
        <h1>Welcome to Next.js!</h1>
      </View>
    </div>
  );
}

export default Home;
