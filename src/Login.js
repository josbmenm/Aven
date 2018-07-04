import React from 'react';
import { withA } from './aContext';
import { Page, Title, Form, FormInput, FormSubmit } from './common';

class LoginWithA extends React.Component {
  render() {
    const { navigation, aven } = this.props;
    return (
      <Page>
        <Title>Login</Title>
        <Form
          onSubmit={() => {
            aven.login;
            debugger;
          }}
          render={({ createField }) => (
            <React.Fragment>
              <FormInput
                label="Username or Phone or Email"
                field={createField('authName')}
              />
              <FormSubmit />
            </React.Fragment>
          )}
        />
      </Page>
    );
  }
}

const Login = withA(LoginWithA);

Login.title = 'Login';

export default Login;
