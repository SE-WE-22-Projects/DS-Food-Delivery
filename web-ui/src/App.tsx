import { Button } from './components/ui/button'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import RestaurantMenu from './components/Menu';
import CartMenu from './components/CartMenu';
import { NavigationMenu } from '@radix-ui/react-navigation-menu';
import { Toaster } from 'react-hot-toast';
const queryClient = new QueryClient();

function App() {
  return (
    <>
      <Toaster />
      <QueryClientProvider client={queryClient}>  <div className="flex flex-col items-center justify-center min-h-svh">
        <Button>Click me</Button>
        <NavigationMenu>
          <CartMenu />
        </NavigationMenu>

        <RestaurantMenu restaurant='680d1e70dde8ed356706c096' />
      </div>
      </QueryClientProvider>
    </>
  )
}

export default App
