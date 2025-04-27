import { Button } from './components/ui/button'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import RestaurantMenu from './components/Menu';

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>  <div className="flex flex-col items-center justify-center min-h-svh">
        <Button>Click me</Button>
        <RestaurantMenu restaurant='680d1e70dde8ed356706c096' />
      </div>
      </QueryClientProvider>
    </>
  )
}

export default App
