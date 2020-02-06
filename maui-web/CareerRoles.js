import React from 'react';
import { Header, Text } from '../dash-ui';

const CareerRoles = {
  'senior-swe': {
    roleName: 'Senior Software Engineer',
    renderContent: () => {
      return (
        <React.Fragment>
          <Text>Body paragraph...</Text>
        </React.Fragment>
      );
    },
  },
  'mobile-swe': {
    roleName: 'Mobile Software Engineer',
    renderContent: () => {
      return (
        <React.Fragment>
          <Text>Body paragraph...</Text>
        </React.Fragment>
      );
    },
  },
};
export default CareerRoles;
