import SimpleHome from './SimpleHome';
import HelloWorld from './HelloWorld';
import FullHome from './FullHome';
import Task from './Task';

const FullAppRoutes = {
  Home: {
    screen: FullHome,
    path: '',
  },
};

const SimpleAppRoutes = {
  Home: {
    screen: SimpleHome,
    path: '',
  },
};

const HelloWorldRoutes = {
  Home: HelloWorld,
};

// export default HelloWorldRoutes;
export default SimpleAppRoutes;
// export default FullAppRoutes;
