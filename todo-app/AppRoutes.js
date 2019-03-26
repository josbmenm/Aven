import SimpleHome from './SimpleHome';
import HelloWorld from './HelloWorld';
import FullHome from './FullHome';
import Task from './Task';

const FullAppRoutes = {
  Home: {
    screen: FullHome,
    path: '',
  },
  Task: {
    screen: Task,
    path: 'task/:taskId',
  },
};

const SimpleAppRoutes = {
  Home: {
    screen: SimpleHome,
    path: '',
  },
  Task: {
    screen: Task,
    path: 'task/:taskId',
  },
};

const HelloWorldRoutes = {
  Home: HelloWorld,
};

let AppRoutes = HelloWorldRoutes;

AppRoutes = SimpleAppRoutes;

AppRoutes = FullAppRoutes;

export default AppRoutes;
