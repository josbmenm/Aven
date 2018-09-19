import React from 'react';
import { withA } from './aContext';
import { View, Text, ScrollView, TouchableHighlight } from 'react-native';
import {
  HeaderButton,
  Button,
  Page,
  Title,
  Form,
  FormInput,
  FormSubmit,
  Sidebar,
  SidebarLink,
  Colors,
} from './common';
import Avatar from '@material-ui/core/Avatar';
import AppBar from '@material-ui/core/AppBar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import withNavigation from '@react-navigation/core/lib/withNavigation';
import DraftsIcon from '@material-ui/icons/Drafts';
import PeopleIcon from '@material-ui/icons/People';
import FolderIcon from '@material-ui/icons/Folder';
import SettingsIcon from '@material-ui/icons/Settings';

import { createSwitchNavigator } from '@react-navigation/core';
const Icon = ({ name }) => (
  <i
    className={`fas fa-${name}`}
    style={{ color: Colors.header, marginRight: 15, fontSize: 32 }}
  />
);

const DashboardPage = ({ children, title, icon, headerRight }) => (
  <View style={{ flex: 1 }}>
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography variant="title" color="inherit">
          {title}
        </Typography>
        <View style={{ flex: 1 }} />
        {headerRight}
      </Toolbar>
    </AppBar>
    {children}
  </View>
);

const AccountCreatePage = () => (
  <DashboardPage
    title="Create Account"
    icon={<PeopleIcon />}
    headerRight={null}
  />
);

const SettingsPageA = ({ navigation, aven }) => (
  <DashboardPage title="Settings" icon={<SettingsIcon />} headerRight={null}>
    <Button
      title="Log out"
      onPress={async () => {
        await aven.logout();
        navigation.navigate('home');
      }}
    />
  </DashboardPage>
);
const SettingsPage = withA(SettingsPageA);

const FilesPage = () => (
  <DashboardPage
    title="Files"
    icon={<FolderIcon />}
    headerRight={
      <React.Fragment>
        <HeaderButton title="New file" />
        <HeaderButton title="Info" />
      </React.Fragment>
    }
  >
    <Title>Files</Title>
  </DashboardPage>
);

const AccountPageNav = ({ navigation }) => (
  <DashboardPage
    title={`Account - ${navigation.getParam('id')}`}
    icon={<Avatar className="">HY</Avatar>}
    headerRight={
      <React.Fragment>
        <HeaderButton title="Reset Password" />
        <HeaderButton title="Delete Account" />
      </React.Fragment>
    }
  >
    <Title>Account</Title>
  </DashboardPage>
);
const AccountPage = withNavigation(AccountPageNav);
AccountPage.path = 'account/:id';

const AccountListItemNav = ({ account, navigation }) => {
  return (
    <TouchableHighlight
      onPress={() => {
        navigation.navigate('account', { id: account.name });
      }}
      style={{
        alignSelf: 'stretch',
      }}
    >
      <View
        style={{
          padding: 10,
          alignSelf: 'stretch',
          flexDirection: 'row',
          backgroundColor: Colors.page,
        }}
      >
        <Avatar className="">HY</Avatar>
        <Text style={{ fontSize: 26, marginHorizontal: 15, marginVertical: 3 }}>
          {account.name}
        </Text>
      </View>
    </TouchableHighlight>
  );
};
const AccountListItem = withNavigation(AccountListItemNav);

class AccountList extends React.Component {
  render() {
    return (
      <View>
        {Array(50)
          .fill(null)
          .map((a, i) => (
            <AccountListItem key={i} account={{ name: 'Henry Young' }} />
          ))}
      </View>
    );
  }
}

const AccountsPage = ({ navigation }) => (
  <DashboardPage
    title="Accounts"
    icon={<PeopleIcon />}
    headerRight={
      <React.Fragment>
        <HeaderButton
          title="New Account"
          onPress={() => navigation.navigate('account-create')}
        />
      </React.Fragment>
    }
  >
    <AccountList />
  </DashboardPage>
);

const DashNavigator = createSwitchNavigator({
  accounts: AccountsPage,
  files: FilesPage,
  account: AccountPage,
  'account-create': AccountCreatePage,
  settings: SettingsPage,
});

class DashboardWithA extends React.Component {
  render() {
    const { navigation, aven } = this.props;
    return (
      <Page>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <Sidebar>
            <SidebarLink
              title={'Settings'}
              to={'settings'}
              icon={<SettingsIcon />}
            />
            <SidebarLink
              title={'Accounts'}
              to={'accounts'}
              icon={<PeopleIcon />}
            />
            <SidebarLink title={'Files'} to={'files'} icon={<FolderIcon />} />
          </Sidebar>
          <DashNavigator navigation={navigation} />
        </View>
      </Page>
    );
  }
}

const Dashboard = withA(DashboardWithA);

Dashboard.title = 'Dashboard';
Dashboard.router = DashNavigator.router;

export default Dashboard;
